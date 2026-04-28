import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TReplace } from '../../commons/utils/replace';
import { randomUUID } from 'crypto';

export type TJourneyStatus = 'in_progress' | 'completed' | 'cancelled';

export type JourneyModelProps = {
  id: string;
  userId: number;
  vehicleId: string;
  name?: string;
  status: TJourneyStatus;
  kmRodados: number;
  combustivelGasto: number;
  nivelCombustivel: number;
  startedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type JourneyModelPropsInput = TReplace<
  JourneyModelProps,
  {
    id?: string;
    name?: string;
    status?: TJourneyStatus;
    kmRodados?: number;
    combustivelGasto?: number;
    nivelCombustivel?: number;
    startedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }
>;

export interface JourneyJsonProps {
  id: string;
  userId: number;
  vehicleId: string;
  name?: string;
  status: TJourneyStatus;
  kmRodados: number;
  combustivelGasto: number;
  nivelCombustivel: number;
  startedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Entity({ name: 'journeys' })
export class JourneyModel {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_journeys_id',
  })
  id: string;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehicleId: string;

  @Column({ name: 'name', length: 320, type: 'varchar', nullable: true })
  name?: string;

  @Column({ name: 'status', length: 24, type: 'varchar' })
  status: TJourneyStatus;

  @Column({ name: 'km_rodados', type: 'double precision', default: 0 })
  kmRodados: number;

  @Column({ name: 'combustivel_gasto', type: 'double precision', default: 0 })
  combustivelGasto: number;

  @Column({ name: 'nivel_combustivel', type: 'double precision', default: 100 })
  nivelCombustivel: number;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(props: JourneyModelPropsInput) {
    if (!props) return;

    this.id = props.id ?? randomUUID();
    this.userId = props.userId;
    this.vehicleId = props.vehicleId;
    this.name = props.name;
    this.status = props.status ?? 'in_progress';
    this.kmRodados = props.kmRodados ?? 0;
    this.combustivelGasto = props.combustivelGasto ?? 0;
    this.nivelCombustivel = props.nivelCombustivel ?? 100;
    this.startedAt = props.startedAt ?? new Date();
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  toJSON(): JourneyJsonProps {
    return {
      id: this.id,
      userId: this.userId,
      vehicleId: this.vehicleId,
      name: this.name,
      status: this.status,
      kmRodados: this.kmRodados,
      combustivelGasto: this.combustivelGasto,
      nivelCombustivel: this.nivelCombustivel,
      startedAt: this.startedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
