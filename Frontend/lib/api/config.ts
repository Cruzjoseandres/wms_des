// Configuración centralizada de la API
// Usar variable de entorno o default a localhost para desarrollo

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Endpoints del backend
export const API_ENDPOINTS = {
    // Existentes
    almacen: `${API_BASE_URL}/almacen`,
    item: `${API_BASE_URL}/item`,
    inventario: `${API_BASE_URL}/inventario`,
    notaIngreso: `${API_BASE_URL}/nota-ingreso`,

    // Nuevos (español)
    documentoOrigen: `${API_BASE_URL}/documento-origen`,
    stockInventario: `${API_BASE_URL}/stock-inventario`,

    // API de ingreso
    ingresoApi: `${API_BASE_URL}/api/ingreso`,

    // API móvil
    movil: `${API_BASE_URL}/api/movil`,

    // Búsqueda de documentos externos
    documentosExternos: `${API_BASE_URL}/documentos-externos`,

    // Salida y Picking
    salida: `${API_BASE_URL}/api/salida`,
    picking: `${API_BASE_URL}/api/picking`,
};
