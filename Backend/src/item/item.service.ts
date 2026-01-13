import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { In, Repository } from 'typeorm';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}
  async create(createItemDto: CreateItemDto) {
    return await this.itemRepository.save(createItemDto);
  }

  async findAll() {
    return await this.itemRepository.find();
  }

  async findOne(id: number) {
    return await this.itemRepository.findOneBy({ id });
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    return await this.itemRepository.update(id, updateItemDto);
  }

  async remove(id: number) {
    return await this.itemRepository.delete(id);
  }



  /**
   * Valida que una lista de códigos de productos exista en la base de datos.
   * Si alguno falta, lanza una excepción bloqueante.
   */
  async validarExistencia(codigos: string[]): Promise<void> {
    // 1. Limpiamos duplicados para optimizar la consulta
    const codigosUnicos = [...new Set(codigos)];

    // 2. Consultamos solo los que existen
    const encontrados = await this.itemRepository.findBy({
      codigo: In(codigosUnicos),
    });

    // 3. Comparamos cantidades
    if (encontrados.length !== codigosUnicos.length) {
      // Lógica para detectar cuáles faltan y dar un error preciso
      const encontradosSet = new Set(encontrados.map((i) => i.codigo));
      const faltantes = codigosUnicos.filter((c) => !encontradosSet.has(c));

      throw new BadRequestException(
        `Los siguientes productos no existen en el catálogo: ${faltantes.join(', ')}`,
      );
    }
  }
}
