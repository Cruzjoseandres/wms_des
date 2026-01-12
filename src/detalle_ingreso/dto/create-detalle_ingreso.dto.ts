import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateDetalleIngresoDto {
    @IsString()
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  productoId: string; // El frontend envía "productoId", nosotros lo guardamos como "codItem"

  @IsNumber()
  @Min(0.01, { message: 'La cantidad debe ser mayor a 0' })
  cantidad: number;

  @IsString()
  @IsOptional()
  lote?: string;

  @IsDateString({}, { message: 'La fecha de vencimiento debe ser válida (YYYY-MM-DD)' })
  @IsOptional()
  fechaVencimiento?: string;
  
  @IsString()
  @IsOptional()
  serie?: string;
}
