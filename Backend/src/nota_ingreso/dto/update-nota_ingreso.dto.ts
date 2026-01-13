import { PartialType } from '@nestjs/mapped-types';
import { CreateNotaIngresoDto } from './create-nota_ingreso.dto';

export class UpdateNotaIngresoDto extends PartialType(CreateNotaIngresoDto) {}
