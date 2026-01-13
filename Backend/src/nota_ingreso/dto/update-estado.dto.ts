import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class UpdateEstadoDto {
    @IsNumber({}, { message: 'El estado debe ser un número' })
    @Min(0, { message: 'El estado mínimo es 0 (paletizado)' })
    @Max(3, { message: 'El estado máximo es 3 (anulado)' })
    estado: number; // 0: paletizado, 1: validado, 2: almacenado, 3: anulado

    @IsOptional()
    @IsString({ message: 'El usuario debe ser un texto' })
    usuario?: string;
}
