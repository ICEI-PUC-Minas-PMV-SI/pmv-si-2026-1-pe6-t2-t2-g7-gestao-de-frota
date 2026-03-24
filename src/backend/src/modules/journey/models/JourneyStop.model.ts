import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { randomUUID } from 'crypto';

export type JourneyStopJsonProps = {
  id: string;
  journeyId: string;
  stopOrder: number;
  latitude: number;
  longitude: number;
  createdAt: Date;
};

@Entity({ name: 'journey_stops' })
export class JourneyStopModel {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_journey_stops_id',
  })
  id: string;

  @Column({ name: 'journey_id', type: 'uuid' })
  journeyId: string;

  @Column({ name: 'stop_order', type: 'int' })
  stopOrder: number;

  @Column({ name: 'latitude', type: 'double precision' })
  latitude: number;

  @Column({ name: 'longitude', type: 'double precision' })
  longitude: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  constructor(props: {
    id?: string;
    journeyId: string;
    stopOrder: number;
    latitude: number;
    longitude: number;
    createdAt?: Date;
  }) {
    if (!props) return;

    this.id = props.id ?? randomUUID();
    this.journeyId = props.journeyId;
    this.stopOrder = props.stopOrder;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.createdAt = props.createdAt ?? new Date();
  }

  toJSON(): JourneyStopJsonProps {
    return {
      id: this.id,
      journeyId: this.journeyId,
      stopOrder: this.stopOrder,
      latitude: this.latitude,
      longitude: this.longitude,
      createdAt: this.createdAt,
    };
  }
}
