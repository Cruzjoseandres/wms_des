import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleIngresoService } from './detalle_ingreso.service';
import { DetalleIngresoController } from './detalle_ingreso.controller';
import { DetalleIngreso } from './entities/detalle_ingreso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleIngreso])],
  controllers: [DetalleIngresoController],
  providers: [DetalleIngresoService],
})
export class DetalleIngresoModule {}
