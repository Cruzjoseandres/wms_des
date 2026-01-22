import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Item } from '../../item/entities/item.entity';

@Entity('proveedor')
export class Proveedor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'codigo', length: 20, unique: true })
    codigo: string;

    @Column({ name: 'nombre', length: 150 })
    nombre: string;

    @Column({ name: 'ruc', length: 20, nullable: true })
    ruc: string;

    @Column({ name: 'direccion', length: 200, nullable: true })
    direccion: string;

    @Column({ name: 'telefono', length: 30, nullable: true })
    telefono: string;

    @Column({ name: 'email', length: 100, nullable: true })
    email: string;

    @Column({ name: 'contacto', length: 100, nullable: true })
    contacto: string;

    @Column({ name: 'estado', type: 'smallint', default: 1 })
    estado: number;

    @CreateDateColumn({ name: 'created_at', select: false })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', select: false })
    updatedAt: Date;

    // Relación inversa con Items (Many-to-Many)
    @ManyToMany(() => Item, (item) => item.proveedores)
    items: Item[];
}
