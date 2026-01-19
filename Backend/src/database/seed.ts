import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Almacen } from '../almacen/entities/almacen.entity';
import { Item } from '../item/entities/item.entity';
import { DocumentoOrigen } from '../documento_origen/entities/documento_origen.entity';
import { ItemDocumentoOrigen } from '../item_documento_origen/entities/item_documento_origen.entity';
import { NotaIngreso } from '../nota_ingreso/entities/nota_ingreso.entity';
import { DetalleIngreso, ProductCodes } from '../detalle_ingreso/entities/detalle_ingreso.entity';
import { StockInventario } from '../stock_inventario/entities/stock_inventario.entity';
import { Inventario } from '../inventario/entities/inventario.entity';
import { HistorialEstado } from '../historial_estado/entities/historial_estado.entity';

/**
 * Script de Seeders Completos para WMS
 * Ejecutar con: npm run seed
 * 
 * Tablas que se seedean:
 * 1. Almacen
 * 2. Item (Catálogo de productos)
 * 3. DocumentoOrigen (Documentos SAP/externos)
 * 4. ItemDocumentoOrigen (Ítems de documentos)
 * 5. NotaIngreso (Órdenes de ingreso)
 * 6. DetalleIngreso (Detalles de cada orden)
 * 7. StockInventario (Stock por ubicación)
 * 8. Inventario (Control de inventarios)
 * 9. HistorialEstado (Auditoría de cambios de estado)
 */

interface DetalleData {
    codItem: string;
    cantidad: number;
    cantidadEsperada: number;
    lote: string;
    fechaVencimiento?: Date | null;
    ubicacionFinal?: string;
    productCodes?: ProductCodes;
}

interface NotaData {
    nroDocumento: string;
    origen: string;
    estado: number;
    observacion: string;
    usuarioCreacion: string;
    usuarioValidacion?: string;
    usuarioAlmacenaje?: string;
    almacenCodigo: string;
    detalles: DetalleData[];
}

