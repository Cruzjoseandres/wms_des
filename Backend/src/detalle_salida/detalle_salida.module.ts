import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleSalida } from './entities/detalle_salida.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DetalleSalida])],
    exports: [TypeOrmModule],
})
export class DetalleSalidaModule { }
