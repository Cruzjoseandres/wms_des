import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Almacen } from '../almacen/entities/almacen.entity';
import { Item } from '../item/entities/item.entity';
import { DocumentoOrigen } from '../documento_origen/entities/documento_origen.entity';
import { ItemDocumentoOrigen } from '../item_documento_origen/entities/item_documento_origen.entity';

/**
 * Script de Seeders para WMS
 * Ejecutar con: npm run seed
 * 
 * Usa la configuración existente del módulo (no crea nueva conexión)
 */
async function seed() {
    console.log('🌱 Iniciando seeders...');

    // Usar NestFactory para obtener la conexión configurada
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    console.log('✅ Conexión establecida usando configuración existente');

    const almacenRepo = dataSource.getRepository(Almacen);
    const itemRepo = dataSource.getRepository(Item);
    const documentoRepo = dataSource.getRepository(DocumentoOrigen);
    const itemDocRepo = dataSource.getRepository(ItemDocumentoOrigen);

    // =======================
    // 1. ALMACENES
    // =======================
    console.log('\n📦 Creando almacenes...');
    const almacenData = [
        { codigo: 'ALM-CENT', descripcion: 'Almacén Central', sucursalId: 1, estado: 1 },
        { codigo: 'ALM-SEC', descripcion: 'Almacén Secundario', sucursalId: 1, estado: 1 },
    ];

    for (const data of almacenData) {
        const existing = await almacenRepo.findOneBy({ codigo: data.codigo });
        if (!existing) {
            await almacenRepo.save(almacenRepo.create(data));
            console.log(`  ✓ Creado: ${data.descripcion}`);
        } else {
            console.log(`  → Ya existe: ${data.descripcion}`);
        }
    }

    // =======================
    // 2. ITEMS (Catálogo de Productos)
    // =======================
    console.log('\n📋 Creando catálogo de items...');
    const itemsData = [
        { codigo: 'PROD-001', descripcion: 'Taladro Percutor Bosch', unidadMedida: 'UNID', precio: 150.00, estado: 1 },
        { codigo: 'PROD-002', descripcion: 'Martillo de Goma', unidadMedida: 'PZA', precio: 25.50, estado: 1 },
        { codigo: 'FARM-001', descripcion: 'Paracetamol 500mg', unidadMedida: 'CAJA', precio: 12.00, estado: 1 },
        { codigo: 'FARM-002', descripcion: 'Ibuprofeno 400mg', unidadMedida: 'CAJA', precio: 15.00, estado: 1 },
        { codigo: 'FARM-003', descripcion: 'Omeprazol 20mg', unidadMedida: 'CAJA', precio: 18.00, estado: 1 },
        { codigo: 'ELEC-001', descripcion: 'Cable USB-C 1m', unidadMedida: 'UNID', precio: 8.00, estado: 1 },
        { codigo: 'ELEC-002', descripcion: 'Cargador 20W', unidadMedida: 'UNID', precio: 25.00, estado: 1 },
        { codigo: 'ALIM-001', descripcion: 'Leche Entera 1L', unidadMedida: 'UNID', precio: 3.50, estado: 1 },
        { codigo: 'ALIM-002', descripcion: 'Aceite Vegetal 1L', unidadMedida: 'UNID', precio: 4.80, estado: 1 },
        { codigo: 'ALIM-003', descripcion: 'Arroz Premium 1kg', unidadMedida: 'KG', precio: 2.50, estado: 1 },
        { codigo: 'ALIM-004', descripcion: 'Atún en Lata', unidadMedida: 'UNID', precio: 5.00, estado: 1 },
    ];

    for (const data of itemsData) {
        const existing = await itemRepo.findOneBy({ codigo: data.codigo });
        if (!existing) {
            await itemRepo.save(itemRepo.create(data));
            console.log(`  ✓ Creado: ${data.descripcion}`);
        } else {
            console.log(`  → Ya existe: ${data.descripcion}`);
        }
    }

    // =======================
    // 3. DOCUMENTOS DE ORIGEN (SAP)
    // =======================
    console.log('\n📄 Creando documentos de origen (SAP)...');
    const docsData = [
        {
            nroDocumento: 'SAP-2024-001',
            descripcion: 'Farmacéuticos (Paracetamol, Ibuprofeno, Omeprazol)',
            origen: 'SAP',
            estado: 'PENDIENTE',
            items: [
                { codigoBarra: '7501234567890', sku: 'FARM-001', codigoFabrica: 'FC-001', descripcion: 'Paracetamol 500mg', cantidadTotal: 100, unidadMedida: 'CAJA' },
                { codigoBarra: '7501234567891', sku: 'FARM-002', codigoFabrica: 'FC-002', descripcion: 'Ibuprofeno 400mg', cantidadTotal: 50, unidadMedida: 'CAJA' },
                { codigoBarra: '7501234567892', sku: 'FARM-003', codigoFabrica: 'FC-003', descripcion: 'Omeprazol 20mg', cantidadTotal: 75, unidadMedida: 'CAJA' },
            ],
        },
        {
            nroDocumento: 'SAP-2024-002',
            descripcion: 'Electrónicos (Cables USB, Cargadores)',
            origen: 'SAP',
            estado: 'PENDIENTE',
            items: [
                { codigoBarra: '7509876543210', sku: 'ELEC-001', codigoFabrica: 'FC-100', descripcion: 'Cable USB-C 1m', cantidadTotal: 200, unidadMedida: 'UNID' },
                { codigoBarra: '7509876543211', sku: 'ELEC-002', codigoFabrica: 'FC-101', descripcion: 'Cargador 20W', cantidadTotal: 100, unidadMedida: 'UNID' },
            ],
        },
        {
            nroDocumento: 'SAP-2024-003',
            descripcion: 'Alimentos (Leche, Aceite, Arroz, Atún)',
            origen: 'SAP',
            estado: 'PENDIENTE',
            items: [
                { codigoBarra: '7502222111000', sku: 'ALIM-001', codigoFabrica: 'FC-200', descripcion: 'Leche Entera 1L', cantidadTotal: 500, unidadMedida: 'UNID' },
                { codigoBarra: '7502222111001', sku: 'ALIM-002', codigoFabrica: 'FC-201', descripcion: 'Aceite Vegetal 1L', cantidadTotal: 300, unidadMedida: 'UNID' },
                { codigoBarra: '7502222111002', sku: 'ALIM-003', codigoFabrica: 'FC-202', descripcion: 'Arroz Premium 1kg', cantidadTotal: 400, unidadMedida: 'KG' },
                { codigoBarra: '7502222111003', sku: 'ALIM-004', codigoFabrica: 'FC-203', descripcion: 'Atún en Lata', cantidadTotal: 600, unidadMedida: 'UNID' },
            ],
        },
        {
            nroDocumento: 'SAP-2024-004',
            descripcion: 'Herramientas de Construcción',
            origen: 'SAP',
            estado: 'PENDIENTE',
            items: [
                { codigoBarra: '7503333222000', sku: 'PROD-001', codigoFabrica: 'FC-300', descripcion: 'Taladro Percutor Bosch', cantidadTotal: 50, unidadMedida: 'UNID' },
                { codigoBarra: '7503333222001', sku: 'PROD-002', codigoFabrica: 'FC-301', descripcion: 'Martillo de Goma', cantidadTotal: 100, unidadMedida: 'PZA' },
            ],
        },
    ];

    for (const docData of docsData) {
        const existing = await documentoRepo.findOneBy({ nroDocumento: docData.nroDocumento });
        if (!existing) {
            // Guardar documento primero
            const doc = await documentoRepo.save(documentoRepo.create({
                nroDocumento: docData.nroDocumento,
                descripcion: docData.descripcion,
                origen: docData.origen,
                estado: docData.estado,
            }));

            // Guardar items del documento
            for (const itemData of docData.items) {
                await itemDocRepo.save(itemDocRepo.create({
                    ...itemData,
                    documento: doc, // Usar la relación, no el ID
                }));
            }
            console.log(`  ✓ Creado: ${docData.nroDocumento} - ${docData.descripcion} (${docData.items.length} items)`);
        } else {
            console.log(`  → Ya existe: ${docData.nroDocumento}`);
        }
    }

    // =======================
    // 4. NOTA DE INGRESO DE PRUEBA (para tener stock con relación)
    // =======================
    console.log('\n📦 Creando nota de ingreso de prueba con stock...');
    const notaRepo = dataSource.getRepository('NotaIngreso');
    const detalleRepo = dataSource.getRepository('DetalleIngreso');
    const stockRepo = dataSource.getRepository('StockInventario');

    // Verificar si ya hay stock
    const existingStock = await stockRepo.count();
    if (existingStock === 0) {
        // Obtener el almacén central
        const almacenCentral = await almacenRepo.findOneBy({ codigo: 'ALM-CENT' });

        if (almacenCentral) {
            // Crear una nota de ingreso de prueba
            const nota = await notaRepo.save(notaRepo.create({
                nroDocumento: 'SEED-2024-001',
                fechaIngreso: new Date(),
                origen: 'SEED DATA',
                usuarioCreacion: 'SISTEMA',
                estado: 2, // ALMACENADO
                almacen: almacenCentral,
                observacion: 'Datos de prueba para visualización',
            }));
            console.log(`  ✓ Creada nota de ingreso: ${nota.nroDocumento}`);

            // Crear detalles con lote y fecha vencimiento
            const detallesData = [
                { codItem: 'FARM-001', cantidad: 100, lote: 'L2025-001', fechaVencimiento: new Date('2025-12-31'), ubicacionFinal: 'A-01-01-01' },
                { codItem: 'FARM-002', cantidad: 50, lote: 'L2025-002', fechaVencimiento: new Date('2025-06-15'), ubicacionFinal: 'A-01-01-02' },
                { codItem: 'FARM-003', cantidad: 75, lote: 'L2025-003', fechaVencimiento: new Date('2025-08-20'), ubicacionFinal: 'A-01-02-01' },
                { codItem: 'ELEC-001', cantidad: 200, lote: 'E2024-100', fechaVencimiento: null, ubicacionFinal: 'B-02-01-01' },
                { codItem: 'ELEC-002', cantidad: 100, lote: 'E2024-101', fechaVencimiento: null, ubicacionFinal: 'B-02-01-02' },
                { codItem: 'ALIM-001', cantidad: 500, lote: 'A2025-200', fechaVencimiento: new Date('2025-03-01'), ubicacionFinal: 'C-01-01-01' },
                { codItem: 'ALIM-002', cantidad: 300, lote: 'A2025-201', fechaVencimiento: new Date('2025-04-15'), ubicacionFinal: 'C-01-01-02' },
                { codItem: 'ALIM-003', cantidad: 400, lote: 'A2025-202', fechaVencimiento: new Date('2025-02-10'), ubicacionFinal: 'C-01-02-01' },
                { codItem: 'ALIM-004', cantidad: 600, lote: 'A2025-203', fechaVencimiento: new Date('2025-05-25'), ubicacionFinal: 'C-01-02-02' },
                { codItem: 'PROD-001', cantidad: 50, lote: 'P2024-300', fechaVencimiento: null, ubicacionFinal: 'D-01-01-01' },
                { codItem: 'PROD-002', cantidad: 15, lote: 'P2024-301', fechaVencimiento: null, ubicacionFinal: 'D-01-01-02' },
            ];

            for (const data of detallesData) {
                // Crear detalle
                const detalle = await detalleRepo.save(detalleRepo.create({
                    codItem: data.codItem,
                    cantidad: data.cantidad,
                    lote: data.lote,
                    fechaVencimiento: data.fechaVencimiento,
                    ubicacionFinal: data.ubicacionFinal,
                    notaIngreso: nota,
                }));

                // Crear stock relacionado
                await stockRepo.save(stockRepo.create({
                    sku: data.codItem,
                    ubicacion: data.ubicacionFinal,
                    cantidad: data.cantidad,
                    estado: data.codItem === 'ALIM-003' ? 'BLOQUEADO' : 'DISPONIBLE',
                    detalleIngreso: detalle,
                }));
            }
            console.log(`  ✓ Creados ${detallesData.length} detalles con stock`);
        } else {
            console.log('  ⚠ No se encontró almacén central, saltando stock');
        }
    } else {
        console.log(`  → Ya existe stock (${existingStock} registros)`);
    }

    // =======================
    // 5. ÓRDENES PARA MOBILE SCANNER (PALETIZADO y VALIDADO)
    // =======================
    console.log('\n📱 Creando órdenes para mobile scanner...');
    const almacenCentral = await almacenRepo.findOneBy({ codigo: 'ALM-CENT' });

    // Verificar si ya existen órdenes de prueba para móvil
    const existingMobileOrders = await notaRepo.findOneBy({ nroDocumento: 'MOVIL-001' });

    if (!existingMobileOrders && almacenCentral) {
        // Orden 1: PALETIZADO (lista para validar)
        const orden1 = await notaRepo.save(notaRepo.create({
            nroDocumento: 'MOVIL-001',
            fechaIngreso: new Date(),
            origen: 'SAP Import',
            usuarioCreacion: 'SISTEMA',
            estado: 0, // PALETIZADO
            almacen: almacenCentral,
            observacion: 'Orden de prueba - PALETIZADO (escanear para validar)',
        }));

        // Detalles con códigos de barra para escanear
        await detalleRepo.save(detalleRepo.create({
            codItem: 'FARM-001',
            cantidad: 50,
            lote: 'LOTE-M001',
            fechaVencimiento: new Date('2026-06-30'),
            productCodes: { barcode: '7501234567890', sku: 'FARM-001' },
            notaIngreso: orden1,
        }));
        await detalleRepo.save(detalleRepo.create({
            codItem: 'ELEC-001',
            cantidad: 100,
            lote: 'LOTE-M002',
            productCodes: { barcode: '7509876543210', sku: 'ELEC-001' },
            notaIngreso: orden1,
        }));
        console.log(`  ✓ Creada orden PALETIZADO: ${orden1.nroDocumento} (2 items)`);

        // Orden 2: PALETIZADO también
        const orden2 = await notaRepo.save(notaRepo.create({
            nroDocumento: 'MOVIL-002',
            fechaIngreso: new Date(),
            origen: 'Producción',
            usuarioCreacion: 'SISTEMA',
            estado: 0, // PALETIZADO
            almacen: almacenCentral,
            observacion: 'Orden de prueba - PALETIZADO',
        }));

        await detalleRepo.save(detalleRepo.create({
            codItem: 'ALIM-001',
            cantidad: 200,
            lote: 'LOTE-A100',
            fechaVencimiento: new Date('2025-08-15'),
            productCodes: { barcode: '7502222111000', sku: 'ALIM-001' },
            notaIngreso: orden2,
        }));
        console.log(`  ✓ Creada orden PALETIZADO: ${orden2.nroDocumento} (1 item)`);

        // Orden 3: VALIDADO (lista para almacenar)
        const orden3 = await notaRepo.save(notaRepo.create({
            nroDocumento: 'MOVIL-003',
            fechaIngreso: new Date(),
            origen: 'Traspaso',
            usuarioCreacion: 'SISTEMA',
            usuarioValidacion: 'OPERARIO1',
            validatedAt: new Date(),
            estado: 1, // VALIDADO
            almacen: almacenCentral,
            observacion: 'Orden de prueba - VALIDADO (escanear para almacenar)',
        }));

        await detalleRepo.save(detalleRepo.create({
            codItem: 'PROD-001',
            cantidad: 30,
            lote: 'LOTE-P001',
            productCodes: { barcode: '7503333222000', sku: 'PROD-001' },
            notaIngreso: orden3,
        }));
        await detalleRepo.save(detalleRepo.create({
            codItem: 'PROD-002',
            cantidad: 25,
            lote: 'LOTE-P002',
            productCodes: { barcode: '7503333222001', sku: 'PROD-002' },
            notaIngreso: orden3,
        }));
        console.log(`  ✓ Creada orden VALIDADO: ${orden3.nroDocumento} (2 items)`);

        console.log('\n  📌 Códigos para escanear:');
        console.log('     VALIDAR: 7501234567890, 7509876543210, 7502222111000');
        console.log('     ALMACENAR: 7503333222000, 7503333222001');
    } else if (existingMobileOrders) {
        console.log('  → Ya existen órdenes móviles');
    }

    console.log('\n✅ Seeders completados exitosamente!');
    console.log('\nResumen:');
    console.log(`  - Almacenes: ${almacenData.length}`);
    console.log(`  - Items: ${itemsData.length}`);
    console.log(`  - Documentos SAP: ${docsData.length}`);
    console.log(`  - Stock de prueba: creado`);
    console.log(`  - Órdenes móviles: 3 (2 PALETIZADO, 1 VALIDADO)`);

    await app.close();
    process.exit(0);
}

seed().catch((error) => {
    console.error('❌ Error en seeders:', error);
    process.exit(1);
});
