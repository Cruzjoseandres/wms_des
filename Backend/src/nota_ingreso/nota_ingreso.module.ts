import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotaIngresoService } from './nota_ingreso.service';
import { NotaIngresoController } from './nota_ingreso.controller';
import { NotaIngreso } from './entities/nota_ingreso.entity';
import { AlmacenModule } from '../almacen/almacen.module';
import { ItemModule } from '../item/item.module';
import { HistorialEstadoModule } from '../historial_estado/historial_estado.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotaIngreso]),
    AlmacenModule,
    ItemModule,
    HistorialEstadoModule,
  ],
  controllers: [NotaIngresoController],
  providers: [NotaIngresoService],
  exports: [NotaIngresoService],
})
export class NotaIngresoModule { }


