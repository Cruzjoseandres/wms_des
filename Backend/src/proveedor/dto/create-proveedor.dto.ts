import { IsString, IsOptional, IsEmail, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateProveedorDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    codigo: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    ruc?: string;

    @IsString()
    @IsOptional()
    @MaxLength(200)
    direccion?: string;

    @IsString()
    @IsOptional()
    @MaxLength(30)
    telefono?: string;

    @IsEmail()
    @IsOptional()
    @MaxLength(100)
    email?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    contacto?: string;
}
