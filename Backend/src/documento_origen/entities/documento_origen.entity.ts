import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';
import { ItemDocumentoOrigen } from '../../item_documento_origen/entities/item_documento_origen.entity';

/**
 * Documento de origen que simula la API externa (SAP, ERP, etc.)
 * Contiene información de documentos de ingreso pendientes de procesar
 */
@Entity('documento_origen')
export class DocumentoOrigen {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'nro_documento', unique: true, length: 50 })
    nroDocumento: string; // SAP-2024-001

    @Column({ type: 'text', nullable: true })
    descripcion: string; // Farmacéuticos, Electrónicos, etc.

    @Column({ length: 20, default: 'SAP' })
    origen: string; // SAP, MANUAL, API

    @Column({ length: 20, default: 'PENDIENTE' })
    estado: string; // PENDIENTE, PROCESADO

    @Column({ name: 'datos_raw', type: 'jsonb', nullable: true })
    datosRaw: Record<string, unknown>;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => ItemDocumentoOrigen, (item) => item.documento, { cascade: true })
    items: ItemDocumentoOrigen[];
}
