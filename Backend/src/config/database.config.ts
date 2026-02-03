import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Almacen } from '../almacen/entities/almacen.entity';
import { DetalleIngreso } from '../detalle_ingreso/entities/detalle_ingreso.entity';
import { Item } from '../item/entities/item.entity';
import { NotaIngreso } from '../nota_ingreso/entities/nota_ingreso.entity';
import { Inventario } from '../inventario/entities/inventario.entity';
import { DocumentoOrigen } from '../documento_origen/entities/documento_origen.entity';
import { ItemDocumentoOrigen } from '../item_documento_origen/entities/item_documento_origen.entity';
import { StockInventario } from '../stock_inventario/entities/stock_inventario.entity';
import { HistorialEstado } from '../historial_estado/entities/historial_estado.entity';
import { Proveedor } from '../proveedor/entities/proveedor.entity';
import { OrdenSalida } from '../orden_salida/entities/orden_salida.entity';
import { DetalleSalida } from '../detalle_salida/entities/detalle_salida.entity';
import 'dotenv/config';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    Almacen,
    NotaIngreso,
    DetalleIngreso,
    Item,
    Inventario,
    DocumentoOrigen,
    ItemDocumentoOrigen,
    StockInventario,
    HistorialEstado,
    Proveedor,
    OrdenSalida,
    DetalleSalida,
  ],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false,
  } : false,
  logging: process.env.DB_LOGGING === 'true',
} as TypeOrmModuleOptions;

