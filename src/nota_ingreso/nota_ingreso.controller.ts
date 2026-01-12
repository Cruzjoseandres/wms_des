import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotaIngresoService } from './nota_ingreso.service';
import { CreateNotaIngresoDto } from './dto/create-nota_ingreso.dto';
import { UpdateNotaIngresoDto } from './dto/update-nota_ingreso.dto';

@Controller('nota-ingreso')
export class NotaIngresoController {
  constructor(private readonly notaIngresoService: NotaIngresoService) {}

  @Post()
  create(@Body() createNotaIngresoDto: CreateNotaIngresoDto) {
    return this.notaIngresoService.create(createNotaIngresoDto);
  }

  @Get()
  findAll() {
    return this.notaIngresoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notaIngresoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotaIngresoDto: UpdateNotaIngresoDto) {
    return this.notaIngresoService.update(+id, updateNotaIngresoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notaIngresoService.remove(+id);
  }
}
