/**
 * Modelo de Almacén
 */
export interface Almacen {
    id: number;
    codigo: string;
    descripcion: string;
    sucursalId: number;
    estado: number;
}
