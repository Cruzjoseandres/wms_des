import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { NotaIngreso } from '../../nota_ingreso/entities/nota_ingreso.entity';

@Entity('almacen')
export class Almacen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'codigo', length: 10, nullable: true })
  codigo: string;

  @Column({ name: 'descripcion', length: 80 })
  descripcion: string;

  @Column({ name: 'id_sucursal', type: 'int', nullable: true })
  sucursalId: number;

  @Column({ type: 'smallint', default: 1 })
  estado: number;

  // Relación con NotasIngreso
  @OneToMany(() => NotaIngreso, (nota: NotaIngreso) => nota.almacen)
  notasIngreso: NotaIngreso[];
}