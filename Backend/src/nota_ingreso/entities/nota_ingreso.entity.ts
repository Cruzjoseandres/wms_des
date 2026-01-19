import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { DetalleIngreso } from '../../detalle_ingreso/entities/detalle_ingreso.entity';
import { Almacen } from '../../almacen/entities/almacen.entity';

/**
 * Estados de la orden de ingreso:
 * 0 = PALETIZADO (Recién registrado)
 * 1 = VALIDADO (Operario 1 escaneó y validó)
 * 2 = ALMACENADO (Operario 2 ubicó en almacén - ESTADO FINAL)
 * 3 = ANULADO (Cancelado - ESTADO FINAL)
 */
export enum EstadoIngreso {
  PALETIZADO = 0,
  VALIDADO = 1,
  ALMACENADO = 2,
  ANULADO = 3,
}

@Entity('nota_ingreso')
export class NotaIngreso {
  @PrimaryGeneratedColumn()
  id: number;

  // Usa el nombre de columna existente 'nro_doc'
  @Column({ name: 'nro_doc', unique: true, length: 25, nullable: true })
  nroDocumento: string;

  @Column({ name: 'fecha_ingr', type: 'timestamp' })
  fechaIngreso: Date;

  @Column({ name: 'obs_origen', length: 120, nullable: true })
  origen: string;

  // --- CAMPOS DE AUDITORÍA ---
  // Usa el nombre de columna existente 'usuario' para compatibilidad
  @Column({ name: 'usuario', length: 29, nullable: true })
  usuarioCreacion: string;

  // Nuevas columnas - nullable para no romper datos existentes
  @Column({ name: 'usuario_validacion', length: 50, nullable: true })
  usuarioValidacion: string;

  @Column({ name: 'usuario_almacenaje', length: 50, nullable: true })
  usuarioAlmacenaje: string;

  @Column({ name: 'validated_at', type: 'timestamp', nullable: true })
  validatedAt: Date;

  @Column({ name: 'stored_at', type: 'timestamp', nullable: true })
  storedAt: Date;

  // Rango de recepción programado
  @Column({ name: 'fecha_inicio', type: 'timestamp', nullable: true })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'timestamp', nullable: true })
  fechaFin: Date;

  @Column({ name: 'estado', type: 'smallint', default: EstadoIngreso.PALETIZADO })
  estado: number;

  // Referencia opcional al documento de origen (SAP, API externa)
  @Column({ name: 'source_doc_id', nullable: true })
  sourceDocId: number;

  // Relación con Almacen
  @ManyToOne(() => Almacen, { nullable: false })
  @JoinColumn({ name: 'idalmacen' })
  almacen: Almacen;

  @Column({ name: 'observacion', type: 'text', nullable: true })
  observacion: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // --- RELACIÓN CON DETALLES ---
  @OneToMany(() => DetalleIngreso, (detalle) => detalle.notaIngreso, {
    cascade: true,
  })
  detalles: DetalleIngreso[];
}
