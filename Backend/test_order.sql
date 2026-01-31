-- 1. Insertar Nota de Ingreso (Cabecera) - TEST-MINI-001
INSERT INTO nota_ingreso (
    nro_documento, 
    origen, 
    estado, 
    observacion, 
    usuario_creacion, 
    almacen_id, 
    fecha_ingreso, 
    created_at, 
    updated_at
)
VALUES (
    'TEST-MINI-001', 
    'Prueba Rapida', 
    0, -- 0 = PALETIZADO (Listo para validar)
    'Orden de prueba con pocas cantidades', 
    'admin', 
    (SELECT id FROM almacen WHERE codigo = 'ALM-CENT' LIMIT 1), 
    NOW(), 
    NOW(), 
    NOW()
);

-- 2. Insertar Detalles (Productos)
-- Item 1: Destornillador Phillips (Cant: 2)
INSERT INTO detalle_ingreso (
    cod_item, 
    cantidad, 
    cantidad_esperada, 
    nota_ingreso_id
)
VALUES (
    'PROD-003', -- Código interno
    0,          -- Cantidad recibida (empieza en 0)
    2,          -- Cantidad esperada
    (SELECT id FROM nota_ingreso WHERE nro_documento = 'TEST-MINI-001' LIMIT 1)
);

-- Item 2: Galletas Oreo (Cant: 3)
INSERT INTO detalle_ingreso (
    cod_item, 
    cantidad, 
    cantidad_esperada, 
    nota_ingreso_id
)
VALUES (
    'ALIM-006', 
    0, 
    3, 
    (SELECT id FROM nota_ingreso WHERE nro_documento = 'TEST-MINI-001' LIMIT 1)
);
