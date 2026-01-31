# Flujo de Datos y Lógica de Negocio

Este documento explica cómo fluye la información a través del sistema WMS, desde la recepción de la mercadería hasta su almacenamiento en stock.

## 1. Recepción (NotaIngreso)

El proceso  comienza con la creación de una **Nota de Ingreso**.

*   **Entidad Principal**: `NotaIngreso`
*   **Detalles**: `DetalleIngreso` (Lista de productos a recibir)

### Flujo de Estados

El ingreso pasa por 4 estados (definidos en `EstadoIngreso`):

1.  **PALETIZADO (0)**:
    *   **Acción**: El usuario crea la nota en el sistema ("Pre-alerta" o "Borrador").
    *   **Datos Clave**: Se define el proveedor, almacén y los items esperados.
    *   **Stock**: **NO** afecta el stock disponible todavía.

2.  **VALIDADO (1)**:
    *   **Acción**: El equipo de recepción verifica físicamente la mercadería (conteo, validación de lote/serie).
    *   **Datos Clave**: Se registran diferencias si las hay (ej. esperaban 10, llegaron 9).
    *   **Validación**: Se asegura que los productos existan en el maestro de `Item`.

3.  **ALMACENADO (2)**:
    *   **Acción**: La mercadería se mueve de la zona de recepción a su ubicación final (ej. A-01-02).
    *   **Impacto**: **AQUÍ** es donde se actualiza el `StockInventario` y el `Item`.
    *   **Lógica**:
        *   Se crea/actualiza registro en `StockInventario` por (Item + Ubicación).
        *   Se suma al stock total en la tabla `Item`.

4.  **ANULADO (3)**:
    *   Estado final si la operación se cancela.

## 2. Definición de Tablas (Entidades)

### Item (Maestro de Productos)
Es la **fuente de la verdad** para los productos.
*   `codigo`: Identificador único interno.
*   `codigo_barra`: Código EAN/UPC para escaneo.
*   `stock`: Cantidad **total** global (suma de todas las ubicaciones).

### DetalleIngreso (Transacción)
Registro de qué productos llegaron en una nota específica.
*   `cod_item` -> Relación con `Item`.
*   `cantidad`: Cuánto llegó.
*   `lote`, `fecha_venc`, `serie`: Trazabilidad específica de ese ingreso.
*   **NOTA**: NO guardamos el código de barras aquí para evitar duplicidad. Se consulta via `item`.

### StockInventario (Existencias por Ubicación)
Indica "Dónde está y cuánto hay".
*   `item_id`: Qué producto es.
*   `ubicacion`: Coordenada física (Pasillo-Estante-Nivel).
*   `cantidad`: Cuánto hay **en esa ubicación**.
*   `detalle_ingreso_id`: Relación opcional para saber de qué ingreso vino (trazabilidad).

## 3. Ejemplo de Flujo de Datos

1.  **Creación**:
    *   Frontend envía JSON con `productoId` (cod_item).
    *   Backend crea `NotaIngreso` y sus `DetalleIngreso`.

2.  **Consulta**:
    *   Frontend pide `GET /nota-ingreso/1`.
    *   Backend hace JOIN: `NotaIngreso` -> `DetalleIngreso` -> `Item`.
    *   Frontend recibe datos del item (descripción, código de barras) gracias al JOIN.

3.  **Almacenamiento**:
    *   Operario confirma ubicación "B-05".
    *   Sistema busca en `StockInventario` si ya existe el Item en "B-05".
        *   Si existe: `cantidad += nueva_cantidad`.
        *   Si no: `INSERT INTO stock_inventario ...`.
    *   Sistema actualiza `Item.stock += nueva_cantidad`.
