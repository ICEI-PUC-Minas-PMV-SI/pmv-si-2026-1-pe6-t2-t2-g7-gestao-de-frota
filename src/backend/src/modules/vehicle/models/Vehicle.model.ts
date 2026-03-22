import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { TReplace } from '../../commons/utils/replace';
import { randomUUID } from 'crypto';

export type VehicleModelProps = {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  createdAt: Date;
  updatedAt: Date;
};

export type VehicleModelPropsInput = TReplace<
  VehicleModelProps,
  {
    id?: string;
    marca: string;
    modelo: string;
    ano: number;
    placa: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
>;

export type VehicleModelUpdateInput = {
  id: string;
  marca?: string;
  modelo?: string;
  ano?: number;
  placa?: string;
};

export interface VehicleJsonProps extends VehicleModelProps {}

@Unique('UQ_vehicles_placa', ['placa'])
@Entity({ name: 'vehicles' })
export class VehicleModel {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_vehicles_id',
  })
  id: string;

  @Column({ name: 'marca', length: 255, type: 'varchar' })
  marca: string;

  @Column({ name: 'modelo', length: 255, type: 'varchar' })
  modelo: string;

  @Column({ name: 'ano', type: 'integer' })
  ano: number;

  @Column({ name: 'placa', length: 10, type: 'varchar' })
  placa: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(props: VehicleModelPropsInput) {
    if (!props) return;

    this.id = props.id ?? randomUUID();
    this.marca = props.marca;
    this.modelo = props.modelo;
    this.ano = props.ano;
    this.placa = props.placa;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  toJSON(): VehicleJsonProps {
    return {
      id: this.id,
      marca: this.marca,
      modelo: this.modelo,
      ano: this.ano,
      placa: this.placa,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  get props() {
    return {
      id: this.id,
      marca: this.marca,
      modelo: this.modelo,
      ano: this.ano,
      placa: this.placa,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
