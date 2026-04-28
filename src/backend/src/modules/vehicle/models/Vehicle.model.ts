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
  fotoUrl: string;
  tamanhoTanque: number;
  consumoMedio: number;
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
    fotoUrl: string;
    tamanhoTanque: number;
    consumoMedio: number;
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
  fotoUrl?: string;
  tamanhoTanque?: number;
  consumoMedio?: number;
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

  @Column({ name: 'foto_url', length: 2048, type: 'varchar' })
  fotoUrl: string;

  @Column({ name: 'tamanho_tanque', type: 'double precision' })
  tamanhoTanque: number;

  @Column({ name: 'consumo_medio', type: 'double precision' })
  consumoMedio: number;

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
    this.fotoUrl = props.fotoUrl;
    this.tamanhoTanque = props.tamanhoTanque;
    this.consumoMedio = props.consumoMedio;
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
      fotoUrl: this.fotoUrl,
      tamanhoTanque: this.tamanhoTanque,
      consumoMedio: this.consumoMedio,
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
      fotoUrl: this.fotoUrl,
      tamanhoTanque: this.tamanhoTanque,
      consumoMedio: this.consumoMedio,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
