import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateDetalleIngresoDto } from 'src/detalle_ingreso/dto/create-detalle_ingreso.dto';

export class CreateNotaIngresoDto {
  @IsString()
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  nroDocumento: string;

  @IsString()
  @IsNotEmpty({ message: 'El origen/proveedor es obligatorio' })
  origen: string;

  @IsNumber({}, { message: 'El ID de almacén debe ser un número' })
  @Type(() => Number) // Convierte "1" (string) a 1 (number) si viene del form
  almacenId: number;

  @IsArray({ message: 'Debe enviar una lista de detalles' })
  @ValidateNested({ each: true }) // Valida cada objeto dentro del array
  @Type(() => CreateDetalleIngresoDto) // Convierte el JSON a instancias de la clase CreateDetalleIngresoDto
  detalles: CreateDetalleIngresoDto[];
}
