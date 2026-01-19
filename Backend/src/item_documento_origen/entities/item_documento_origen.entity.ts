import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { DocumentoOrigen } from '../../documento_origen/entities/documento_origen.entity';

/**
 * Ítems del documento de origen
 * Cada ítem representa un producto a ingresar con sus múltiples códigos
 */
@Entity('item_documento_origen')
export class ItemDocumentoOrigen {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'codigo_barra', length: 50, nullable: true })
    codigoBarra: string;

    @Column({ length: 50, nullable: true })
    sku: string;

    @Column({ name: 'codigo_fabrica', length: 50, nullable: true })
    codigoFabrica: string;

    @Column({ name: 'codigo_sistema', length: 50, nullable: true })
    codigoSistema: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ name: 'cantidad_total', type: 'decimal', precision: 12, scale: 2, default: 0 })
    cantidadTotal: number;

    @Column({ name: 'unidad_medida', length: 10, default: 'UNID' })
    unidadMedida: string;

    // Relación con DocumentoOrigen
    @ManyToOne(() => DocumentoOrigen, (doc) => doc.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'documento_id' })
    documento: DocumentoOrigen;
}

