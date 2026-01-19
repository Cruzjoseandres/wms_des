import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialEstado } from './entities/historial_estado.entity';
import { HistorialEstadoService } from './historial_estado.service';

@Module({
    imports: [TypeOrmModule.forFeature([HistorialEstado])],
    providers: [HistorialEstadoService],
    exports: [HistorialEstadoService],
})
export class HistorialEstadoModule { }
