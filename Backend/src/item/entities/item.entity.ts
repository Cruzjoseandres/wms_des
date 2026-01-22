import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { DetalleIngreso } from '../../detalle_ingreso/entities/detalle_ingreso.entity';
import { Proveedor } from '../../proveedor/entities/proveedor.entity';

@Entity('item')
export class Item {
  @PrimaryGeneratedColumn()
  // Trigger Sync
  id: number;

  @Column({ name: 'codigo', unique: true, length: 40 })
  codigo: string;

  @Column({ name: 'descripcion', length: 150 })
  descripcion: string;

  @Column({ name: 'unidad_med', length: 10, nullable: true })
  unidadMedida: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio: number;

  // Mapeamos 'cod_sbcategoria' solo como string por ahora para no complicarte
  @Column({ name: 'cod_sbcategoria', length: 15, nullable: true })
  codSubcategoria: string;

  @Column({ name: 'estado', type: 'smallint', default: 1 })
  estado: number;

  @Column({ name: 'stock', type: 'decimal', precision: 12, scale: 2, default: 0 })
  stock: number;

  // --- CAMPOS ADICIONALES (no mostrados en frontend todavía) ---
  @Column({ name: 'codigo_barra', length: 50, nullable: true })
  codigoBarra: string;

  @Column({ name: 'codigo_fabrica', length: 50, nullable: true })
  codigoFabrica: string;

  @Column({ name: 'codigo_producto', length: 50, nullable: true })
  codigoProducto: string;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt: Date;

  // Relación con DetalleIngreso
  @OneToMany(() => DetalleIngreso, (detalle: DetalleIngreso) => detalle.item)
  detallesIngreso: DetalleIngreso[];

  // Relación Many-to-Many con Proveedores
  @ManyToMany(() => Proveedor, (proveedor) => proveedor.items)
  @JoinTable({
    name: 'item_proveedor',
    joinColumn: { name: 'item_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'proveedor_id', referencedColumnName: 'id' },
  })
  proveedores: Proveedor[];
}