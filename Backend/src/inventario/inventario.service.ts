import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventario } from './entities/inventario.entity';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';

@Injectable()
export class InventarioService {
    constructor(
        @InjectRepository(Inventario)
        private readonly inventarioRepository: Repository<Inventario>,
    ) { }

    async create(createInventarioDto: CreateInventarioDto): Promise<Inventario> {
        const { almacenId, ...rest } = createInventarioDto;
        const nuevo = this.inventarioRepository.create({
            ...rest,
            almacen: { id: almacenId } as any, // Cast to any or helper to avoid partial type issues if strict
            almacenId // Keep it for local usage if needed, but the relation drives the FK
        });
        return await this.inventarioRepository.save(nuevo);
    }

    async findAll(): Promise<Inventario[]> {
        try {
            return await this.inventarioRepository.find({
                order: {
                    fechaApertura: 'DESC',
                },
                // relations: ['almacen'], // Already eager: true in entity
            });
        } catch (error) {
            console.error('Error in findAll InventarioService:', error);
            throw new Error(`Failed to fetch inventories: ${error instanceof Error ? error.message : error}`);
        }
    }

    async findOne(id: number): Promise<Inventario> {
        const inventario = await this.inventarioRepository.findOne({
            where: { id },
            relations: ['almacen'],
        });
        if (!inventario) throw new NotFoundException(`Inventario con ID ${id} no encontrado`);
        return inventario;
    }

    async update(id: number, updateInventarioDto: UpdateInventarioDto): Promise<Inventario> {
        const inventario = await this.findOne(id);
        this.inventarioRepository.merge(inventario, updateInventarioDto);
        return await this.inventarioRepository.save(inventario);
    }

    async remove(id: number): Promise<void> {
        const inventario = await this.findOne(id);
        await this.inventarioRepository.remove(inventario);
    }
}
