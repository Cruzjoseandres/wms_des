import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NotaIngreso } from '../../nota_ingreso/entities/nota_ingreso.entity';
import { Item } from '../../item/entities/item.entity';

/**
 * Estados del detalle de ingreso:
 * 0 = PENDIENTE (Recién registrado, pendiente de validación)
 * 1 = VALIDADO (Operario 1 validó cantidad y producto)
 * 2 = ALMACENADO (Operario 2 ubicó en almacén - ESTADO FINAL)
 */
export enum EstadoDetalle {
  PENDIENTE = 0,
  VALIDADO = 1,
  ALMACENADO = 2,
}

@Entity('detalle_ingreso')
export class DetalleIngreso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cod_item', length: 40 })
  codItem: string;

  // Se eliminó product_codes por redundancia. Usar item.codigoBarra


  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cantidad: number;

  // Cantidad esperada según documento de origen
  @Column({ name: 'qty_expected', type: 'decimal', precision: 12, scale: 2, nullable: true })
  cantidadEsperada: number;

  // Cantidad real recibida y validada por el operario
  @Column({ name: 'cantidad_recibida', type: 'decimal', precision: 12, scale: 2, nullable: true })
  cantidadRecibida: number;

  @Column({ length: 20, nullable: true })
  lote: string;

  @Column({ name: 'fecha_venc', type: 'date', nullable: true })
  fechaVencimiento: Date;

  @Column({ length: 20, nullable: true })
  serie: string;

  // Ubicación sugerida por el sistema (algoritmo de recomendación)
  @Column({ name: 'ubicacion_sugerida', length: 30, nullable: true })
  ubicacionSugerida: string;

  // Ubicación final donde se almacenó el producto
  @Column({ name: 'ubicacion_final', length: 30, nullable: true })
  ubicacionFinal: string;

  // --- ESTADO DEL DETALLE ---
  @Column({ name: 'estado', type: 'smallint', default: EstadoDetalle.PENDIENTE })
  estado: number;

  // --- AUDITORÍA DE VALIDACIÓN ---
  @Column({ name: 'usuario_validacion', length: 50, nullable: true })
  usuarioValidacion: string;

  @Column({ name: 'usuario_almacenaje', length: 50, nullable: true })
  usuarioAlmacenaje: string;

  @Column({ name: 'validated_at', type: 'timestamp', nullable: true })
  validatedAt: Date;

  @Column({ name: 'stored_at', type: 'timestamp', nullable: true })
  storedAt: Date;

  // --- MÉTRICAS DE TIEMPO ---
  @Column({ name: 'inicio_validacion', type: 'timestamp', nullable: true })
  inicioValidacion: Date;

  @Column({ name: 'inicio_almacenaje', type: 'timestamp', nullable: true })
  inicioAlmacenaje: Date;

  @Column({ name: 'tiempo_validacion', type: 'int', nullable: true })
  tiempoValidacion: number; // Segundos que tomó validar

  @Column({ name: 'tiempo_almacenaje', type: 'int', nullable: true })
  tiempoAlmacenaje: number; // Segundos que tomó almacenar

  // --- RELACIONES ---

  @ManyToOne(() => NotaIngreso, (nota: NotaIngreso) => nota.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_nota_ingreso' })
  notaIngreso: NotaIngreso;

  @ManyToOne(() => Item, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'cod_item', referencedColumnName: 'codigo' })
  item: Item;
}