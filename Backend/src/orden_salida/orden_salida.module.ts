import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenSalida } from './entities/orden_salida.entity';
import { OrdenSalidaController } from './orden_salida.controller';
import { OrdenSalidaService } from './orden_salida.service';
import { DetalleSalida } from '../detalle_salida/entities/detalle_salida.entity';
import { StockInventario } from '../stock_inventario/entities/stock_inventario.entity';
import { Item } from '../item/entities/item.entity';
import { Almacen } from '../almacen/entities/almacen.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([OrdenSalida, DetalleSalida, StockInventario, Item, Almacen]),
    ],
    controllers: [OrdenSalidaController],
    providers: [OrdenSalidaService],
    exports: [OrdenSalidaService],
})
export class OrdenSalidaModule { }

