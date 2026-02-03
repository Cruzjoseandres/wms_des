import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Almacen } from '../../almacen/entities/almacen.entity';
import { DetalleSalida } from '../../detalle_salida/entities/detalle_salida.entity';

export enum EstadoSalida {
    PENDIENTE = 0,
    EN_PICKING = 1,
    COMPLETADA = 2,
    DESPACHADA = 3,
    ANULADA = 4,
}

export enum TipoFuenteSalida {
    API_ERP = 'API_ERP',
    MANUAL = 'MANUAL',
}

@Entity('orden_salida')
export class OrdenSalida {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'nro_documento', length: 50, unique: true })
    nroDocumento: string;

    @Column({ name: 'fecha_salida', type: 'timestamp', default: () => 'NOW()' })
    fechaSalida: Date;

    @Column({ length: 150, nullable: true })
    cliente: string;

    @Column({ length: 255, nullable: true })
    destino: string;

    @Column({ type: 'smallint', default: EstadoSalida.PENDIENTE })
    estado: number;

    @Column({ type: 'smallint', default: 2 })
    prioridad: number; // 1=Alta, 2=Media, 3=Baja

    @Column({ name: 'tipo_fuente', length: 20, default: TipoFuenteSalida.MANUAL })
    tipoFuente: string;

    @Column({ type: 'text', nullable: true })
    observacion: string;

    // Relación con Almacén
    @ManyToOne(() => Almacen, { nullable: true })
    @JoinColumn({ name: 'almacen_id' })
    almacen: Almacen;

    // Auditoría
    @Column({ name: 'usuario_creacion', length: 50, nullable: true })
    usuarioCreacion: string;

    @Column({ name: 'usuario_picking', length: 50, nullable: true })
    usuarioPicking: string;

    @Column({ name: 'usuario_despacho', length: 50, nullable: true })
    usuarioDespacho: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'picking_started_at', type: 'timestamp', nullable: true })
    pickingStartedAt: Date;

    @Column({ name: 'picking_completed_at', type: 'timestamp', nullable: true })
    pickingCompletedAt: Date;

    @Column({ name: 'dispatched_at', type: 'timestamp', nullable: true })
    dispatchedAt: Date;

    // Relación con detalles
    @OneToMany(() => DetalleSalida, (detalle) => detalle.ordenSalida, { cascade: true })
    detalles: DetalleSalida[];
}
