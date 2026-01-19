import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { DocumentoOrigen } from '../../documento_origen/entities/documento_origen.entity';

/**
 * Ítems del documento de origen
 * Cada ítem representa un producto a ingresar desde documento externo
 */
@Entity('item_documento_origen')
export class ItemDocumentoOrigen {
    @PrimaryGeneratedColumn()
    id: number;

    // Código del item/producto
    @Column({ name: 'cod_item', length: 50 })
    codItem: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ name: 'cantidad', type: 'decimal', precision: 12, scale: 2, default: 0 })
    cantidad: number;

    @Column({ length: 30, nullable: true })
    lote: string;

    @Column({ name: 'fecha_vencimiento', type: 'date', nullable: true })
    fechaVencimiento: Date;

    // Campos adicionales para compatibilidad
    @Column({ name: 'codigo_barra', length: 50, nullable: true })
    codigoBarra: string;

    @Column({ length: 50, nullable: true })
    sku: string;

    @Column({ name: 'codigo_fabrica', length: 50, nullable: true })
    codigoFabrica: string;

    @Column({ name: 'codigo_sistema', length: 50, nullable: true })
    codigoSistema: string;

    @Column({ name: 'unidad_medida', length: 10, default: 'UNID' })
    unidadMedida: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relación con DocumentoOrigen
    @ManyToOne(() => DocumentoOrigen, (doc) => doc.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'documento_id' })
    documento: DocumentoOrigen;
}

