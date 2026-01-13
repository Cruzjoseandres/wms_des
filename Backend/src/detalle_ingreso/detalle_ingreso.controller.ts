import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetalleIngresoService } from './detalle_ingreso.service';
import { CreateDetalleIngresoDto } from './dto/create-detalle_ingreso.dto';
import { UpdateDetalleIngresoDto } from './dto/update-detalle_ingreso.dto';

@Controller('detalle-ingreso')
export class DetalleIngresoController {
  constructor(private readonly detalleIngresoService: DetalleIngresoService) {}

  @Post()
  create(@Body() createDetalleIngresoDto: CreateDetalleIngresoDto) {
    return this.detalleIngresoService.create(createDetalleIngresoDto);
  }

  @Get()
  findAll() {
    return this.detalleIngresoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleIngresoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetalleIngresoDto: UpdateDetalleIngresoDto) {
    return this.detalleIngresoService.update(+id, updateDetalleIngresoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detalleIngresoService.remove(+id);
  }
}
