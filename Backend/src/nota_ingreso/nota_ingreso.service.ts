import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateNotaIngresoDto } from './dto/create-nota_ingreso.dto';
import { UpdateNotaIngresoDto } from './dto/update-nota_ingreso.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';

import { AlmacenService } from '../almacen/almacen.service';
import { ItemService } from '../item/item.service';
import { NotaIngreso } from './entities/nota_ingreso.entity';
import { DetalleIngreso } from '../detalle_ingreso/entities/detalle_ingreso.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NotaIngresoService {
  constructor(
    @InjectRepository(NotaIngreso)
    private readonly notaRepo: Repository<NotaIngreso>,
    private readonly almacenService: AlmacenService,
    private readonly itemService: ItemService,
  ) { }
  async create(dto: CreateNotaIngresoDto) {
    // 1. Validar Almacén
    const almacen = await this.almacenService.findOne(dto.almacenId);

    // 2. Validar Items (los códigos deben existir en el catálogo)
    const listaCodigos = dto.detalles.map((d) => d.productoId);
    await this.itemService.validarExistencia(listaCodigos);

    // 3. Crear la Nota con cascade (TypeORM guardará automáticamente los detalles)
    const nuevaNota = this.notaRepo.create({
      nroDocumento: dto.nroDocumento,
      origen: dto.origen,
      fechaIngreso: new Date(),
      usuario: 'WEB',
      estado: 0,
      almacen: almacen,
      detalles: dto.detalles.map((d) => ({
        codItem: d.productoId,
        cantidad: d.cantidad,
        lote: d.lote,
        fechaVencimiento: d.fechaVencimiento ? new Date(d.fechaVencimiento) : undefined,
        serie: d.serie,
      })) as DetalleIngreso[],
    });

    return await this.notaRepo.save(nuevaNota);
  }

  async findAll() {
    return await this.notaRepo.find({
      relations: ['almacen', 'detalles'],
    });
  }

  async findOne(id: number) {
    return await this.notaRepo.findOneBy({ id });
  }

  async update(id: number, updateNotaIngresoDto: UpdateNotaIngresoDto) {
    return await this.notaRepo.update(id, updateNotaIngresoDto);
  }

  async remove(id: number) {
    return await this.notaRepo.delete(id);
  }

  /**
   * Actualiza el estado de una nota de ingreso con validaciones de transición.
   * 
   * Transiciones permitidas:
   * - Paletizado (0) → Validado (1) o Anulado (3)
   * - Validado (1) → Almacenado (2) o Anulado (3)
   * - Almacenado (2) → Ninguna (estado final)
   * - Anulado (3) → Ninguna (estado final)
   */
  async updateEstado(id: number, dto: UpdateEstadoDto) {
    // 1. Buscar la nota
    const nota = await this.notaRepo.findOneBy({ id });
    if (!nota) {
      throw new NotFoundException(`La nota de ingreso con ID ${id} no existe`);
    }

    const estadoActual = nota.estado;
    const nuevoEstado = dto.estado;

    // 2. Validar que no sea el mismo estado
    if (estadoActual === nuevoEstado) {
      throw new BadRequestException(
        `La nota ya se encuentra en estado ${this.getEstadoNombre(estadoActual)}`
      );
    }

    // 3. Validar transiciones permitidas
    const transicionesPermitidas: Record<number, number[]> = {
      0: [1, 3], // Paletizado → Validado o Anulado
      1: [2, 3], // Validado → Almacenado o Anulado
      2: [],     // Almacenado → ninguna (final)
      3: [],     // Anulado → ninguna (final)
    };

    const permitidas = transicionesPermitidas[estadoActual] || [];
    if (!permitidas.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede cambiar de ${this.getEstadoNombre(estadoActual)} a ${this.getEstadoNombre(nuevoEstado)}. ` +
        `Transiciones permitidas: ${permitidas.map(e => this.getEstadoNombre(e)).join(', ') || 'ninguna'}`
      );
    }

    // 4. Actualizar el estado
    nota.estado = nuevoEstado;
    return await this.notaRepo.save(nota);
  }

  private getEstadoNombre(estado: number): string {
    const nombres: Record<number, string> = {
      0: 'Paletizado',
      1: 'Validado',
      2: 'Almacenado',
      3: 'Anulado',
    };
    return nombres[estado] || 'Desconocido';
  }
}

