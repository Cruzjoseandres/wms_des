import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoOrigen } from './entities/documento_origen.entity';
import { DocumentoOrigenService } from './documento_origen.service';
import { DocumentoOrigenController } from './documento_origen.controller';

@Module({
    imports: [TypeOrmModule.forFeature([DocumentoOrigen])],
    controllers: [DocumentoOrigenController],
    providers: [DocumentoOrigenService],
    exports: [DocumentoOrigenService],
})
export class DocumentoOrigenModule { }
