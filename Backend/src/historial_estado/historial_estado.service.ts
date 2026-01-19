import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialEstado } from './entities/historial_estado.entity';

@Injectable()
export class HistorialEstadoService {
    constructor(
        @InjectRepository(HistorialEstado)
        private readonly historialRepo: Repository<HistorialEstado>,
    ) { }

    /**
     * Registra un cambio de estado
     */
    async registrarCambio(datos: {
        notaIngresoId: number;
        estadoAnterior: number;
        estadoNuevo: number;
        usuario?: string;
        motivo?: string;
    }): Promise<HistorialEstado> {
        const registro = this.historialRepo.create(datos);
        return await this.historialRepo.save(registro);
    }

    /**
     * Obtiene el historial de una orden
     */
    async obtenerHistorial(notaIngresoId: number): Promise<HistorialEstado[]> {
        return await this.historialRepo.find({
            where: { notaIngresoId },
            order: { createdAt: 'ASC' },
        });
    }

    /**
     * Obtiene los cambios recientes (últimas 24h)
     */
    async obtenerRecientes(horas: number = 24): Promise<HistorialEstado[]> {
        const desde = new Date();
        desde.setHours(desde.getHours() - horas);

        return await this.historialRepo
            .createQueryBuilder('historial')
            .where('historial.created_at >= :desde', { desde })
            .orderBy('historial.created_at', 'DESC')
            .getMany();
    }
}
