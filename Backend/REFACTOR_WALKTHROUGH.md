# Refactorización de Base de Datos y Lógica de Negocio

He completado la refactorización de las entidades para eliminar redundancias y mejorar la integridad de los datos.

## Cambios Realizados

### 1. Eliminación de Redundancia en `DetalleIngreso`
*   **Antes**: Se guardaba `productCodes` (json) con códigos de barra y SKU duplicados.
*   **Ahora**: Se usa la relación con la tabla `Item`. Para ver el código de barras, se consulta `detalle.item.codigoBarra`.
*   **Beneficio**: Unificación de datos. Si actualizas el código de barras en el maestro de items, se refleja en todos lados.

### 2. Mejora en `StockInventario`
*   **Antes**: Usaba una columna de texto `sku` para identificar el producto.
*   **Ahora**: Usa una relación fuerte (`Foreign Key`) con la tabla `Item`.
*   **Beneficio**: Integridad referencial. No pueden existir stocks de productos que no existen en el sistema.

### 3. Corrección de Tipos en `Inventario`
*   Se corrigieron las fechas `fechaApertura` y `fechaCierre` para usar el tipo `Date` en lugar de `string`.

### 4. Estandarización en `NotaIngreso`
*   Se alinearon los nombres de columnas de base de datos a `snake_case` (ej. `nro_documento`, `almacen_id`) manteniendo compatibilidad con el código existente.

## Documentación
He creado un archivo detalle sobre la lógica de negocio:
*   [DATA_FLOW.md](DATA_FLOW.md): Explica el ciclo de vida de una Nota de Ingreso y cómo se actualiza el stock.

## Verificación
*   Se actualizaron los servicios `MovilService` y `StockInventarioService` para adaptarse a los cambios.
*   Se actualizó `seed.ts` (datos de prueba) para reflejar la nueva estructura.
*   **Build Exitoso**: El proyecto compila correctamente (`npm run build`).

## Próximos Pasos Recomendados
1.  Actualizar la base de datos (con `synchronize: true` o migraciones) para aplicar los cambios de esquema.
2.  Si el frontend usaba el endpoint de stock por SKU antiguo, habrá que actualizarlo para usar el nuevo endpoint por Item ID o actualizar el controlador.
