import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Controller('proveedores')
export class ProveedorController {
    constructor(private readonly proveedorService: ProveedorService) { }

    @Post()
    create(@Body() createProveedorDto: CreateProveedorDto) {
        return this.proveedorService.create(createProveedorDto);
    }

    @Get()
    findAll(@Query('search') search?: string) {
        return this.proveedorService.findAll(search);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.proveedorService.findOne(id);
    }

    @Get('codigo/:codigo')
    findByCodigo(@Param('codigo') codigo: string) {
        return this.proveedorService.findByCodigo(codigo);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProveedorDto: UpdateProveedorDto,
    ) {
        return this.proveedorService.update(id, updateProveedorDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.proveedorService.remove(id);
    }

    @Patch(':id/toggle-estado')
    toggleEstado(@Param('id', ParseIntPipe) id: number) {
        return this.proveedorService.toggleEstado(id);
    }
}
