import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

/**
 * DTO para los códigos de producto múltiples
 */
export class ProductCodesDto {
  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  factoryCode?: string;

  @IsString()
  @IsOptional()
  systemCode?: string;
}

export class CreateDetalleIngresoDto {
  @IsString()
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  productoId: string;

  @IsNumber()
  @Min(0.01, { message: 'La cantidad debe ser mayor a 0' })
  cantidad: number;

  @IsNumber()
  @IsOptional()
  cantidadEsperada?: number;

  @IsString()
  @IsOptional()
  lote?: string;

  @IsDateString({}, { message: 'La fecha de vencimiento debe ser válida (YYYY-MM-DD)' })
  @IsOptional()
  fechaVencimiento?: string;

  @IsString()
  @IsOptional()
  serie?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductCodesDto)
  productCodes?: ProductCodesDto;

  @IsString()
  @IsOptional()
  ubicacionSugerida?: string;
}

