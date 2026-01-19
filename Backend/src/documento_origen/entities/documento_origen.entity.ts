import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';
import { ItemDocumentoOrigen } from '../../item_documento_origen/entities/item_documento_origen.entity';

/**
 * Tipo de fuente del documento
 * API_ERP: Documento proveniente de sistema ERP externo (SAP, Oracle, etc.)
 * MANUAL: Documento ingresado manualmente en el sistema
 */
export enum TipoFuente {
    API_ERP = 'API_ERP',
    MANUAL = 'MANUAL',
}

/**
 * Documento de origen que simula la API externa (SAP, ERP, etc.)
 * Contiene información de documentos de ingreso pendientes de procesar
 */
@Entity('documento_origen')
export class DocumentoOrigen {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'nro_documento', unique: true, length: 50 })
    nroDocumento: string; // SAP-2024-001, INT-2024-001

    @Column({ name: 'tipo_fuente', type: 'varchar', length: 20, default: TipoFuente.API_ERP })
    tipoFuente: TipoFuente; // API_ERP o MANUAL

    @Column({ length: 120, nullable: true })
    proveedor: string; // Nombre del proveedor/origen

    @Column({ name: 'fecha_documento', type: 'date', nullable: true })
    fechaDocumento: Date;

    @Column({ type: 'text', nullable: true })
    descripcion: string; // Farmacéuticos, Electrónicos, etc.

    @Column({ length: 20, default: 'pendiente' })
    estado: string; // pendiente, procesado, anulado

    @Column({ name: 'datos_raw', type: 'jsonb', nullable: true })
    datosRaw: Record<string, unknown>;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => ItemDocumentoOrigen, (item) => item.documento, { cascade: true })
    items: ItemDocumentoOrigen[];
}
