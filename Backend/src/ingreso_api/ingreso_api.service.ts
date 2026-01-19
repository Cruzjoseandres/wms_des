import { Injectable } from '@nestjs/common';
import { DocumentoOrigenService } from '../documento_origen/documento_origen.service';
import { NotaIngresoService } from '../nota_ingreso/nota_ingreso.service';

@Injectable()
export class IngresoApiService {
    constructor(
        private readonly documentoOrigenService: DocumentoOrigenService,
        private readonly notaIngresoService: NotaIngresoService,
    ) { }

    /**
     * Busca documentos de origen por número o descripción
     */
    async buscarDocumentos(query: string, origen: 'manual' | 'api' = 'manual') {
        if (origen === 'api') {
            // En el futuro, aquí se conectaría a la API externa
            return await this.documentoOrigenService.buscar(query);
        }
        return await this.documentoOrigenService.buscar(query);
    }

    /**
     * Obtiene un documento específico por número
     */
    async obtenerDocumento(nroDocumento: string) {
        return await this.documentoOrigenService.buscarPorNumero(nroDocumento);
    }

    /**
     * Obtiene todos los documentos pendientes
     */
    async obtenerPendientes() {
        return await this.documentoOrigenService.obtenerPendientes();
    }

    /**
     * Crea una orden de ingreso desde un documento de origen
     */
    async crearDesdeDocumento(
        documentoId: number,
        almacenId: number,
        usuario: string,
    ) {
        // 1. Obtener documento de origen
        const documento = await this.documentoOrigenService.obtenerPorId(documentoId);

        if (!documento) {
            throw new Error(`Documento de origen ${documentoId} no encontrado`);
        }

        // 2. Crear la nota de ingreso
        const orden = await this.notaIngresoService.create({
            nroDocumento: documento.nroDocumento,
            origen: documento.proveedor || documento.descripcion || 'API Externa',
            almacenId,
            usuario,
            sourceDocId: documentoId,
            detalles: documento.items.map((item) => ({
                productoId: item.codItem || item.sku || item.codigoBarra || `ITEM-${item.id}`,
                cantidad: Number(item.cantidad) || 0,
                cantidadEsperada: Number(item.cantidad) || 0,
                lote: item.lote,
                fechaVencimiento: item.fechaVencimiento ? item.fechaVencimiento.toISOString().split('T')[0] : undefined,
                productCodes: {
                    barcode: item.codigoBarra,
                    sku: item.sku,
                    factoryCode: item.codigoFabrica,
                    systemCode: item.codigoSistema,
                },
            })),
        });

        // 3. Marcar documento como procesado
        await this.documentoOrigenService.marcarProcesado(documentoId);

        return orden;
    }
}
