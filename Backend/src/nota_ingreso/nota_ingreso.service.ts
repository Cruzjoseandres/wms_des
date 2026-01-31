import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateNotaIngresoDto } from './dto/create-nota_ingreso.dto';
import { UpdateNotaIngresoDto } from './dto/update-nota_ingreso.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';

import { AlmacenService } from '../almacen/almacen.service';
import { ItemService } from '../item/item.service';
import { NotaIngreso, EstadoIngreso } from './entities/nota_ingreso.entity';
import { DetalleIngreso } from '../detalle_ingreso/entities/detalle_ingreso.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HistorialEstadoService } from '../historial_estado/historial_estado.service';

@Injectable()
export class NotaIngresoService {
  constructor(
    @InjectRepository(NotaIngreso)
    private readonly notaRepo: Repository<NotaIngreso>,
    private readonly almacenService: AlmacenService,
    private readonly itemService: ItemService,
    private readonly historialEstadoService: HistorialEstadoService,
  ) { }

  async create(dto: CreateNotaIngresoDto) {
    // 1. Validar que no exista duplicado
    const existing = await this.notaRepo.findOneBy({ nroDocumento: dto.nroDocumento });
    if (existing) {
      throw new BadRequestException(`Ya existe una nota de ingreso con el número ${dto.nroDocumento}`);
    }

    // 2. Validar Almacén
    const almacen = await this.almacenService.findOne(dto.almacenId);

    // 3. Validar Items (los códigos deben existir en el catálogo) - OPCIONAL durante desarrollo
    const listaCodigos = dto.detalles.map((d) => d.productoId);
    // await this.itemService.validarExistencia(listaCodigos); // Comentado para desarrollo

    // 4. Crear la Nota con cascade
    const nuevaNota = this.notaRepo.create({
      nroDocumento: dto.nroDocumento,
      origen: dto.origen,
      fechaIngreso: new Date(),
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      usuarioCreacion: dto.usuario || 'WEB',
      estado: EstadoIngreso.PALETIZADO,
      almacen: almacen,
      detalles: dto.detalles.map((d) => ({
        codItem: d.productoId,
        cantidad: d.cantidad,
        cantidadEsperada: d.cantidad, // Inicialmente esperada = recibida
        lote: d.lote,
        fechaVencimiento: d.fechaVencimiento ? new Date(d.fechaVencimiento) : undefined,
        serie: d.serie,
      })) as DetalleIngreso[],
    });

    const savedNota = await this.notaRepo.save(nuevaNota);

    // 5. Registrar en historial de estados
    await this.historialEstadoService.registrarCambio({
      notaIngresoId: savedNota.id,
      estadoAnterior: -1, // Nuevo
      estadoNuevo: EstadoIngreso.PALETIZADO,
      usuario: dto.usuario || 'WEB',
      motivo: 'Creación de orden de ingreso',
    });

    // 6. Actualizar Stock (solo si validación está activa)
    for (const detalle of dto.detalles) {
      const item = await this.itemService.findOneByCode(detalle.productoId);
      if (item) {
        await this.itemService.increaseStock(item.id, detalle.cantidad);
      }
    }

    return savedNota;
  }

  async findAll() {
    return await this.notaRepo.find({
      relations: ['almacen', 'detalles', 'detalles.item'],
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

    // 4. Actualizar el estado y campos de auditoría según la transición
    nota.estado = nuevoEstado;
    const usuario = dto.usuario || 'SISTEMA';

    // Setear campos específicos según el nuevo estado
    if (nuevoEstado === EstadoIngreso.VALIDADO) {
      nota.usuarioValidacion = usuario;
      nota.validatedAt = new Date();
    } else if (nuevoEstado === EstadoIngreso.ALMACENADO) {
      nota.usuarioAlmacenaje = usuario;
      nota.storedAt = new Date();
    }

    const savedNota = await this.notaRepo.save(nota);

    // 5. Registrar en historial de estados
    await this.historialEstadoService.registrarCambio({
      notaIngresoId: id,
      estadoAnterior: estadoActual,
      estadoNuevo: nuevoEstado,
      usuario: usuario,
      motivo: this.getMotivoCambio(nuevoEstado),
    });

    return savedNota;
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

  private getMotivoCambio(estado: number): string {
    const motivos: Record<number, string> = {
      0: 'Retorno a estado inicial',
      1: 'Validación completada',
      2: 'Almacenamiento completado',
      3: 'Orden anulada',
    };
    return motivos[estado] || 'Cambio de estado';
  }
}

