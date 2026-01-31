/**
 * Modelo base para Item
 * Representa la información de un producto/item del catálogo
 */
export interface Item {
    id: number;
    codigo: string;
    descripcion: string;
    codigoBarra: string | null;
    codigoFabrica: string | null;
    codigoProducto: string | null;
    unidadMedida: string | null;
    precio: number | null;
    codSubcategoria: string | null;
    estado: number;
    stock: number;
}

/**
 * Versión resumida de Item para relaciones anidadas
 */
export interface ItemResumen {
    id: number;
    codigo: string;
    descripcion: string;
    codigoBarra: string | null;
    codigoFabrica: string | null;
}
