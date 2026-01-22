import { PartialType } from '@nestjs/mapped-types';
import { CreateProveedorDto } from './create-proveedor.dto';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateProveedorDto extends PartialType(CreateProveedorDto) {
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(1)
    estado?: number;
}
