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
 * Estructura para almacenar múltiples códigos de producto
 */
export interface ProductCodes {
  barcode?: string;
  sku?: string;
  factoryCode?: string;
  systemCode?: string;
}

@Entity('detalle_ingreso')
export class DetalleIngreso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cod_item', length: 40 })
  codItem: string;

  // Almacena múltiples códigos del producto (barcode, sku, factory_code, etc.)
  @Column({ name: 'product_codes', type: 'jsonb', nullable: true })
  productCodes: ProductCodes;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cantidad: number;

  // Cantidad esperada según documento de origen
  @Column({ name: 'qty_expected', type: 'decimal', precision: 12, scale: 2, nullable: true })
  cantidadEsperada: number;

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