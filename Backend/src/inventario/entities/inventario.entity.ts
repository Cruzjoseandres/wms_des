import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Almacen } from '../../almacen/entities/almacen.entity';

@Entity('inventario')
export class Inventario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    codigo: string;

    @Column({ default: 'General' })
    tipo: string;

    @Column({ default: 'Abierto' })
    estado: string; // Abierto, En Proceso, Cerrado

    @Column({ name: 'fecha_apertura', type: 'date' })
    fechaApertura: Date;

    @Column({ name: 'fecha_cierre', type: 'date', nullable: true })
    fechaCierre: Date;

    @Column({ name: 'bodega', nullable: true })
    bodega: string;

    @Column({ name: 'items_contados', default: 0 })
    itemsContados: number;

    @Column({ name: 'items_totales', default: 0 })
    itemsTotales: number;

    @Column({ default: 0 })
    diferencias: number;

    @Column()
    responsable: string;

    @ManyToOne(() => Almacen, { eager: true })
    @JoinColumn({ name: 'almacen_id' })
    almacen: Almacen;

    @Column({ name: 'almacen_id', insert: false, update: false })
    almacenId: number;
}
