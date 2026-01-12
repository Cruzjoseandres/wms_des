import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NotaIngreso } from '../../nota_ingreso/entities/nota_ingreso.entity';
import { Item } from '../../item/entities/item.entity';

@Entity('detalle_ingreso')
export class DetalleIngreso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cod_item', length: 40 })
  codItem: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cantidad: number;

  @Column({ length: 20, nullable: true })
  lote: string;

  @Column({ name: 'fecha_venc', type: 'date', nullable: true })
  fechaVencimiento: Date;

  @Column({ length: 20, nullable: true })
  serie: string;

  // --- RELACIONES ---

  // 1. Relación con el Padre (NotaIngreso)
  @ManyToOne(() => NotaIngreso, (nota: NotaIngreso) => nota.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_nota_ingreso' })
  notaIngreso: NotaIngreso;

  // Agregamos 'insert: false, update: false' porque la columna 'codItem' 
  // de arriba ya maneja el dato. Esta relación es solo para LEER info extra (descripción, peso).
  @ManyToOne(() => Item, { createForeignKeyConstraints: false }) // false opcional si da error de FK estricta
  @JoinColumn({ name: 'cod_item', referencedColumnName: 'codigo' })
  item: Item;
}