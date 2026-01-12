import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenService } from './almacen.service';
import { AlmacenController } from './almacen.controller';
import { Almacen } from './entities/almacen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Almacen])],
  controllers: [AlmacenController],
  providers: [AlmacenService],
  exports: [AlmacenService],
})
export class AlmacenModule {}
