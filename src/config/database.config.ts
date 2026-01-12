import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Almacen } from '../almacen/entities/almacen.entity';
import { DetalleIngreso } from '../detalle_ingreso/entities/detalle_ingreso.entity';
import { Item } from '../item/entities/item.entity';
import { NotaIngreso } from '../nota_ingreso/entities/nota_ingreso.entity';
import 'dotenv/config';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Almacen, NotaIngreso, DetalleIngreso, Item],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  // SSL solo si está habilitado en las variables de entorno
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false,
  } : false,
  logging: process.env.DB_LOGGING === 'true',
} as TypeOrmModuleOptions;
