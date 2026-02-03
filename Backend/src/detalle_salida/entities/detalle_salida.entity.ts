import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { OrdenSalida } from '../../orden_salida/entities/orden_salida.entity';
import { Item } from '../../item/entities/item.entity';
import { StockInventario } from '../../stock_inventario/entities/stock_inventario.entity';

export enum EstadoDetalleSalida {
    PENDIENTE = 0,
    PICKEADO = 1,
}

@Entity('detalle_salida')
export class DetalleSalida {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'cod_item', length: 50 })
    codItem: string;

    @Column({ name: 'cantidad_solicitada', type: 'decimal', precision: 12, scale: 2 })
    cantidadSolicitada: number;

    @Column({ name: 'cantidad_pickeada', type: 'decimal', precision: 12, scale: 2, default: 0 })
    cantidadPickeada: number;

    @Column({ name: 'ubicacion_origen', length: 50, nullable: true })
    ubicacionOrigen: string;

    @Column({ type: 'smallint', default: EstadoDetalleSalida.PENDIENTE })
    estado: number;

    // Tracking de tiempo
    @Column({ name: 'inicio_picking', type: 'timestamp', nullable: true })
    inicioPicking: Date;

    @Column({ name: 'fin_picking', type: 'timestamp', nullable: true })
    finPicking: Date;

    @Column({ name: 'tiempo_picking', type: 'int', nullable: true })
    tiempoPicking: number; // Segundos

    @Column({ name: 'usuario_picking', length: 50, nullable: true })
    usuarioPicking: string;

    // Relaciones
    @ManyToOne(() => OrdenSalida, (orden) => orden.detalles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orden_salida_id' })
    ordenSalida: OrdenSalida;

    @ManyToOne(() => Item, { eager: true, nullable: true })
    @JoinColumn({ name: 'item_id' })
    item: Item;

    @ManyToOne(() => StockInventario, { nullable: true })
    @JoinColumn({ name: 'stock_inventario_id' })
    stockInventario: StockInventario;
}
