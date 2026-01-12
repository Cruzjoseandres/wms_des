import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotaIngresoService } from './nota_ingreso.service';
import { NotaIngresoController } from './nota_ingreso.controller';
import { NotaIngreso } from './entities/nota_ingreso.entity';
import { AlmacenModule } from '../almacen/almacen.module';
import { ItemModule } from '../item/item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotaIngreso]),
    AlmacenModule,
    ItemModule,
  ],
  controllers: [NotaIngresoController],
  providers: [NotaIngresoService],
})
export class NotaIngresoModule {}
