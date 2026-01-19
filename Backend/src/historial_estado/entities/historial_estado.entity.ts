import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { NotaIngreso } from '../../nota_ingreso/entities/nota_ingreso.entity';

/**
 * Historial de cambios de estado de órdenes de ingreso
 * Registra cada transición de estado para auditoría
 */
@Entity('historial_estado')
export class HistorialEstado {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'nota_ingreso_id' })
    notaIngresoId: number;

    @Column({ name: 'estado_anterior', type: 'smallint' })
    estadoAnterior: number;

    @Column({ name: 'estado_nuevo', type: 'smallint' })
    estadoNuevo: number;

    @Column({ name: 'usuario', length: 50, nullable: true })
    usuario: string;

    @Column({ type: 'text', nullable: true })
    motivo: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => NotaIngreso, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'nota_ingreso_id' })
    notaIngreso: NotaIngreso;
}
