import { Injectable } from '@nestjs/common';
import { CreateNotaIngresoDto } from './dto/create-nota_ingreso.dto';
import { UpdateNotaIngresoDto } from './dto/update-nota_ingreso.dto';

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
  ) {}
  async create(dto: CreateNotaIngresoDto) {
    // 1. Validar Almacén
    const almacen = await this.almacenService.findOne(dto.almacenId);

    // 2. Validar Items
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
    return await this.notaRepo.find();
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
}
