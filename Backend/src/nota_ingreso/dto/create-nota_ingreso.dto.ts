import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateDetalleIngresoDto } from '../../detalle_ingreso/dto/create-detalle_ingreso.dto';

export class CreateNotaIngresoDto {
  @IsString()
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  nroDocumento: string;

  @IsString()
  @IsNotEmpty({ message: 'El origen/proveedor es obligatorio' })
  origen: string;

  @IsNumber({}, { message: 'El ID de almacén debe ser un número' })
  @Type(() => Number)
  almacenId: number;

  @IsString()
  @IsOptional()
  usuario?: string; // Usuario que crea la orden

  @IsNumber()
  @IsOptional()
  sourceDocId?: number; // ID del documento de origen si aplica

  // Rango de recepción programado
  @IsOptional()
  @IsString()
  fechaInicio?: string;

  @IsOptional()
  @IsString()
  fechaFin?: string;

  @IsArray({ message: 'Debe enviar una lista de detalles' })
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleIngresoDto)
  detalles: CreateDetalleIngresoDto[];
}

