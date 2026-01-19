import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateAlmacenDto {
    @IsString()
    @IsNotEmpty()
    codigo: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsNumber()
    @IsOptional()
    id_sucursal?: number;
}
