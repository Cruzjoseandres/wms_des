import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickingController } from './picking.controller';
import { PickingService } from './picking.service';
import { OrdenSalida } from '../orden_salida/entities/orden_salida.entity';
import { DetalleSalida } from '../detalle_salida/entities/detalle_salida.entity';
import { StockInventario } from '../stock_inventario/entities/stock_inventario.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([OrdenSalida, DetalleSalida, StockInventario]),
    ],
    controllers: [PickingController],
    providers: [PickingService],
    exports: [PickingService],
})
export class PickingModule { }
