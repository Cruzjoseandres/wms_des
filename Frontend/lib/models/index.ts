/**
 * Modelos del Frontend WMS
 * Exportación centralizada de todas las interfaces
 */

// Item
export type { Item, ItemResumen } from './item.model';

// Almacén
export type { Almacen } from './almacen.model';

// Detalle Ingreso
export type { DetalleIngreso, DetalleIngresoFrontend } from './detalle-ingreso.model';

// Nota Ingreso
export type {
    EstadoIngreso,
    TipoIngreso,
    NotaIngreso,
    NotaIngresoFrontend,
    CreateNotaIngresoPayload,
    CreateDetallePayload,
} from './nota-ingreso.model';

// Móvil
export {
    EstadoDetalle,
    EstadoDetalleNombre,
} from './movil.model';
export type {
    DetalleMovil,
    OrdenMovil,
    ResumenOrden,
    ValidarResponse,
    AlmacenarResponse,
    IniciarValidacionResponse,
    ValidarDetalleResponse,
    IniciarAlmacenajeResponse,
    AlmacenarDetalleResponse,
    MetricasOperario,
} from './movil.model';

// Stock Inventario
export type { DetalleIngresoRef, StockInventario } from './stock-inventario.model';

// Inventario
export type { Inventario, CreateInventarioPayload } from './inventario.model';

// Documento Origen
export type {
    ItemDocumentoOrigen,
    DocumentoOrigen,
    CrearDesdeDocumentoPayload,
} from './documento-origen.model';

// Documento Externo
export type {
    DetalleDocumentoExterno,
    TipoFuenteDocumento,
    DocumentoExterno,
} from './documento-externo.model';

// Salida y Picking
export {
    EstadoOrdenSalida,
    EstadoOrdenSalidaNombre,
    EstadoDetalleSalida,
    EstadoDetalleSalidaNombre,
} from './salida.model';
export type {
    DetalleSalida,
    ResumenOrdenSalida,
    OrdenSalida,
    CreateOrdenSalidaPayload,
    ImportarERPPayload,
    IniciarPickingOrdenResponse,
    PickearDetalleResponse,
    CompletarPickingResponse,
    MetricasPicker,
} from './salida.model';
