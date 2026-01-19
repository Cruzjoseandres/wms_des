import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockInventario } from './entities/stock_inventario.entity';
import { StockInventarioService } from './stock_inventario.service';
import { StockInventarioController } from './stock_inventario.controller';

@Module({
    imports: [TypeOrmModule.forFeature([StockInventario])],
    controllers: [StockInventarioController],
    providers: [StockInventarioService],
    exports: [StockInventarioService],
})
export class StockInventarioModule { }
