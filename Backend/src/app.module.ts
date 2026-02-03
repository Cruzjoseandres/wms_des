import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ItemModule } from './item/item.module';
import { AlmacenModule } from './almacen/almacen.module';
import { NotaIngresoModule } from './nota_ingreso/nota_ingreso.module';
import { DetalleIngresoModule } from './detalle_ingreso/detalle_ingreso.module';
import { InventarioModule } from './inventario/inventario.module';
import { DocumentoOrigenModule } from './documento_origen/documento_origen.module';
import { ItemDocumentoOrigenModule } from './item_documento_origen/item_documento_origen.module';
import { StockInventarioModule } from './stock_inventario/stock_inventario.module';
import { HistorialEstadoModule } from './historial_estado/historial_estado.module';
import { IngresoApiModule } from './ingreso_api/ingreso_api.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { OrdenSalidaModule } from './orden_salida/orden_salida.module';
import { DetalleSalidaModule } from './detalle_salida/detalle_salida.module';
import { PickingModule } from './picking/picking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    ItemModule,
    AlmacenModule,
    NotaIngresoModule,
    DetalleIngresoModule,
    InventarioModule,
    DocumentoOrigenModule,
    ItemDocumentoOrigenModule,
    StockInventarioModule,
    HistorialEstadoModule,
    IngresoApiModule,
    ProveedorModule,
    OrdenSalidaModule,
    DetalleSalidaModule,
    PickingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
