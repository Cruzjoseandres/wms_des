import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class ProveedorService {
    constructor(
        @InjectRepository(Proveedor)
        private readonly proveedorRepository: Repository<Proveedor>,
    ) { }

    async create(createProveedorDto: CreateProveedorDto): Promise<Proveedor> {
        // Verificar si ya existe un proveedor con el mismo código
        const existing = await this.proveedorRepository.findOne({
            where: { codigo: createProveedorDto.codigo },
        });

        if (existing) {
            throw new ConflictException(`Ya existe un proveedor con el código ${createProveedorDto.codigo}`);
        }

        const proveedor = this.proveedorRepository.create(createProveedorDto);
        return this.proveedorRepository.save(proveedor);
    }

    async findAll(search?: string): Promise<Proveedor[]> {
        if (search) {
            return this.proveedorRepository.find({
                where: [
                    { codigo: Like(`%${search}%`) },
                    { nombre: Like(`%${search}%`) },
                    { ruc: Like(`%${search}%`) },
                ],
                order: { nombre: 'ASC' },
            });
        }

        return this.proveedorRepository.find({
            order: { nombre: 'ASC' },
        });
    }

    async findOne(id: number): Promise<Proveedor> {
        const proveedor = await this.proveedorRepository.findOne({
            where: { id },
        });

        if (!proveedor) {
            throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
        }

        return proveedor;
    }

    async findByCodigo(codigo: string): Promise<Proveedor> {
        const proveedor = await this.proveedorRepository.findOne({
            where: { codigo },
        });

        if (!proveedor) {
            throw new NotFoundException(`Proveedor con código ${codigo} no encontrado`);
        }

        return proveedor;
    }

    async update(id: number, updateProveedorDto: UpdateProveedorDto): Promise<Proveedor> {
        const proveedor = await this.findOne(id);

        // Si se está actualizando el código, verificar que no exista otro con ese código
        if (updateProveedorDto.codigo && updateProveedorDto.codigo !== proveedor.codigo) {
            const existing = await this.proveedorRepository.findOne({
                where: { codigo: updateProveedorDto.codigo },
            });

            if (existing) {
                throw new ConflictException(`Ya existe un proveedor con el código ${updateProveedorDto.codigo}`);
            }
        }

        Object.assign(proveedor, updateProveedorDto);
        return this.proveedorRepository.save(proveedor);
    }

    async remove(id: number): Promise<void> {
        const proveedor = await this.findOne(id);
        await this.proveedorRepository.remove(proveedor);
    }

    async toggleEstado(id: number): Promise<Proveedor> {
        const proveedor = await this.findOne(id);
        proveedor.estado = proveedor.estado === 1 ? 0 : 1;
        return this.proveedorRepository.save(proveedor);
    }
}
