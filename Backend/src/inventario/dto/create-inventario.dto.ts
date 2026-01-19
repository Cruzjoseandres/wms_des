export class CreateInventarioDto {
    codigo: string;
    tipo: string;
    fechaApertura: string;
    almacenId: number;
    bodega?: string;
    responsable: string;
    itemsTotales: number;
}
