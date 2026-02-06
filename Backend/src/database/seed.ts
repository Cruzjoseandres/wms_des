import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Almacen } from '../almacen/entities/almacen.entity';
import { Item } from '../item/entities/item.entity';
import { DocumentoOrigen } from '../documento_origen/entities/documento_origen.entity';
import { ItemDocumentoOrigen } from '../item_documento_origen/entities/item_documento_origen.entity';
import { NotaIngreso } from '../nota_ingreso/entities/nota_ingreso.entity';
import { DetalleIngreso } from '../detalle_ingreso/entities/detalle_ingreso.entity';
import { StockInventario } from '../stock_inventario/entities/stock_inventario.entity';
import { Inventario } from '../inventario/entities/inventario.entity';
import { HistorialEstado } from '../historial_estado/entities/historial_estado.entity';
import { Proveedor } from '../proveedor/entities/proveedor.entity';
import * as bwipjs from 'bwip-js';
import * as fs from 'fs';
import * as path from 'path';

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
    const proveedorRepo = dataSource.getRepository(Proveedor);

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
    // 2. PROVEEDORES
    // =======================
    console.log('\n🏢 [2/10] Creando proveedores...');
    const proveedoresData = [
        { codigo: 'PROV-001', nombre: 'Distribuidora Farmacéutica S.A.', ruc: '20123456789', direccion: 'Av. Principal 123', telefono: '01-2345678', email: 'ventas@farmadist.com', contacto: 'Juan Pérez' },
        { codigo: 'PROV-002', nombre: 'Electrónicos Global', ruc: '20987654321', direccion: 'Jr. Comercio 456', telefono: '01-8765432', email: 'pedidos@electroglobal.com', contacto: 'María García' },
        { codigo: 'PROV-003', nombre: 'Alimentos del Sur', ruc: '20456789123', direccion: 'Calle Industrial 789', telefono: '01-3456789', email: 'compras@alimentossur.com', contacto: 'Carlos López' },
        { codigo: 'PROV-004', nombre: 'Ferretería Industrial', ruc: '20789123456', direccion: 'Av. Maquinaria 321', telefono: '01-6543210', email: 'ventas@ferreindustrial.com', contacto: 'Ana Martínez' },
        { codigo: 'PROV-005', nombre: 'Office Depot', ruc: '20321654987', direccion: 'Jr. Oficinas 654', telefono: '01-1234567', email: 'empresas@officedepot.com', contacto: 'Pedro Sánchez' },
        { codigo: 'PROV-006', nombre: 'Limpieza Total', ruc: '20654987321', direccion: 'Av. Limpieza 987', telefono: '01-9876543', email: 'ventas@limpiezatotal.com', contacto: 'Rosa Torres' },
    ];

    const proveedores: Record<string, Proveedor> = {};
    for (const data of proveedoresData) {
        let proveedor = await proveedorRepo.findOneBy({ codigo: data.codigo });
        if (!proveedor) {
            proveedor = await proveedorRepo.save(proveedorRepo.create(data));
            console.log(`  ✓ Creado: ${data.nombre}`);
        } else {
            console.log(`  → Ya existe: ${data.nombre}`);
        }
        proveedores[data.codigo] = proveedor;
    }

    // =======================
    // 3. ITEMS (Catálogo de Productos)
    // =======================
    console.log('\n📋 [3/10] Creando catálogo de items...');
    const itemsData = [
        // Ferretería - Proveedor PROV-004
        { codigo: 'PROD-001', descripcion: 'Taladro Percutor Bosch', unidadMedida: 'UNID', precio: 150.00, codSubcategoria: 'FERR-01', estado: 1, stock: 0, codigoBarra: '7501234567001', codigoFabrica: 'BOSCH-TPB-001', codigoProducto: 'TAL-PERC-01', proveedorCodigo: 'PROV-004' },
        { codigo: 'PROD-002', descripcion: 'Martillo de Goma', unidadMedida: 'PZA', precio: 25.50, codSubcategoria: 'FERR-01', estado: 1, stock: 0, codigoBarra: '7501234567002', codigoFabrica: 'STAN-MG-002', codigoProducto: 'MART-GOM-02', proveedorCodigo: 'PROV-004' },
        { codigo: 'PROD-003', descripcion: 'Destornillador Phillips', unidadMedida: 'UNID', precio: 12.00, codSubcategoria: 'FERR-01', estado: 1, stock: 0, codigoBarra: '7501234567003', codigoFabrica: 'STAN-DP-003', codigoProducto: 'DEST-PHI-03', proveedorCodigo: 'PROV-004' },
        { codigo: 'PROD-004', descripcion: 'Llave Inglesa 10"', unidadMedida: 'UNID', precio: 35.00, codSubcategoria: 'FERR-01', estado: 1, stock: 0, codigoBarra: '7501234567004', codigoFabrica: 'STAN-LI-004', codigoProducto: 'LLAV-ING-04', proveedorCodigo: 'PROV-004' },
        // Farmacéuticos - Proveedor PROV-001
        { codigo: 'FARM-001', descripcion: 'Paracetamol 500mg', unidadMedida: 'CAJA', precio: 12.00, codSubcategoria: 'FARM-01', estado: 1, stock: 0, codigoBarra: '7502222111001', codigoFabrica: 'BAYER-PC-500', codigoProducto: 'PARA-500-01', proveedorCodigo: 'PROV-001' },
        { codigo: 'FARM-002', descripcion: 'Ibuprofeno 400mg', unidadMedida: 'CAJA', precio: 15.00, codSubcategoria: 'FARM-01', estado: 1, stock: 0, codigoBarra: '7502222111002', codigoFabrica: 'BAYER-IB-400', codigoProducto: 'IBUP-400-02', proveedorCodigo: 'PROV-001' },
        { codigo: 'FARM-003', descripcion: 'Omeprazol 20mg', unidadMedida: 'CAJA', precio: 18.00, codSubcategoria: 'FARM-01', estado: 1, stock: 0, codigoBarra: '7502222111003', codigoFabrica: 'PFIZ-OM-020', codigoProducto: 'OMEP-020-03', proveedorCodigo: 'PROV-001' },
        { codigo: 'FARM-004', descripcion: 'Amoxicilina 500mg', unidadMedida: 'CAJA', precio: 22.00, codSubcategoria: 'FARM-01', estado: 1, stock: 0, codigoBarra: '7502222111004', codigoFabrica: 'GLAX-AM-500', codigoProducto: 'AMOX-500-04', proveedorCodigo: 'PROV-001' },
        { codigo: 'FARM-005', descripcion: 'Vitamina C 1000mg', unidadMedida: 'FRASCO', precio: 28.00, codSubcategoria: 'FARM-02', estado: 1, stock: 0, codigoBarra: '7502222111005', codigoFabrica: 'PFIZ-VC-1000', codigoProducto: 'VITC-1000-05', proveedorCodigo: 'PROV-001' },
        // Electrónicos - Proveedor PROV-002
        { codigo: 'ELEC-001', descripcion: 'Cable USB-C 1m', unidadMedida: 'UNID', precio: 8.00, codSubcategoria: 'ELEC-01', estado: 1, stock: 0, codigoBarra: '7503333222001', codigoFabrica: 'ANKE-USB-C1', codigoProducto: 'CABL-USBC-01', proveedorCodigo: 'PROV-002' },
        { codigo: 'ELEC-002', descripcion: 'Cargador 20W', unidadMedida: 'UNID', precio: 25.00, codSubcategoria: 'ELEC-01', estado: 1, stock: 0, codigoBarra: '7503333222002', codigoFabrica: 'ANKE-CRG-20W', codigoProducto: 'CARG-20W-02', proveedorCodigo: 'PROV-002' },
        { codigo: 'ELEC-003', descripcion: 'Audífonos Bluetooth', unidadMedida: 'UNID', precio: 45.00, codSubcategoria: 'ELEC-02', estado: 1, stock: 0, codigoBarra: '7503333222003', codigoFabrica: 'SONY-ABT-01', codigoProducto: 'AUDI-BT-03', proveedorCodigo: 'PROV-002' },
        { codigo: 'ELEC-004', descripcion: 'Mouse Inalámbrico', unidadMedida: 'UNID', precio: 35.00, codSubcategoria: 'ELEC-02', estado: 1, stock: 0, codigoBarra: '7503333222004', codigoFabrica: 'LOGI-MW-01', codigoProducto: 'MOUS-INL-04', proveedorCodigo: 'PROV-002' },
        { codigo: 'ELEC-005', descripcion: 'Teclado Mecánico', unidadMedida: 'UNID', precio: 85.00, codSubcategoria: 'ELEC-02', estado: 1, stock: 0, codigoBarra: '7503333222005', codigoFabrica: 'LOGI-TM-01', codigoProducto: 'TECL-MEC-05', proveedorCodigo: 'PROV-002' },
        // Alimentos - Proveedor PROV-003
        { codigo: 'ALIM-001', descripcion: 'Leche Entera 1L', unidadMedida: 'UNID', precio: 3.50, codSubcategoria: 'ALIM-01', estado: 1, stock: 0, codigoBarra: '7504444333001', codigoFabrica: 'GLORIA-LE-1L', codigoProducto: 'LECH-ENT-01', proveedorCodigo: 'PROV-003' },
        { codigo: 'ALIM-002', descripcion: 'Aceite Vegetal 1L', unidadMedida: 'UNID', precio: 4.80, codSubcategoria: 'ALIM-02', estado: 1, stock: 0, codigoBarra: '7504444333002', codigoFabrica: 'PRIMOR-AV-1L', codigoProducto: 'ACEI-VEG-02', proveedorCodigo: 'PROV-003' },
        { codigo: 'ALIM-003', descripcion: 'Arroz Premium 1kg', unidadMedida: 'KG', precio: 2.50, codSubcategoria: 'ALIM-02', estado: 1, stock: 0, codigoBarra: '7504444333003', codigoFabrica: 'COSTE-AR-1K', codigoProducto: 'ARRO-PRE-03', proveedorCodigo: 'PROV-003' },
        { codigo: 'ALIM-004', descripcion: 'Atún en Lata', unidadMedida: 'UNID', precio: 5.00, codSubcategoria: 'ALIM-03', estado: 1, stock: 0, codigoBarra: '7504444333004', codigoFabrica: 'FLORIDA-AT', codigoProducto: 'ATUN-LAT-04', proveedorCodigo: 'PROV-003' },
        { codigo: 'ALIM-005', descripcion: 'Pasta Spaghetti 500g', unidadMedida: 'UNID', precio: 2.80, codSubcategoria: 'ALIM-02', estado: 1, stock: 0, codigoBarra: '7504444333005', codigoFabrica: 'LAVORO-PS-500', codigoProducto: 'PAST-SPA-05', proveedorCodigo: 'PROV-003' },
        { codigo: 'ALIM-006', descripcion: 'Galletas Oreo', unidadMedida: 'PQTE', precio: 3.20, codSubcategoria: 'ALIM-04', estado: 1, stock: 0, codigoBarra: '7504444333006', codigoFabrica: 'NABISCO-OREO', codigoProducto: 'GALL-ORE-06', proveedorCodigo: 'PROV-003' },
        // Limpieza - Proveedor PROV-006
        { codigo: 'LIMP-001', descripcion: 'Detergente Líquido 1L', unidadMedida: 'UNID', precio: 8.50, codSubcategoria: 'LIMP-01', estado: 1, stock: 0, codigoBarra: '7505555444001', codigoFabrica: 'ACE-DL-1L', codigoProducto: 'DETE-LIQ-01', proveedorCodigo: 'PROV-006' },
        { codigo: 'LIMP-002', descripcion: 'Desinfectante 500ml', unidadMedida: 'UNID', precio: 6.00, codSubcategoria: 'LIMP-01', estado: 1, stock: 0, codigoBarra: '7505555444002', codigoFabrica: 'LYSOL-D-500', codigoProducto: 'DESI-500-02', proveedorCodigo: 'PROV-006' },
        { codigo: 'LIMP-003', descripcion: 'Esponja Multiusos', unidadMedida: 'PQTE', precio: 4.50, codSubcategoria: 'LIMP-02', estado: 1, stock: 0, codigoBarra: '7505555444003', codigoFabrica: 'SCOT-EM-01', codigoProducto: 'ESPO-MUL-03', proveedorCodigo: 'PROV-006' },
        // Oficina - Proveedor PROV-005
        { codigo: 'OFIC-001', descripcion: 'Papel Bond A4 500 hojas', unidadMedida: 'RESMA', precio: 15.00, codSubcategoria: 'OFIC-01', estado: 1, stock: 0, codigoBarra: '7506666555001', codigoFabrica: 'XEROX-PB-A4', codigoProducto: 'PAPE-A4-01', proveedorCodigo: 'PROV-005' },
        { codigo: 'OFIC-002', descripcion: 'Bolígrafos Azules x12', unidadMedida: 'CAJA', precio: 8.00, codSubcategoria: 'OFIC-01', estado: 1, stock: 0, codigoBarra: '7506666555002', codigoFabrica: 'BIC-BA-12', codigoProducto: 'BOLI-AZU-02', proveedorCodigo: 'PROV-005' },
        // Plásticos - Sin proveedor asignado
        { codigo: 'PLAST-001', descripcion: 'Bolsa 1', unidadMedida: 'UNID', precio: 1.00, codSubcategoria: 'PLAS-01', estado: 1, stock: 0, codigoBarra: '7507777666001', codigoFabrica: 'PLAS-B-001', codigoProducto: 'BOLS-001' },
        { codigo: 'PLAST-002', descripcion: 'Vaso 2', unidadMedida: 'UNID', precio: 0.50, codSubcategoria: 'PLAS-01', estado: 1, stock: 0, codigoBarra: '7507777666002', codigoFabrica: 'PLAS-V-002', codigoProducto: 'VASO-002' },
        { codigo: 'PLAST-003', descripcion: 'Plato 3', unidadMedida: 'UNID', precio: 0.80, codSubcategoria: 'PLAS-01', estado: 1, stock: 0, codigoBarra: '7507777666003', codigoFabrica: 'PLAS-P-003', codigoProducto: 'PLAT-003' },
        { codigo: 'PLAST-004', descripcion: 'Cuchara 4', unidadMedida: 'UNID', precio: 0.30, codSubcategoria: 'PLAS-01', estado: 1, stock: 0, codigoBarra: '7507777666004', codigoFabrica: 'PLAS-C-004', codigoProducto: 'CUCH-004' },
        { codigo: 'PLAST-005', descripcion: 'Cuchillo 5', unidadMedida: 'UNID', precio: 0.35, codSubcategoria: 'PLAS-01', estado: 1, stock: 0, codigoBarra: '7507777666005', codigoFabrica: 'PLAS-CU-005', codigoProducto: 'CUCH-005' },
        { codigo: 'PLAST-006', descripcion: 'Tenedor 6', unidadMedida: 'UNID', precio: 0.32, codSubcategoria: 'PLAS-01', estado: 1, stock: 0, codigoBarra: '7507777666006', codigoFabrica: 'PLAS-T-006', codigoProducto: 'TENE-006' },
        { codigo: 'PLAST-007', descripcion: 'Tapa 7', unidadMedida: 'UNID', precio: 0.25, codSubcategoria: 'PLAS-01', estado: 1, stock: 0, codigoBarra: '7507777666007', codigoFabrica: 'PLAS-TA-007', codigoProducto: 'TAPA-007' },
        { codigo: 'PLAST-008', descripcion: 'Contenedor 8', unidadMedida: 'UNID', precio: 2.00, codSubcategoria: 'PLAS-01', estado: 1, stock: 0, codigoBarra: '7507777666008', codigoFabrica: 'PLAS-CO-008', codigoProducto: 'CONT-008' },
        { codigo: 'PLAST-009', descripcion: 'Botella 9', unidadMedida: 'UNID', precio: 1.50, codSubcategoria: 'PLAS-01', estado: 1, stock: 0, codigoBarra: '7507777666009', codigoFabrica: 'PLAS-BO-009', codigoProducto: 'BOTE-009' },
        { codigo: 'PLAST-010', descripcion: 'Embalaje 10', unidadMedida: 'UNID', precio: 3.00, codSubcategoria: 'PLAS-01', estado: 1, stock: 0, codigoBarra: '7507777666010', codigoFabrica: 'PLAS-EM-010', codigoProducto: 'EMBA-010' },
    ];

    for (const data of itemsData) {
        let item = await itemRepo.findOneBy({ codigo: data.codigo });
        if (!item) {
            const { proveedorCodigo, ...itemData } = data;
            item = await itemRepo.save(itemRepo.create(itemData));
            console.log(`  ✓ Creado: ${data.descripcion}`);
        } else {
            // Actualizar campos nuevos si el item ya existe
            item.codigoBarra = data.codigoBarra;
            item.codigoFabrica = data.codigoFabrica;
            item.codigoProducto = data.codigoProducto;
            await itemRepo.save(item);
            console.log(`  → Actualizado: ${data.descripcion}`);
        }

        // Asignar proveedor al item
        if (data.proveedorCodigo && proveedores[data.proveedorCodigo]) {
            const proveedor = proveedores[data.proveedorCodigo];
            // Verificar si ya tiene el proveedor asignado
            const itemWithProveedores = await itemRepo.findOne({
                where: { id: item.id },
                relations: ['proveedores'],
            });
            if (itemWithProveedores && (!itemWithProveedores.proveedores || !itemWithProveedores.proveedores.find(p => p.id === proveedor.id))) {
                itemWithProveedores.proveedores = [...(itemWithProveedores.proveedores || []), proveedor];
                await itemRepo.save(itemWithProveedores);
            }
        }
    }

    // =======================
    // 4. DOCUMENTOS DE ORIGEN (SAP/ERP)
    // =======================
    console.log('\n📄 [4/10] Creando documentos de origen (SAP/ERP)...');
    const docsData = [
        // Documentos API_ERP (simulando SAP/Oracle)
        {
            nroDocumento: 'SAP-2024-001',
            descripcion: 'Farmacéuticos - Paracetamol, Ibuprofeno, Omeprazol',
            tipoFuente: 'API_ERP',
            proveedor: 'Distribuidora Farmacéutica S.A.',
            fechaDocumento: new Date('2024-01-15'),
            estado: 'pendiente',
            datosRaw: { pedido: 'PO-2024-001', sistema: 'SAP' },
            items: [
                { codItem: 'FARM-001', descripcion: 'Paracetamol 500mg', cantidad: 100, lote: 'L2025-F001', fechaVencimiento: new Date('2026-06-30'), codigoBarra: '7502222111001', sku: 'FARM-001', codigoFabrica: 'BAYER-PC-500', codigoSistema: 'SAP-FARM-001', unidadMedida: 'CAJA' },
                { codItem: 'FARM-002', descripcion: 'Ibuprofeno 400mg', cantidad: 150, lote: 'L2025-F002', fechaVencimiento: new Date('2026-08-15'), codigoBarra: '7502222111002', sku: 'FARM-002', codigoFabrica: 'BAYER-IB-400', codigoSistema: 'SAP-FARM-002', unidadMedida: 'CAJA' },
                { codItem: 'FARM-003', descripcion: 'Omeprazol 20mg', cantidad: 200, lote: 'L2025-F003', fechaVencimiento: new Date('2026-12-31'), codigoBarra: '7502222111003', sku: 'FARM-003', codigoFabrica: 'PFIZ-OM-020', codigoSistema: 'SAP-FARM-003', unidadMedida: 'CAJA' },
            ],
        },
        {
            nroDocumento: 'SAP-2024-002',
            descripcion: 'Electrónicos - Cables USB, Cargadores',
            tipoFuente: 'API_ERP',
            proveedor: 'Electrónicos Global',
            fechaDocumento: new Date('2024-01-20'),
            estado: 'pendiente',
            datosRaw: { pedido: 'PO-2024-002', sistema: 'SAP' },
            items: [
                { codItem: 'ELEC-001', descripcion: 'Cable USB-C 1m', cantidad: 500, lote: 'L2025-E001', codigoBarra: '7503333222001', sku: 'ELEC-001', codigoFabrica: 'ANKE-USB-C1', codigoSistema: 'SAP-ELEC-001', unidadMedida: 'UNID' },
                { codItem: 'ELEC-002', descripcion: 'Cargador 20W', cantidad: 300, lote: 'L2025-E002', codigoBarra: '7503333222002', sku: 'ELEC-002', codigoFabrica: 'ANKE-CRG-20W', codigoSistema: 'SAP-ELEC-002', unidadMedida: 'UNID' },
            ],
        },
        {
            nroDocumento: 'SAP-2024-003',
            descripcion: 'Alimentos - Leche, Aceite, Arroz, Atún',
            tipoFuente: 'API_ERP',
            proveedor: 'Alimentos del Sur',
            fechaDocumento: new Date('2024-03-10'),
            estado: 'pendiente',
            datosRaw: { pedido: 'PO-2024-003', sistema: 'SAP' },
            items: [
                { codItem: 'ALIM-001', descripcion: 'Leche Entera 1L', cantidad: 1000, lote: 'A2025-001', fechaVencimiento: new Date('2025-06-01'), codigoBarra: '7504444333001', sku: 'ALIM-001', codigoFabrica: 'GLORIA-LE-1L', codigoSistema: 'SAP-ALIM-001', unidadMedida: 'UNID' },
                { codItem: 'ALIM-002', descripcion: 'Aceite Vegetal 1L', cantidad: 500, lote: 'A2025-002', fechaVencimiento: new Date('2025-12-15'), codigoBarra: '7504444333002', sku: 'ALIM-002', codigoFabrica: 'PRIMOR-AV-1L', codigoSistema: 'SAP-ALIM-002', unidadMedida: 'UNID' },
                { codItem: 'ALIM-003', descripcion: 'Arroz Premium 1kg', cantidad: 800, lote: 'A2025-003', fechaVencimiento: new Date('2026-01-20'), codigoBarra: '7504444333003', sku: 'ALIM-003', codigoFabrica: 'COSTE-AR-1K', codigoSistema: 'SAP-ALIM-003', unidadMedida: 'KG' },
                { codItem: 'ALIM-004', descripcion: 'Atún en Lata', cantidad: 600, lote: 'A2025-004', fechaVencimiento: new Date('2027-03-30'), codigoBarra: '7504444333004', sku: 'ALIM-004', codigoFabrica: 'FLORIDA-AT', codigoSistema: 'SAP-ALIM-004', unidadMedida: 'UNID' },
            ],
        },
        {
            nroDocumento: 'SAP-2024-004',
            descripcion: 'Herramientas - Taladros, Martillos',
            tipoFuente: 'API_ERP',
            proveedor: 'Ferretería Industrial',
            fechaDocumento: new Date('2024-04-05'),
            estado: 'pendiente',
            datosRaw: { pedido: 'PO-2024-004', sistema: 'SAP' },
            items: [
                { codItem: 'PROD-001', descripcion: 'Taladro Percutor Bosch', cantidad: 50, lote: 'LOTE-P001', codigoBarra: '7501234567001', sku: 'PROD-001', codigoFabrica: 'BOSCH-TPB-001', codigoSistema: 'SAP-PROD-001', unidadMedida: 'UNID' },
                { codItem: 'PROD-002', descripcion: 'Martillo de Goma', cantidad: 100, lote: 'LOTE-P002', codigoBarra: '7501234567002', sku: 'PROD-002', codigoFabrica: 'STAN-MG-002', codigoSistema: 'SAP-PROD-002', unidadMedida: 'PZA' },
            ],
        },
        // Documentos MANUAL (ingresados manualmente)
        {
            nroDocumento: 'INT-2024-001',
            descripcion: 'Suministros de Oficina - Compra Local',
            tipoFuente: 'MANUAL',
            proveedor: 'Office Depot',
            fechaDocumento: new Date('2024-02-01'),
            estado: 'pendiente',
            datosRaw: { origen: 'compra_local', factura: 'F001-00123' },
            items: [
                { codItem: 'OFIC-001', descripcion: 'Papel Bond A4 500 hojas', cantidad: 100, lote: 'OFC-2024-01', codigoBarra: '7506666555001', sku: 'OFIC-001', codigoFabrica: 'XEROX-PB-A4', codigoSistema: 'INT-OFIC-001', unidadMedida: 'RESMA' },
                { codItem: 'OFIC-002', descripcion: 'Bolígrafos Azules x12', cantidad: 50, lote: 'OFC-2024-02', codigoBarra: '7506666555002', sku: 'OFIC-002', codigoFabrica: 'BIC-BA-12', codigoSistema: 'INT-OFIC-002', unidadMedida: 'CAJA' },
            ],
        },
        {
            nroDocumento: 'INT-2024-002',
            descripcion: 'Productos de Limpieza - Proveedor Local',
            tipoFuente: 'MANUAL',
            proveedor: 'Limpieza Total',
            fechaDocumento: new Date('2024-05-01'),
            estado: 'pendiente',
            datosRaw: { origen: 'compra_local', factura: 'F002-00456' },
            items: [
                { codItem: 'LIMP-001', descripcion: 'Detergente Líquido 1L', cantidad: 200, lote: 'LIM-2024-01', codigoBarra: '7505555444001', sku: 'LIMP-001', codigoFabrica: 'ACE-DL-1L', codigoSistema: 'INT-LIMP-001', unidadMedida: 'UNID' },
                { codItem: 'LIMP-002', descripcion: 'Desinfectante 500ml', cantidad: 150, lote: 'LIM-2024-02', codigoBarra: '7505555444002', sku: 'LIMP-002', codigoFabrica: 'LYSOL-D-500', codigoSistema: 'INT-LIMP-002', unidadMedida: 'UNID' },
                { codItem: 'LIMP-003', descripcion: 'Esponja Multiusos', cantidad: 300, lote: 'LIM-2024-03', codigoBarra: '7505555444003', sku: 'LIMP-003', codigoFabrica: 'SCOT-EM-01', codigoSistema: 'INT-LIMP-003', unidadMedida: 'PQTE' },
            ],
        },
        {
            nroDocumento: 'INT-2024-003',
            descripcion: 'Electrónicos Premium - Importación Directa',
            tipoFuente: 'MANUAL',
            proveedor: 'Electrónicos Global',
            fechaDocumento: new Date('2024-06-15'),
            estado: 'pendiente',
            datosRaw: { origen: 'importacion', factura: 'IMP-2024-789' },
            items: [
                { codItem: 'ELEC-003', descripcion: 'Audífonos Bluetooth', cantidad: 80, lote: 'ELE-2024-03', codigoBarra: '7503333222003', sku: 'ELEC-003', codigoFabrica: 'SONY-ABT-01', codigoSistema: 'INT-ELEC-003', unidadMedida: 'UNID' },
                { codItem: 'ELEC-004', descripcion: 'Mouse Inalámbrico', cantidad: 120, lote: 'ELE-2024-04', codigoBarra: '7503333222004', sku: 'ELEC-004', codigoFabrica: 'LOGI-MW-01', codigoSistema: 'INT-ELEC-004', unidadMedida: 'UNID' },
                { codItem: 'ELEC-005', descripcion: 'Teclado Mecánico', cantidad: 60, lote: 'ELE-2024-05', codigoBarra: '7503333222005', sku: 'ELEC-005', codigoFabrica: 'LOGI-TM-01', codigoSistema: 'INT-ELEC-005', unidadMedida: 'UNID' },
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
                    codigoBarra: itemData.codigoBarra,
                    sku: itemData.sku,
                    codigoFabrica: itemData.codigoFabrica,
                    codigoSistema: itemData.codigoSistema,
                    unidadMedida: itemData.unidadMedida,
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
                { codItem: 'FARM-004', cantidad: 50, cantidadEsperada: 50, lote: 'LOTE-M001', fechaVencimiento: new Date('2026-06-30') },
                { codItem: 'ELEC-003', cantidad: 100, cantidadEsperada: 100, lote: 'LOTE-M002' },
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
                { codItem: 'ALIM-005', cantidad: 200, cantidadEsperada: 200, lote: 'LOTE-A100', fechaVencimiento: new Date('2025-08-15') },
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
                { codItem: 'PROD-001', cantidad: 30, cantidadEsperada: 30, lote: 'LOTE-P001' },
                { codItem: 'PROD-002', cantidad: 25, cantidadEsperada: 25, lote: 'LOTE-P002' },
            ],
        },
        // ===== NUEVOS INGRESOS DE PRUEBA PARA SCANNER MOVIL =====
        {
            nroDocumento: 'TEST-001',
            origen: 'Test Scanner',
            estado: 0, // PALETIZADO - Listo para validar
            observacion: 'Ingreso de prueba - 1 producto, 5 unidades',
            usuarioCreacion: 'SISTEMA',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'FARM-001', cantidad: 5, cantidadEsperada: 5, lote: 'TEST-L001', fechaVencimiento: new Date('2026-12-31') },
            ],
        },
        {
            nroDocumento: 'TEST-002',
            origen: 'Test Scanner',
            estado: 0, // PALETIZADO - Listo para validar
            observacion: 'Ingreso de prueba - 2 productos diferentes',
            usuarioCreacion: 'SISTEMA',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'ELEC-001', cantidad: 3, cantidadEsperada: 3, lote: 'TEST-E001' },
                { codItem: 'ELEC-002', cantidad: 2, cantidadEsperada: 2, lote: 'TEST-E002' },
            ],
        },
        {
            nroDocumento: 'TEST-003',
            origen: 'Test Scanner',
            estado: 0, // PALETIZADO - Listo para validar
            observacion: 'Ingreso de prueba - Alimentos',
            usuarioCreacion: 'SISTEMA',
            almacenCodigo: 'ALM-FRIO',
            detalles: [
                { codItem: 'ALIM-001', cantidad: 10, cantidadEsperada: 10, lote: 'TEST-A001', fechaVencimiento: new Date('2025-06-30') },
            ],
        },
        {
            nroDocumento: 'TEST-004',
            origen: 'Test Scanner',
            estado: 1, // VALIDADO - Listo para almacenar
            observacion: 'Ingreso de prueba - Ya validado, escanear ubicación',
            usuarioCreacion: 'SISTEMA',
            usuarioValidacion: 'OPERARIO_TEST',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'PROD-001', cantidad: 3, cantidadEsperada: 3, lote: 'TEST-P001' },
            ],
        },
        {
            nroDocumento: 'TEST-005',
            origen: 'Test Scanner',
            estado: 0, // PALETIZADO - Listo para validar
            observacion: 'Ingreso de prueba - Múltiples productos',
            usuarioCreacion: 'SISTEMA',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'LIMP-001', cantidad: 4, cantidadEsperada: 4, lote: 'TEST-LM01' },
                { codItem: 'LIMP-002', cantidad: 6, cantidadEsperada: 6, lote: 'TEST-LM02' },
                { codItem: 'OFIC-001', cantidad: 2, cantidadEsperada: 2, lote: 'TEST-OF01' },
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
        // ===== NOTA PARA TESTING DE INCREMENTO DE STOCK =====
        {
            nroDocumento: 'STOCK-TEST-001',
            origen: 'Test Stock',
            estado: 0, // PALETIZADO - Listo para validar y almacenar
            observacion: 'Ingreso de prueba - SOLO 1 producto con 10 unidades para test de stock',
            usuarioCreacion: 'SISTEMA',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'FARM-001', cantidad: 10, cantidadEsperada: 10, lote: 'STOCK-L001', fechaVencimiento: new Date('2027-12-31'), ubicacionFinal: 'Z-99-01-01' },
            ],
        },
        // ===== 5 NOTAS SIMPLES CON PRODUCTOS PLASTICOS =====
        {
            nroDocumento: 'PTEST-001',
            origen: 'Test Plasticos',
            estado: 0, // PALETIZADO
            observacion: 'Prueba plasticos - Bolsa y Vaso',
            usuarioCreacion: 'SISTEMA',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'PLAST-001', cantidad: 5, cantidadEsperada: 5, lote: 'PT-001' },
                { codItem: 'PLAST-002', cantidad: 3, cantidadEsperada: 3, lote: 'PT-002' },
            ],
        },
        {
            nroDocumento: 'PTEST-002',
            origen: 'Test Plasticos',
            estado: 0, // PALETIZADO
            observacion: 'Prueba plasticos - Plato solo',
            usuarioCreacion: 'SISTEMA',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'PLAST-003', cantidad: 2, cantidadEsperada: 2, lote: 'PT-003' },
            ],
        },
        {
            nroDocumento: 'PTEST-003',
            origen: 'Test Plasticos',
            estado: 0, // PALETIZADO
            observacion: 'Prueba plasticos - Cubiertos',
            usuarioCreacion: 'SISTEMA',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'PLAST-004', cantidad: 4, cantidadEsperada: 4, lote: 'PT-004' },
                { codItem: 'PLAST-005', cantidad: 3, cantidadEsperada: 3, lote: 'PT-005' },
                { codItem: 'PLAST-006', cantidad: 2, cantidadEsperada: 2, lote: 'PT-006' },
            ],
        },
        {
            nroDocumento: 'PTEST-004',
            origen: 'Test Plasticos',
            estado: 0, // PALETIZADO
            observacion: 'Prueba plasticos - Tapa y Contenedor',
            usuarioCreacion: 'SISTEMA',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'PLAST-007', cantidad: 6, cantidadEsperada: 6, lote: 'PT-007' },
                { codItem: 'PLAST-008', cantidad: 4, cantidadEsperada: 4, lote: 'PT-008' },
            ],
        },
        {
            nroDocumento: 'PTEST-005',
            origen: 'Test Plasticos',
            estado: 0, // PALETIZADO
            observacion: 'Prueba plasticos - Botella y Embalaje',
            usuarioCreacion: 'SISTEMA',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'PLAST-009', cantidad: 3, cantidadEsperada: 3, lote: 'PT-009' },
                { codItem: 'PLAST-010', cantidad: 2, cantidadEsperada: 2, lote: 'PT-010' },
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
            // Plásticos - Stock inicial
            { sku: 'PLAST-001', ubicacion: 'G-01-01-01', cantidad: 97, estado: 'DISPONIBLE' },
            { sku: 'PLAST-002', ubicacion: 'G-01-01-02', cantidad: 61, estado: 'DISPONIBLE' },
            { sku: 'PLAST-003', ubicacion: 'G-01-02-01', cantidad: 17, estado: 'DISPONIBLE' },
            { sku: 'PLAST-004', ubicacion: 'G-01-02-02', cantidad: 55, estado: 'DISPONIBLE' },
            { sku: 'PLAST-005', ubicacion: 'G-02-01-01', cantidad: 89, estado: 'DISPONIBLE' },
            { sku: 'PLAST-006', ubicacion: 'G-02-01-02', cantidad: 89, estado: 'DISPONIBLE' },
            { sku: 'PLAST-007', ubicacion: 'G-02-02-01', cantidad: 41, estado: 'DISPONIBLE' },
            { sku: 'PLAST-008', ubicacion: 'G-02-02-02', cantidad: 48, estado: 'DISPONIBLE' },
            { sku: 'PLAST-009', ubicacion: 'G-03-01-01', cantidad: 27, estado: 'DISPONIBLE' },
            { sku: 'PLAST-010', ubicacion: 'G-03-01-02', cantidad: 52, estado: 'DISPONIBLE' },
        ];

        const itemsMap = new Map<string, Item>();
        // Cargar items para buscar por código
        const allItems = await itemRepo.find();
        allItems.forEach(i => itemsMap.set(i.codigo, i));

        for (const data of stockData) {
            const item = itemsMap.get(data.sku);
            if (item) {
                await stockRepo.save(stockRepo.create({
                    item: item,
                    ubicacion: data.ubicacion,
                    cantidad: data.cantidad,
                    estado: data.estado
                }));
            } else {
                console.log(`  ⚠ Item ${data.sku} no encontrado para stock seed`);
            }
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
    // 9. ÓRDENES DE SALIDA (Simular ERP externo)
    // =======================
    console.log('\n📦 [9/11] Creando órdenes de salida (simulando ERP)...');

    const ordenSalidaRepo = dataSource.getRepository('OrdenSalida');
    const detalleSalidaRepo = dataSource.getRepository('DetalleSalida');

    const ordenesSalidaData = [
        {
            nroDocumento: 'OS-2024-001',
            cliente: 'Farmacia San José',
            destino: 'Av. Principal 123, Lima',
            prioridad: 1,
            estado: 0, // PENDIENTE
            tipoFuente: 'API_ERP',
            observacion: 'Entrega urgente - Farmacéuticos',
            usuarioCreacion: 'API_ERP',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'FARM-001', cantidad: 20 },
                { codItem: 'FARM-002', cantidad: 15 },
            ],
        },
        {
            nroDocumento: 'OS-2024-002',
            cliente: 'TechStore Peru',
            destino: 'Jr. Comercio 456, Miraflores',
            prioridad: 2,
            estado: 0, // PENDIENTE
            tipoFuente: 'API_ERP',
            observacion: 'Electrónicos - Cliente VIP',
            usuarioCreacion: 'API_ERP',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'ELEC-001', cantidad: 50 },
                { codItem: 'ELEC-002', cantidad: 30 },
            ],
        },
        {
            nroDocumento: 'OS-2024-003',
            cliente: 'Restaurante El Buen Sabor',
            destino: 'Calle Gourmet 789, San Isidro',
            prioridad: 2,
            estado: 0, // PENDIENTE
            tipoFuente: 'API_ERP',
            observacion: 'Alimentos frescos',
            usuarioCreacion: 'API_ERP',
            almacenCodigo: 'ALM-FRIO',
            detalles: [
                { codItem: 'ALIM-001', cantidad: 100 },
                { codItem: 'ALIM-002', cantidad: 50 },
                { codItem: 'ALIM-004', cantidad: 80 },
            ],
        },
        {
            nroDocumento: 'OS-2024-004',
            cliente: 'Constructora ABC',
            destino: 'Obra Av. Industria 321',
            prioridad: 3,
            estado: 0, // PENDIENTE
            tipoFuente: 'MANUAL',
            observacion: 'Herramientas para obra',
            usuarioCreacion: 'admin',
            almacenCodigo: 'ALM-CENT',
            detalles: [
                { codItem: 'PROD-001', cantidad: 10 },
                { codItem: 'PROD-002', cantidad: 5 },
            ],
        },
    ];

    for (const ordenData of ordenesSalidaData) {
        const existe = await ordenSalidaRepo.findOneBy({ nroDocumento: ordenData.nroDocumento });
        if (!existe) {
            const almacen = almacenes[ordenData.almacenCodigo];

            // Crear orden
            const orden = await ordenSalidaRepo.save({
                nroDocumento: ordenData.nroDocumento,
                cliente: ordenData.cliente,
                destino: ordenData.destino,
                prioridad: ordenData.prioridad,
                estado: ordenData.estado,
                tipoFuente: ordenData.tipoFuente,
                observacion: ordenData.observacion,
                usuarioCreacion: ordenData.usuarioCreacion,
                almacen: almacen,
            });

            // Crear detalles
            for (const det of ordenData.detalles) {
                const item = await itemRepo.findOneBy({ codigo: det.codItem });
                // Buscar stock disponible
                const stock = await stockRepo.findOne({
                    where: { item: { codigo: det.codItem }, estado: 'DISPONIBLE' },
                    relations: ['item'],
                });

                await detalleSalidaRepo.save({
                    codItem: det.codItem,
                    cantidadSolicitada: det.cantidad,
                    cantidadPickeada: 0,
                    ubicacionOrigen: stock?.ubicacion || '',
                    estado: 0,
                    ordenSalida: orden,
                    item: item,
                    stockInventario: stock,
                });
            }
            console.log(`  ✓ Creada: ${ordenData.nroDocumento} - ${ordenData.cliente} (${ordenData.detalles.length} items)`);
        } else {
            console.log(`  → Ya existe: ${ordenData.nroDocumento}`);
        }
    }

    // =======================
    // 10. RESUMEN FINAL
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

    // =======================
    // 10. GENERACIÓN DE IMÁGENES DE CÓDIGOS DE BARRA
    // =======================
    console.log('\n🖨️ [10/10] Generando imágenes de códigos de barra (Code-128)...');

    const uploadsDir = path.join(process.cwd(), 'uploads', 'barcodes');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`  ✓ Directorio creado: ${uploadsDir}`);
    }

    const allItemsForBarcodes = await itemRepo.find();
    let generatedCount = 0;

    for (const item of allItemsForBarcodes) {
        if (item.codigoBarra) {
            const fileName = path.join(uploadsDir, `${item.codigoBarra}.png`);

            try {
                await new Promise<void>((resolve, reject) => {
                    bwipjs.toBuffer({
                        bcid: 'code128',       // Barcode type
                        text: item.codigoBarra,    // Text to encode
                        scale: 3,              // 3x scaling factor
                        height: 10,            // Bar height, in millimeters
                        includetext: true,     // Show human-readable text
                        textxalign: 'center',  // Always good to set this
                    }, (err, png) => {
                        if (err) {
                            reject(err);
                        } else {
                            fs.writeFile(fileName, png, (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        }
                    });
                });
                // console.log(`    Generado: ${item.codigoBarra}.png`);
                generatedCount++;
            } catch (e) {
                console.error(`    ❌ Error generando ${item.codigoBarra}:`, e);
            }
        }
    }
    console.log(`  ✓ Generadas ${generatedCount} imágenes en ${uploadsDir}`);

    await app.close();
    process.exit(0);
}

seed().catch((error) => {
    console.error('❌ Error en seeders:', error);
    process.exit(1);
});
