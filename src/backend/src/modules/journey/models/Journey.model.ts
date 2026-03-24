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
  name?: string;
  status: TJourneyStatus;
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
    startedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }
>;

export interface JourneyJsonProps {
  id: string;
  userId: number;
  name?: string;
  status: TJourneyStatus;
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

  @Column({ name: 'name', length: 320, type: 'varchar', nullable: true })
  name?: string;

  @Column({ name: 'status', length: 24, type: 'varchar' })
  status: TJourneyStatus;

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
    this.name = props.name;
    this.status = props.status ?? 'in_progress';
    this.startedAt = props.startedAt ?? new Date();
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  toJSON(): JourneyJsonProps {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      status: this.status,
      startedAt: this.startedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
