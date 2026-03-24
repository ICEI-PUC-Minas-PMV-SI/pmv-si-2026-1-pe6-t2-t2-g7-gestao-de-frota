import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { randomUUID } from 'crypto';

export type JourneyPositionJsonProps = {
  id: string;
  journeyId: string;
  latitude: number;
  longitude: number;
  recordedAt: Date;
};

@Entity({ name: 'journey_positions' })
export class JourneyPositionModel {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_journey_positions_id',
  })
  id: string;

  @Column({ name: 'journey_id', type: 'uuid' })
  journeyId: string;

  @Column({ name: 'latitude', type: 'double precision' })
  latitude: number;

  @Column({ name: 'longitude', type: 'double precision' })
  longitude: number;

  @Column({ name: 'recorded_at', type: 'timestamptz' })
  recordedAt: Date;

  constructor(props: {
    id?: string;
    journeyId: string;
    latitude: number;
    longitude: number;
    recordedAt?: Date;
  }) {
    if (!props) return;

    this.id = props.id ?? randomUUID();
    this.journeyId = props.journeyId;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.recordedAt = props.recordedAt ?? new Date();
  }

  toJSON(): JourneyPositionJsonProps {
    return {
      id: this.id,
      journeyId: this.journeyId,
      latitude: this.latitude,
      longitude: this.longitude,
      recordedAt: this.recordedAt,
    };
  }
}
