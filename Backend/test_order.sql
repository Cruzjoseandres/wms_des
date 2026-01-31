-- SQL CORRECTO - Basado en columnas REALES de la DB (verificadas con information_schema)

-- 1. Insertar Nota de Ingreso (Cabecera) - TEST-MINI-001
INSERT INTO nota_ingreso (
    nro_documento,
    fecha_ingreso,
    origen,
    estado,
    observacion,
    usuario_creacion,
    almacen_id,
    created_at,
    updated_at
)
VALUES (
    'TEST-MINI-001', 
    NOW(),
    'Prueba Rapida', 
    0,
    'Orden de prueba con pocas cantidades',
    'admin', 
    (SELECT id FROM almacen WHERE codigo = 'ALM-CENT' LIMIT 1), 
    NOW(),
    NOW()
);

-- 2. Insertar Detalles (Productos)
-- Item 1: Destornillador Phillips (Cant: 2) - Barcode: 7501234567003
INSERT INTO detalle_ingreso (
    cod_item,
    cantidad,
    qty_expected,
    id_nota_ingreso
)
VALUES (
    'PROD-003', 
    0, 
    2, 
    (SELECT id FROM nota_ingreso WHERE nro_documento = 'TEST-MINI-001' LIMIT 1)
);

-- Item 2: Galletas Oreo (Cant: 3) - Barcode: 7504444333006
INSERT INTO detalle_ingreso (
    cod_item, 
    cantidad, 
    qty_expected, 
    id_nota_ingreso
)
VALUES (
    'ALIM-006', 
    0, 
    3, 
    (SELECT id FROM nota_ingreso WHERE nro_documento = 'TEST-MINI-001' LIMIT 1)
);
