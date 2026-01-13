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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
