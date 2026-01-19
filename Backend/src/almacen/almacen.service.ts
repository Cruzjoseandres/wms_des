import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAlmacenDto } from './dto/create-almacen.dto';
import { UpdateAlmacenDto } from './dto/update-almacen.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Almacen } from './entities/almacen.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AlmacenService {
  constructor(
    @InjectRepository(Almacen)
    private readonly almacenRepository: Repository<Almacen>,
  ) { }
  async create(createAlmacenDto: CreateAlmacenDto) {
    return await this.almacenRepository.save(createAlmacenDto);
  }

  async findAll() {
    return await this.almacenRepository.find({
      where: { estado: 1 }, // Solo almacenes activos
    });
  }

  async findOne(id: number) {
    const almacen = await this.almacenRepository.findOneBy({ id });
    if (!almacen) throw new NotFoundException('El almacén no existe');
    return almacen;
  }

  async update(id: number, updateAlmacenDto: UpdateAlmacenDto) {
    return await this.almacenRepository.update(id, updateAlmacenDto);
  }

  async remove(id: number) {
    return await this.almacenRepository.delete(id);
  }
}