async function seed() {
    console.log('🌱 Iniciando seeders completos para WMS...');
    console.log('═'.repeat(50));

    // Usar NestFactory para obtener la conexión configurada
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    console.log('✅ Conexión establecida usando configuración existente\n');

    // Repositorios
    const almacenRepo = dataSource.getRepository(Almacen);
    const itemRepo = dataSource.getRepository(Item);
    const documentoRepo = dataSource.getRepository(DocumentoOrigen);
    const itemDocRepo = dataSource.getRepository(ItemDocumentoOrigen);
    const notaRepo = dataSource.getRepository(NotaIngreso);
    const detalleRepo = dataSource.getRepository(DetalleIngreso);
    const stockRepo = dataSource.getRepository(StockInventario);
    const inventarioRepo = dataSource.getRepository(Inventario);
    const historialRepo = dataSource.getRepository(HistorialEstado);

    // =======================
    // 1. ALMACENES
    // =======================
    console.log('📦 [1/9] Creando almacenes...');
    const almacenData = [
        { codigo: 'ALM-CENT', descripcion: 'Almacén Central', sucursalId: 1, estado: 1 },
        { codigo: 'ALM-SEC', descripcion: 'Almacén Secundario', sucursalId: 1, estado: 1 },
        { codigo: 'ALM-FRIO', descripcion: 'Almacén Refrigerado', sucursalId: 1, estado: 1 },
        { codigo: 'ALM-PELIG', descripcion: 'Almacén Materiales Peligrosos', sucursalId: 2, estado: 1 },
        { codigo: 'ALM-TEMP', descripcion: 'Almacén Temporal', sucursalId: 1, estado: 0 },
    ];

    const almacenes: Record<string, Almacen> = {};
    for (const data of almacenData) {
        let almacen = await almacenRepo.findOneBy({ codigo: data.codigo });
        if (!almacen) {
            almacen = await almacenRepo.save(almacenRepo.create(data));
            console.log(`  ✓ Creado: ${data.descripcion}`);
        } else {
            console.log(`  → Ya existe: ${data.descripcion}`);
        }
        almacenes[data.codigo] = almacen;
    }

    // =======================
    // 2. ITEMS (Catálogo de Productos)
    // =======================
    console.log('\n📋 [2/9] Creando catálogo de items...');
    const itemsData = [
        // Ferretería
        { codigo: 'PROD-001', descripcion: 'Taladro Percutor Bosch', unidadMedida: 'UNID', precio: 150.00, codSubcategoria: 'FERR-01', estado: 1, stock: 0 },
        { codigo: 'PROD-002', descripcion: 'Martillo de Goma', unidadMedida: 'PZA', precio: 25.50, codSubcategoria: 'FERR-01', estado: 1, stock: 0 },
        { codigo: 'PROD-003', descripcion: 'Destornillador Phillips', unidadMedida: 'UNID', precio: 12.00, codSubcategoria: 'FERR-01', estado: 1, stock: 0 },
        { codigo: 'PROD-004', descripcion: 'Llave Inglesa 10"', unidadMedida: 'UNID', precio: 35.00, codSubcategoria: 'FERR-01', estado: 1, stock: 0 },
        // Farmacéuticos
        { codigo: 'FARM-001', descripcion: 'Paracetamol 500mg', unidadMedida: 'CAJA', precio: 12.00, codSubcategoria: 'FARM-01', estado: 1, stock: 0 },
        { codigo: 'FARM-002', descripcion: 'Ibuprofeno 400mg', unidadMedida: 'CAJA', precio: 15.00, codSubcategoria: 'FARM-01', estado: 1, stock: 0 },
        { codigo: 'FARM-003', descripcion: 'Omeprazol 20mg', unidadMedida: 'CAJA', precio: 18.00, codSubcategoria: 'FARM-01', estado: 1, stock: 0 },
        { codigo: 'FARM-004', descripcion: 'Amoxicilina 500mg', unidadMedida: 'CAJA', precio: 22.00, codSubcategoria: 'FARM-01', estado: 1, stock: 0 },
        { codigo: 'FARM-005', descripcion: 'Vitamina C 1000mg', unidadMedida: 'FRASCO', precio: 28.00, codSubcategoria: 'FARM-02', estado: 1, stock: 0 },
        // Electrónicos
        { codigo: 'ELEC-001', descripcion: 'Cable USB-C 1m', unidadMedida: 'UNID', precio: 8.00, codSubcategoria: 'ELEC-01', estado: 1, stock: 0 },
        { codigo: 'ELEC-002', descripcion: 'Cargador 20W', unidadMedida: 'UNID', precio: 25.00, codSubcategoria: 'ELEC-01', estado: 1, stock: 0 },
        { codigo: 'ELEC-003', descripcion: 'Audífonos Bluetooth', unidadMedida: 'UNID', precio: 45.00, codSubcategoria: 'ELEC-02', estado: 1, stock: 0 },
        { codigo: 'ELEC-004', descripcion: 'Mouse Inalámbrico', unidadMedida: 'UNID', precio: 35.00, codSubcategoria: 'ELEC-02', estado: 1, stock: 0 },
        { codigo: 'ELEC-005', descripcion: 'Teclado Mecánico', unidadMedida: 'UNID', precio: 85.00, codSubcategoria: 'ELEC-02', estado: 1, stock: 0 },
        // Alimentos
        { codigo: 'ALIM-001', descripcion: 'Leche Entera 1L', unidadMedida: 'UNID', precio: 3.50, codSubcategoria: 'ALIM-01', estado: 1, stock: 0 },
        { codigo: 'ALIM-002', descripcion: 'Aceite Vegetal 1L', unidadMedida: 'UNID', precio: 4.80, codSubcategoria: 'ALIM-02', estado: 1, stock: 0 },
        { codigo: 'ALIM-003', descripcion: 'Arroz Premium 1kg', unidadMedida: 'KG', precio: 2.50, codSubcategoria: 'ALIM-02', estado: 1, stock: 0 },
        { codigo: 'ALIM-004', descripcion: 'Atún en Lata', unidadMedida: 'UNID', precio: 5.00, codSubcategoria: 'ALIM-03', estado: 1, stock: 0 },
        { codigo: 'ALIM-005', descripcion: 'Pasta Spaghetti 500g', unidadMedida: 'UNID', precio: 2.80, codSubcategoria: 'ALIM-02', estado: 1, stock: 0 },
        { codigo: 'ALIM-006', descripcion: 'Galletas Oreo', unidadMedida: 'PQTE', precio: 3.20, codSubcategoria: 'ALIM-04', estado: 1, stock: 0 },
        // Limpieza
        { codigo: 'LIMP-001', descripcion: 'Detergente Líquido 1L', unidadMedida: 'UNID', precio: 8.50, codSubcategoria: 'LIMP-01', estado: 1, stock: 0 },
        { codigo: 'LIMP-002', descripcion: 'Desinfectante 500ml', unidadMedida: 'UNID', precio: 6.00, codSubcategoria: 'LIMP-01', estado: 1, stock: 0 },
        { codigo: 'LIMP-003', descripcion: 'Esponja Multiusos', unidadMedida: 'PQTE', precio: 4.50, codSubcategoria: 'LIMP-02', estado: 1, stock: 0 },
        // Oficina
        { codigo: 'OFIC-001', descripcion: 'Papel Bond A4 500 hojas', unidadMedida: 'RESMA', precio: 15.00, codSubcategoria: 'OFIC-01', estado: 1, stock: 0 },
        { codigo: 'OFIC-002', descripcion: 'Bolígrafos Azules x12', unidadMedida: 'CAJA', precio: 8.00, codSubcategoria: 'OFIC-01', estado: 1, stock: 0 },
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
    // 3. DOCUMENTOS DE ORIGEN (SAP/ERP)
    // =======================
    console.log('\n📄 [3/9] Creando documentos de origen (SAP/ERP)...');
    const docsData = [
        {
            nroDocumento: 'SAP-2024-001',
            descripcion: 'Semillas y Fertilizantes - Proveedor Externo',
            tipoFuente: 'API_ERP',
            proveedor: 'Proveedor Externo API',
            fechaDocumento: new Date('2024-01-15'),
            estado: 'pendiente',
            datosRaw: { pedido: 'PO-2024-001' },
            items: [
                { codItem: 'PRD-001', descripcion: 'Semilla Soja Premium Variety A', cantidad: 100, lote: 'L2025-100', fechaVencimiento: new Date('2026-06-30') },
                { codItem: 'PRD-002', descripcion: 'Fertilizante NPK 10-10-10', cantidad: 50, lote: 'L2025-101', fechaVencimiento: new Date('2026-12-31') },
            ],
        },
        {
            nroDocumento: 'SAP-2024-002',
            descripcion: 'Herbicidas - Lote Especial',
            tipoFuente: 'API_ERP',
            proveedor: 'Proveedor Externo API',
            fechaDocumento: new Date('2024-01-20'),
            estado: 'pendiente',
            datosRaw: { pedido: 'PO-2024-002' },
            items: [
                { codItem: 'PRD-003', descripcion: 'Herbicida Glifosato Standard', cantidad: 200, lote: 'L2025-102', fechaVencimiento: new Date('2025-12-15') },
            ],
        },
        {
            nroDocumento: 'INT-2024-001',
            descripcion: 'Productos Internos - SGLA',
            tipoFuente: 'MANUAL',
            proveedor: 'Base Interna SGLA',
            fechaDocumento: new Date('2024-02-01'),
            estado: 'pendiente',
            datosRaw: { origen: 'interno' },
            items: [
                { codItem: 'PRD-LOCAL-01', descripcion: 'Maíz Híbrido Nacional', cantidad: 500, lote: 'L-INT-001', fechaVencimiento: new Date('2025-10-20') },
            ],
        },
        {
            nroDocumento: 'SAP-2024-003',
            descripcion: 'Alimentos - Productos Básicos',
            tipoFuente: 'API_ERP',
            proveedor: 'Distribuidora Alimentos',
            fechaDocumento: new Date('2024-03-10'),
            estado: 'procesado',
            datosRaw: { pedido: 'PO-2024-003' },
            items: [
                { codItem: 'ALIM-001', descripcion: 'Leche Entera 1L', cantidad: 500, lote: 'A2025-200', fechaVencimiento: new Date('2025-03-01') },
                { codItem: 'ALIM-002', descripcion: 'Aceite Vegetal 1L', cantidad: 300, lote: 'A2025-201', fechaVencimiento: new Date('2025-04-15') },
            ],
        },
        {
            nroDocumento: 'SAP-2024-004',
            descripcion: 'Herramientas de Construcción',
            tipoFuente: 'API_ERP',
            proveedor: 'Ferretería Industrial',
            fechaDocumento: new Date('2024-04-05'),
            estado: 'pendiente',
            datosRaw: { pedido: 'PO-2024-004' },
            items: [
                { codItem: 'PROD-001', descripcion: 'Taladro Percutor Bosch', cantidad: 50, lote: 'LOTE-P001' },
                { codItem: 'PROD-002', descripcion: 'Martillo de Goma', cantidad: 100, lote: 'LOTE-P002' },
            ],
        },
        {
            nroDocumento: 'INT-2024-002',
            descripcion: 'Suministros de Oficina',
            tipoFuente: 'MANUAL',
            proveedor: 'Office Depot',
            fechaDocumento: new Date('2024-05-01'),
            estado: 'pendiente',
            datosRaw: { origen: 'compra_local' },
            items: [
                { codItem: 'OFIC-001', descripcion: 'Papel Bond A4 500 hojas', cantidad: 100, lote: 'OFC-2024-01' },
                { codItem: 'OFIC-002', descripcion: 'Bolígrafos Azules x12', cantidad: 50, lote: 'OFC-2024-02' },
            ],
        },
    ];

    for (const docData of docsData) {
        const existing = await documentoRepo.findOneBy({ nroDocumento: docData.nroDocumento });
        if (!existing) {
            const doc = await documentoRepo.save(documentoRepo.create({
                nroDocumento: docData.nroDocumento,
                descripcion: docData.descripcion,
                tipoFuente: docData.tipoFuente as any,
                proveedor: docData.proveedor,
                fechaDocumento: docData.fechaDocumento,
                estado: docData.estado,
                datosRaw: docData.datosRaw,
            }));

            for (const itemData of docData.items) {
                await itemDocRepo.save(itemDocRepo.create({
                    codItem: itemData.codItem,
                    descripcion: itemData.descripcion,
                    cantidad: itemData.cantidad,
                    lote: itemData.lote,
                    fechaVencimiento: 'fechaVencimiento' in itemData ? itemData.fechaVencimiento : undefined,
                    documento: doc,
                }));
            }
            console.log(`  ✓ Creado: ${docData.nroDocumento} - ${docData.descripcion} (${docData.items.length} items)`);
        } else {
            console.log(`  → Ya existe: ${docData.nroDocumento}`);
        }
    }

    // =======================
    // 4. NOTAS DE INGRESO (Órdenes)
    // =======================
    console.log('\n📝 [4/9] Creando notas de ingreso...');
    const notasData: NotaData[] = [
        {
            nroDocumento: 'ING-2024-001',
            origen: 'SAP Import',
            estado: 2, // ALMACENADO
            observacion: 'Ingreso de productos farmacéuticos',
            usuarioCreacion: 'admin',
            usuarioValidacion: 'operario1',
            usuarioAlmacenaje: 'operario2',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'FARM-001', cantidad: 100, cantidadEsperada: 100, lote: 'L2025-001', fechaVencimiento: new Date('2025-12-31'), ubicacionFinal: 'A-01-01-01' },
                { codItem: 'FARM-002', cantidad: 50, cantidadEsperada: 50, lote: 'L2025-002', fechaVencimiento: new Date('2025-06-15'), ubicacionFinal: 'A-01-01-02' },
                { codItem: 'FARM-003', cantidad: 75, cantidadEsperada: 75, lote: 'L2025-003', fechaVencimiento: new Date('2025-08-20'), ubicacionFinal: 'A-01-02-01' },
            ],
        },
        {
            nroDocumento: 'ING-2024-002',
            origen: 'SAP Import',
            estado: 2, // ALMACENADO
            observacion: 'Ingreso de electrónicos',
            usuarioCreacion: 'admin',
            usuarioValidacion: 'operario1',
            usuarioAlmacenaje: 'operario2',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'ELEC-001', cantidad: 200, cantidadEsperada: 200, lote: 'E2024-100', fechaVencimiento: null, ubicacionFinal: 'B-02-01-01' },
                { codItem: 'ELEC-002', cantidad: 100, cantidadEsperada: 100, lote: 'E2024-101', fechaVencimiento: null, ubicacionFinal: 'B-02-01-02' },
            ],
        },
        {
            nroDocumento: 'ING-2024-003',
            origen: 'Producción',
            estado: 2, // ALMACENADO
            observacion: 'Ingreso de alimentos',
            usuarioCreacion: 'admin',
            usuarioValidacion: 'operario1',
            usuarioAlmacenaje: 'operario3',
            almacenCodigo: 'ALM-FRIO',
            detalles: [
                { codItem: 'ALIM-001', cantidad: 500, cantidadEsperada: 500, lote: 'A2025-200', fechaVencimiento: new Date('2025-03-01'), ubicacionFinal: 'C-01-01-01' },
                { codItem: 'ALIM-002', cantidad: 300, cantidadEsperada: 300, lote: 'A2025-201', fechaVencimiento: new Date('2025-04-15'), ubicacionFinal: 'C-01-01-02' },
                { codItem: 'ALIM-003', cantidad: 400, cantidadEsperada: 400, lote: 'A2025-202', fechaVencimiento: new Date('2025-02-10'), ubicacionFinal: 'C-01-02-01' },
                { codItem: 'ALIM-004', cantidad: 600, cantidadEsperada: 600, lote: 'A2025-203', fechaVencimiento: new Date('2025-05-25'), ubicacionFinal: 'C-01-02-02' },
            ],
        },
        {
            nroDocumento: 'MOVIL-001',
            origen: 'SAP Import',
            estado: 0, // PALETIZADO
            observacion: 'Orden de prueba - PALETIZADO (escanear para validar)',
            usuarioCreacion: 'SISTEMA',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'FARM-004', cantidad: 50, cantidadEsperada: 50, lote: 'LOTE-M001', fechaVencimiento: new Date('2026-06-30'), productCodes: { barcode: '7501234567890', sku: 'FARM-004' } },
                { codItem: 'ELEC-003', cantidad: 100, cantidadEsperada: 100, lote: 'LOTE-M002', productCodes: { barcode: '7509876543210', sku: 'ELEC-003' } },
            ],
        },
        {
            nroDocumento: 'MOVIL-002',
            origen: 'Producción',
            estado: 0, // PALETIZADO
            observacion: 'Orden de prueba - PALETIZADO',
            usuarioCreacion: 'SISTEMA',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'ALIM-005', cantidad: 200, cantidadEsperada: 200, lote: 'LOTE-A100', fechaVencimiento: new Date('2025-08-15'), productCodes: { barcode: '7502222111000', sku: 'ALIM-005' } },
            ],
        },
        {
            nroDocumento: 'MOVIL-003',
            origen: 'Traspaso',
            estado: 1, // VALIDADO
            observacion: 'Orden de prueba - VALIDADO (escanear para almacenar)',
            usuarioCreacion: 'SISTEMA',
            usuarioValidacion: 'OPERARIO1',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'PROD-001', cantidad: 30, cantidadEsperada: 30, lote: 'LOTE-P001', productCodes: { barcode: '7503333222000', sku: 'PROD-001' } },
                { codItem: 'PROD-002', cantidad: 25, cantidadEsperada: 25, lote: 'LOTE-P002', productCodes: { barcode: '7503333222001', sku: 'PROD-002' } },
            ],
        },
        {
            nroDocumento: 'ING-2024-004',
            origen: 'Compra Local',
            estado: 3, // ANULADO
            observacion: 'Orden anulada por duplicidad',
            usuarioCreacion: 'admin',
            almacenCodigo: 'ALM-SEC',
            detalles: [
                { codItem: 'LIMP-001', cantidad: 50, cantidadEsperada: 50, lote: 'LOTE-L001' },
            ],
        },
    ];

    const notasCreadas: Record<string, NotaIngreso> = {};
    for (const notaData of notasData) {
        const existing = await notaRepo.findOneBy({ nroDocumento: notaData.nroDocumento });
        if (!existing) {
            const almacen = almacenes[notaData.almacenCodigo];
            if (!almacen) {
                console.log(`  ⚠ Almacén ${notaData.almacenCodigo} no encontrado, saltando...`);
                continue;
            }

            const nota = await notaRepo.save(notaRepo.create({
                nroDocumento: notaData.nroDocumento,
                fechaIngreso: new Date(),
                origen: notaData.origen,
                usuarioCreacion: notaData.usuarioCreacion,
                usuarioValidacion: notaData.usuarioValidacion,
                usuarioAlmacenaje: notaData.usuarioAlmacenaje,
                estado: notaData.estado,
                almacen: almacen,
                observacion: notaData.observacion,
                validatedAt: notaData.usuarioValidacion ? new Date() : undefined,
                storedAt: notaData.estado === 2 ? new Date() : undefined,
            }));

            for (const detalleData of notaData.detalles) {
                await detalleRepo.save(detalleRepo.create({
                    codItem: detalleData.codItem,
                    cantidad: detalleData.cantidad,
                    cantidadEsperada: detalleData.cantidadEsperada,
                    lote: detalleData.lote,
                    fechaVencimiento: detalleData.fechaVencimiento || undefined,
                    ubicacionFinal: detalleData.ubicacionFinal,
                    productCodes: detalleData.productCodes,
                    notaIngreso: nota,
                }));
            }

            notasCreadas[notaData.nroDocumento] = nota;
            console.log(`  ✓ Creada: ${notaData.nroDocumento} (${notaData.detalles.length} detalles)`);
        } else {
            notasCreadas[notaData.nroDocumento] = existing;
            console.log(`  → Ya existe: ${notaData.nroDocumento}`);
        }
    }

    // =======================
    // 5. STOCK INVENTARIO
    // =======================
    console.log('\n📊 [5/9] Creando stock de inventario...');
    const existingStock = await stockRepo.count();
    if (existingStock === 0) {
        const stockData = [
            { sku: 'FARM-001', ubicacion: 'A-01-01-01', cantidad: 100, estado: 'DISPONIBLE' },
            { sku: 'FARM-002', ubicacion: 'A-01-01-02', cantidad: 50, estado: 'DISPONIBLE' },
            { sku: 'FARM-003', ubicacion: 'A-01-02-01', cantidad: 75, estado: 'DISPONIBLE' },
            { sku: 'ELEC-001', ubicacion: 'B-02-01-01', cantidad: 200, estado: 'DISPONIBLE' },
            { sku: 'ELEC-002', ubicacion: 'B-02-01-02', cantidad: 100, estado: 'DISPONIBLE' },
            { sku: 'ALIM-001', ubicacion: 'C-01-01-01', cantidad: 500, estado: 'DISPONIBLE' },
            { sku: 'ALIM-002', ubicacion: 'C-01-01-02', cantidad: 300, estado: 'DISPONIBLE' },
            { sku: 'ALIM-003', ubicacion: 'C-01-02-01', cantidad: 400, estado: 'BLOQUEADO' }, // Próximo a vencer
            { sku: 'ALIM-004', ubicacion: 'C-01-02-02', cantidad: 600, estado: 'DISPONIBLE' },
            { sku: 'PROD-001', ubicacion: 'D-01-01-01', cantidad: 50, estado: 'DISPONIBLE' },
            { sku: 'PROD-002', ubicacion: 'D-01-01-02', cantidad: 15, estado: 'DISPONIBLE' },
            { sku: 'LIMP-001', ubicacion: 'E-01-01-01', cantidad: 80, estado: 'DISPONIBLE' },
            { sku: 'LIMP-002', ubicacion: 'E-01-01-02', cantidad: 120, estado: 'DISPONIBLE' },
            { sku: 'OFIC-001', ubicacion: 'F-01-01-01', cantidad: 200, estado: 'DISPONIBLE' },
            { sku: 'OFIC-002', ubicacion: 'F-01-01-02', cantidad: 100, estado: 'DISPONIBLE' },
        ];

        for (const data of stockData) {
            await stockRepo.save(stockRepo.create(data));
        }
        console.log(`  ✓ Creados ${stockData.length} registros de stock`);
    } else {
        console.log(`  → Ya existe stock (${existingStock} registros)`);
    }

    // =======================
    // 6. INVENTARIOS
    // =======================
    console.log('\n📋 [6/9] Creando inventarios...');
    const inventariosData = [
        {
            codigo: 'INV-2024-001',
            tipo: 'General',
            estado: 'Cerrado',
            fechaApertura: '2024-01-15',
            fechaCierre: '2024-01-20',
            bodega: 'Central',
            itemsContados: 150,
            itemsTotales: 150,
            diferencias: 3,
            responsable: 'Juan Pérez',
            almacenCodigo: 'ALM-CENT',
        },
        {
            codigo: 'INV-2024-002',
            tipo: 'Cíclico',
            estado: 'Cerrado',
            fechaApertura: '2024-03-01',
            fechaCierre: '2024-03-05',
            bodega: 'Farmacia',
            itemsContados: 45,
            itemsTotales: 50,
            diferencias: 5,
            responsable: 'María García',
            almacenCodigo: 'ALM-CENT',
        },
        {
            codigo: 'INV-2024-003',
            tipo: 'General',
            estado: 'En Proceso',
            fechaApertura: '2024-06-01',
            fechaCierre: undefined,
            bodega: 'Electrónicos',
            itemsContados: 80,
            itemsTotales: 120,
            diferencias: 0,
            responsable: 'Carlos López',
            almacenCodigo: 'ALM-SEC',
        },
        {
            codigo: 'INV-2024-004',
            tipo: 'Selectivo',
            estado: 'Abierto',
            fechaApertura: '2024-07-10',
            fechaCierre: undefined,
            bodega: 'Alimentos',
            itemsContados: 0,
            itemsTotales: 200,
            diferencias: 0,
            responsable: 'Ana Martínez',
            almacenCodigo: 'ALM-FRIO',
        },
        {
            codigo: 'INV-2025-001',
            tipo: 'General',
            estado: 'Abierto',
            fechaApertura: '2025-01-05',
            fechaCierre: undefined,
            bodega: 'Central',
            itemsContados: 25,
            itemsTotales: 500,
            diferencias: 0,
            responsable: 'Pedro Sánchez',
            almacenCodigo: 'ALM-CENT',
        },
    ];

    for (const invData of inventariosData) {
        const existing = await inventarioRepo.findOneBy({ codigo: invData.codigo });
        if (!existing) {
            const almacen = almacenes[invData.almacenCodigo];
            if (!almacen) {
                console.log(`  ⚠ Almacén ${invData.almacenCodigo} no encontrado, saltando...`);
                continue;
            }

            // Usar query raw para insertar con almacen_id
            await dataSource.query(
                `INSERT INTO inventario (codigo, tipo, estado, fecha_apertura, fecha_cierre, bodega, items_contados, items_totales, diferencias, responsable, almacen_id) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                    invData.codigo,
                    invData.tipo,
                    invData.estado,
                    invData.fechaApertura,
                    invData.fechaCierre || null,
                    invData.bodega,
                    invData.itemsContados,
                    invData.itemsTotales,
                    invData.diferencias,
                    invData.responsable,
                    almacen.id,
                ]
            );
            console.log(`  ✓ Creado: ${invData.codigo} - ${invData.tipo} (${invData.estado})`);
        } else {
            console.log(`  → Ya existe: ${invData.codigo}`);
        }
    }

    // =======================
    // 7. HISTORIAL DE ESTADOS
    // =======================
    console.log('\n📜 [7/9] Creando historial de estados...');
    const existingHistorial = await historialRepo.count();
    if (existingHistorial === 0) {
        // Buscar notas para agregar historial
        const notaAlmacenada1 = await notaRepo.findOneBy({ nroDocumento: 'ING-2024-001' });
        const notaAlmacenada2 = await notaRepo.findOneBy({ nroDocumento: 'ING-2024-002' });
        const notaAlmacenada3 = await notaRepo.findOneBy({ nroDocumento: 'ING-2024-003' });
        const notaAnulada = await notaRepo.findOneBy({ nroDocumento: 'ING-2024-004' });
        const notaValidada = await notaRepo.findOneBy({ nroDocumento: 'MOVIL-003' });

        const historialData: Array<{
            notaIngreso: NotaIngreso;
            estadoAnterior: number;
            estadoNuevo: number;
            usuario: string;
            motivo: string;
        }> = [];

        if (notaAlmacenada1) {
            historialData.push(
                { notaIngreso: notaAlmacenada1, estadoAnterior: 0, estadoNuevo: 1, usuario: 'operario1', motivo: 'Validación completada - todos los items escaneados' },
                { notaIngreso: notaAlmacenada1, estadoAnterior: 1, estadoNuevo: 2, usuario: 'operario2', motivo: 'Almacenamiento completado en zona A' },
            );
        }

        if (notaAlmacenada2) {
            historialData.push(
                { notaIngreso: notaAlmacenada2, estadoAnterior: 0, estadoNuevo: 1, usuario: 'operario1', motivo: 'Validación completada' },
                { notaIngreso: notaAlmacenada2, estadoAnterior: 1, estadoNuevo: 2, usuario: 'operario2', motivo: 'Almacenamiento en zona B' },
            );
        }

        if (notaAlmacenada3) {
            historialData.push(
                { notaIngreso: notaAlmacenada3, estadoAnterior: 0, estadoNuevo: 1, usuario: 'operario1', motivo: 'Validación de alimentos refrigerados' },
                { notaIngreso: notaAlmacenada3, estadoAnterior: 1, estadoNuevo: 2, usuario: 'operario3', motivo: 'Almacenado en cámara frigorífica' },
            );
        }

        if (notaAnulada) {
            historialData.push(
                { notaIngreso: notaAnulada, estadoAnterior: 0, estadoNuevo: 3, usuario: 'admin', motivo: 'Anulado por orden duplicada - ver ING-2024-002' },
            );
        }

        if (notaValidada) {
            historialData.push(
                { notaIngreso: notaValidada, estadoAnterior: 0, estadoNuevo: 1, usuario: 'OPERARIO1', motivo: 'Validación desde scanner móvil' },
            );
        }

        for (const data of historialData) {
            await historialRepo.save(historialRepo.create({
                notaIngreso: data.notaIngreso,
                notaIngresoId: data.notaIngreso.id,
                estadoAnterior: data.estadoAnterior,
                estadoNuevo: data.estadoNuevo,
                usuario: data.usuario,
                motivo: data.motivo,
            }));
        }
        console.log(`  ✓ Creados ${historialData.length} registros de historial`);
    } else {
        console.log(`  → Ya existe historial (${existingHistorial} registros)`);
    }

    // =======================
    // 8. ACTUALIZAR STOCK EN ITEMS
    // =======================
    console.log('\n🔄 [8/9] Actualizando stock en catálogo de items...');
    const stockActualizaciones = [
        { codigo: 'FARM-001', stock: 100 },
        { codigo: 'FARM-002', stock: 50 },
        { codigo: 'FARM-003', stock: 75 },
        { codigo: 'ELEC-001', stock: 200 },
        { codigo: 'ELEC-002', stock: 100 },
        { codigo: 'ALIM-001', stock: 500 },
        { codigo: 'ALIM-002', stock: 300 },
        { codigo: 'ALIM-003', stock: 400 },
        { codigo: 'ALIM-004', stock: 600 },
        { codigo: 'PROD-001', stock: 50 },
        { codigo: 'PROD-002', stock: 15 },
        { codigo: 'LIMP-001', stock: 80 },
        { codigo: 'LIMP-002', stock: 120 },
        { codigo: 'OFIC-001', stock: 200 },
        { codigo: 'OFIC-002', stock: 100 },
    ];

    for (const update of stockActualizaciones) {
        await itemRepo.update({ codigo: update.codigo }, { stock: update.stock });
    }
    console.log(`  ✓ Actualizados ${stockActualizaciones.length} items con stock`);

    // =======================
    // 9. RESUMEN FINAL
    // =======================
    console.log('\n' + '═'.repeat(50));
    console.log('✅ SEEDERS COMPLETADOS EXITOSAMENTE!');
    console.log('═'.repeat(50));
    console.log('\n📊 Resumen de datos creados:');
    console.log(`  ├── Almacenes: ${almacenData.length}`);
    console.log(`  ├── Items (Catálogo): ${itemsData.length}`);
    console.log(`  ├── Documentos SAP: ${docsData.length}`);
    console.log(`  ├── Notas de Ingreso: ${notasData.length}`);
    console.log(`  ├── Stock Inventario: 15 registros`);
    console.log(`  ├── Inventarios: ${inventariosData.length}`);
    console.log(`  └── Historial Estados: 9 registros`);

    console.log('\n📱 Órdenes para Mobile Scanner:');
    console.log('  ├── PALETIZADO: MOVIL-001, MOVIL-002');
    console.log('  └── VALIDADO: MOVIL-003');

    console.log('\n📌 Códigos de barra para pruebas:');
    console.log('  ├── VALIDAR: 7501234567890, 7509876543210, 7502222111000');
    console.log('  └── ALMACENAR: 7503333222000, 7503333222001');

    await app.close();
    process.exit(0);
}

seed().catch((error) => {
    console.error('❌ Error en seeders:', error);
    process.exit(1);
});
