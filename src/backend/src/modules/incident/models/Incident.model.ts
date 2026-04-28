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

export enum IncidentStatus {
  ABERTO = 'aberto',
  EM_ANALISE = 'em_analise',
  RESOLVIDO = 'resolvido',
  CANCELADO = 'cancelado',
}

export enum IncidentSeverity {
  BAIXA = 'baixa',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica',
}

export type IncidentModelProps = {
  id: string;
  vehicleId: string;
  tipo: IncidentType;
  status: IncidentStatus;
  severidade: IncidentSeverity;
  descricao: string;
  data: Date;
  codigoInfracao?: string;
  valor?: number;
  localInfracao?: string;
  natureza?: string;
  local?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type IncidentModelPropsInput = TReplace<
  IncidentModelProps,
  {
    id?: string;
    vehicleId: string;
    tipo: IncidentType;
    status?: IncidentStatus;
    severidade: IncidentSeverity;
    descricao: string;
    codigoInfracao?: string;
    valor?: number;
    localInfracao?: string;
    natureza?: string;
    local?: string;
    data?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }
>;

export type IncidentModelUpdateInput = {
  id: string;
  vehicleId?: string;
  tipo?: IncidentType;
  status?: IncidentStatus;
  severidade?: IncidentSeverity;
  descricao?: string;
  codigoInfracao?: string;
  valor?: number;
  localInfracao?: string;
  natureza?: string;
  local?: string;
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

  @Column({ name: 'status', length: 24, type: 'varchar' })
  status!: IncidentStatus;

  @Column({ name: 'severidade', length: 24, type: 'varchar' })
  severidade!: IncidentSeverity;

  @Column({ name: 'descricao', length: 1024, type: 'varchar' })
  descricao!: string;

  @Column({
    name: 'codigo_infracao',
    length: 128,
    type: 'varchar',
    nullable: true,
  })
  codigoInfracao?: string;

  @Column({ name: 'valor', type: 'numeric', nullable: true })
  valor?: number;

  @Column({
    name: 'local_infracao',
    length: 512,
    type: 'varchar',
    nullable: true,
  })
  localInfracao?: string;

  @Column({ name: 'natureza', length: 255, type: 'varchar', nullable: true })
  natureza?: string;

  @Column({ name: 'local', length: 512, type: 'varchar', nullable: true })
  local?: string;

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
    this.status = props.status ?? IncidentStatus.ABERTO;
    this.severidade = props.severidade;
    this.descricao = props.descricao;
    this.codigoInfracao = props.codigoInfracao;
    this.valor = props.valor;
    this.localInfracao = props.localInfracao;
    this.natureza = props.natureza;
    this.local = props.local;
    this.data = props.data ?? new Date();
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  toJSON(): IncidentJsonProps {
    return {
      id: this.id,
      vehicleId: this.vehicleId,
      tipo: this.tipo,
      status: this.status,
      severidade: this.severidade,
      descricao: this.descricao,
      codigoInfracao: this.codigoInfracao,
      valor: this.valor,
      localInfracao: this.localInfracao,
      natureza: this.natureza,
      local: this.local,
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
      status: this.status,
      severidade: this.severidade,
      descricao: this.descricao,
      codigoInfracao: this.codigoInfracao,
      valor: this.valor,
      localInfracao: this.localInfracao,
      natureza: this.natureza,
      local: this.local,
      data: this.data,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
