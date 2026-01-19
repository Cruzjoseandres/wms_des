import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { DetalleIngreso } from '../../detalle_ingreso/entities/detalle_ingreso.entity';

/**
 * Stock de inventario por ubicación
 * Se llena SOLO cuando un ingreso cambia a estado ALMACENADO
 * Los datos de lote/vencimiento se obtienen del detalle relacionado
 */
@Entity('stock_inventario')
@Index(['sku', 'ubicacion'], { unique: false })
export class StockInventario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    sku: string;

    @Column({ length: 50 })
    ubicacion: string; // A-01-01, B-02-03

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    cantidad: number;

    @Column({ length: 20, default: 'DISPONIBLE' })
    estado: string; // DISPONIBLE, BLOQUEADO

    // Relación con DetalleIngreso (de donde vino este stock)
    @ManyToOne(() => DetalleIngreso, { nullable: true })
    @JoinColumn({ name: 'detalle_ingreso_id' })
    detalleIngreso: DetalleIngreso;

    @Column({ name: 'ultimo_movimiento', type: 'timestamp', default: () => 'NOW()' })
    ultimoMovimiento: Date;
}


