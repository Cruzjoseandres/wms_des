import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemDocumentoOrigen } from './entities/item_documento_origen.entity';
import { ItemDocumentoOrigenService } from './item_documento_origen.service';

@Module({
    imports: [TypeOrmModule.forFeature([ItemDocumentoOrigen])],
    providers: [ItemDocumentoOrigenService],
    exports: [ItemDocumentoOrigenService],
})
export class ItemDocumentoOrigenModule { }
