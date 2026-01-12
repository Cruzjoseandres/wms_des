import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { DetalleIngreso } from '../../detalle_ingreso/entities/detalle_ingreso.entity';
import { Almacen } from '../../almacen/entities/almacen.entity';

@Entity('nota_ingreso')
export class NotaIngreso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nro_doc', unique: true, length: 25 })
  nroDocumento: string;

  @Column({ name: 'fecha_ingr', type: 'timestamp' })
  fechaIngreso: Date;

  // En tu legacy usabas 'obs_origen' para el proveedor/origen
  @Column({ name: 'obs_origen', length: 120, nullable: true })
  origen: string; 

  @Column({ name: 'usuario', length: 20 })
  usuario: string;

  @Column({ name: 'estado', type: 'smallint', default: 0 })
  estado: number; // 0: Paletizado, 1: Validado

  // Relación con Almacen
  @ManyToOne(() => Almacen, { nullable: false })
  @JoinColumn({ name: 'idalmacen' })
  almacen: Almacen;

  @Column({ name: 'observacion', type: 'text', nullable: true })
  observacion: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // --- RELACIÓN CLAVE ---
  // cascade: true permite guardar la Nota y sus Detalles en una sola operación
  @OneToMany(() => DetalleIngreso, (detalle) => detalle.notaIngreso, {
    cascade: true,
  })
  detalles: DetalleIngreso[];
}