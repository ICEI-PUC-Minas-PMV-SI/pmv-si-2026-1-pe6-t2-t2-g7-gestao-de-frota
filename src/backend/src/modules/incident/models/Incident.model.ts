import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TReplace } from '../../commons/utils/replace';
import { randomUUID } from 'crypto';

export enum IncidentType {
  SINISTRO = 'sinistro',
  MULTA = 'multa',
}

export type IncidentModelProps = {
  id: string;
  vehicleId: string;
  tipo: IncidentType;
  descricao: string;
  valor?: number;
  data: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type IncidentModelPropsInput = TReplace<
  IncidentModelProps,
  {
    id?: string;
    vehicleId: string;
    tipo: IncidentType;
    descricao: string;
    valor?: number;
    data?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }
>;

export type IncidentModelUpdateInput = {
  id: string;
  vehicleId?: string;
  tipo?: IncidentType;
  descricao?: string;
  valor?: number;
  data?: Date;
};

export interface IncidentJsonProps extends IncidentModelProps {}

@Entity({ name: 'incidents' })
export class IncidentModel {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_incidents_id',
  })
  id!: string;

  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehicleId!: string;

  @Column({ name: 'tipo', length: 24, type: 'varchar' })
  tipo!: IncidentType;

  @Column({ name: 'descricao', length: 1024, type: 'varchar' })
  descricao!: string;

  @Column({ name: 'valor', type: 'numeric', nullable: true })
  valor?: number;

  @Column({ name: 'data', type: 'timestamptz' })
  data!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  constructor(props: IncidentModelPropsInput) {
    if (!props) return;

    this.id = props.id ?? randomUUID();
    this.vehicleId = props.vehicleId;
    this.tipo = props.tipo;
    this.descricao = props.descricao;
    this.valor = props.valor;
    this.data = props.data ?? new Date();
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  toJSON(): IncidentJsonProps {
    return {
      id: this.id,
      vehicleId: this.vehicleId,
      tipo: this.tipo,
      descricao: this.descricao,
      valor: this.valor,
      data: this.data,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  get props() {
    return {
      id: this.id,
      vehicleId: this.vehicleId,
      tipo: this.tipo,
      descricao: this.descricao,
      valor: this.valor,
      data: this.data,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
