import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TReplace } from '../../commons/utils/replace';
import { randomUUID } from 'crypto';

export type TelemetryModelProps = {
  id: string;
  journeyId: string;
  vehicleId: string;
  kmRodados: number;
  combustivelGasto: number;
  nivelCombustivel: number;
  latitude: number;
  longitude: number;
  velocidadeMedia: number;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type TelemetryModelPropsInput = TReplace<
  TelemetryModelProps,
  {
    id?: string;
    recordedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }
>;

export interface TelemetryJsonProps extends TelemetryModelProps {}

@Entity({ name: 'telemetry' })
export class TelemetryModel {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_telemetry_id',
  })
  id: string;

  @Column({ name: 'journey_id', type: 'uuid' })
  journeyId: string;

  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehicleId: string;

  @Column({ name: 'km_rodados', type: 'double precision' })
  kmRodados: number;

  @Column({ name: 'combustivel_gasto', type: 'double precision' })
  combustivelGasto: number;

  @Column({ name: 'nivel_combustivel', type: 'double precision' })
  nivelCombustivel: number;

  @Column({ name: 'latitude', type: 'double precision' })
  latitude: number;

  @Column({ name: 'longitude', type: 'double precision' })
  longitude: number;

  @Column({ name: 'velocidade_media', type: 'double precision' })
  velocidadeMedia: number;

  @Column({ name: 'recorded_at', type: 'timestamptz' })
  recordedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(props: TelemetryModelPropsInput) {
    if (!props) return;

    this.id = props.id ?? randomUUID();
    this.journeyId = props.journeyId;
    this.vehicleId = props.vehicleId;
    this.kmRodados = props.kmRodados;
    this.combustivelGasto = props.combustivelGasto;
    this.nivelCombustivel = props.nivelCombustivel;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.velocidadeMedia = props.velocidadeMedia;
    this.recordedAt = props.recordedAt ?? new Date();
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  toJSON(): TelemetryJsonProps {
    return {
      id: this.id,
      journeyId: this.journeyId,
      vehicleId: this.vehicleId,
      kmRodados: this.kmRodados,
      combustivelGasto: this.combustivelGasto,
      nivelCombustivel: this.nivelCombustivel,
      latitude: this.latitude,
      longitude: this.longitude,
      velocidadeMedia: this.velocidadeMedia,
      recordedAt: this.recordedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  get props() {
    return {
      id: this.id,
      journeyId: this.journeyId,
      vehicleId: this.vehicleId,
      kmRodados: this.kmRodados,
      combustivelGasto: this.combustivelGasto,
      nivelCombustivel: this.nivelCombustivel,
      latitude: this.latitude,
      longitude: this.longitude,
      velocidadeMedia: this.velocidadeMedia,
      recordedAt: this.recordedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
