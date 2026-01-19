import { Module } from '@nestjs/common';
import { IngresoApiController } from './ingreso_api.controller';
import { IngresoApiService } from './ingreso_api.service';
import { MovilController } from './movil/movil.controller';
import { MovilService } from './movil/movil.service';
import { DocumentoOrigenModule } from '../documento_origen/documento_origen.module';
import { NotaIngresoModule } from '../nota_ingreso/nota_ingreso.module';
import { StockInventarioModule } from '../stock_inventario/stock_inventario.module';
import { DetalleIngresoModule } from '../detalle_ingreso/detalle_ingreso.module';
import { HistorialEstadoModule } from '../historial_estado/historial_estado.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotaIngreso } from '../nota_ingreso/entities/nota_ingreso.entity';
import { DetalleIngreso } from '../detalle_ingreso/entities/detalle_ingreso.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([NotaIngreso, DetalleIngreso]),
        DocumentoOrigenModule,
        NotaIngresoModule,
        StockInventarioModule,
        DetalleIngresoModule,
        HistorialEstadoModule,
    ],
    controllers: [IngresoApiController, MovilController],
    providers: [IngresoApiService, MovilService],
})
export class IngresoApiModule { }
