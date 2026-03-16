import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { TReplace } from '../../utils/replace';
import { randomUUID } from 'crypto';

export type TUserProviderType = 'google' | 'manual';

export interface IUserModelProps {
  id: string;
  email: string;
  name: string;
  provider: TUserProviderType;
  createdAt: Date;
  updatedAt: Date;
}

export type TUserModelPropsInput = TReplace<
  IUserModelProps,
  {
    id?: string;
    name?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
>;

export interface IUserJsonProps extends IUserModelProps {}

@Unique('UQ_users_email', ['email'])
@Entity({ name: 'users' })
export class UserModel {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_users_id',
  })
  id: string;

  @Column({ name: 'email', length: 320, type: 'varchar' })
  email: string;

  @Column({ name: 'name', length: 255, type: 'varchar' })
  name: string;

  @Column({ name: 'provider', length: 12, type: 'varchar' })
  provider: TUserProviderType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(props: TUserModelPropsInput) {
    if (!props) return;

    this.id = props.id ?? randomUUID();
    this.email = props.email;
    this.name = props.name ?? '';
    this.provider = props.provider;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  toJSON(): IUserJsonProps {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      provider: this.provider,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  get props() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      provider: this.provider,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
