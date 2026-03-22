import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { TReplace } from '../../utils/replace';

export type TUserProviderType =
  | 'anonymous'
  | 'password'
  | 'facebook.com'
  | 'github.com'
  | 'google.com'
  | 'twitter.com'
  | 'apple.com'
  | 'microsoft.com'
  | 'yahoo.com'
  | 'phone'
  | 'playgames.google.com'
  | 'gc.apple.com'
  | 'custom';

export interface IUserModelProps {
  id: number;
  uid?: string;
  email: string;
  name?: string;
  provider: TUserProviderType;
  role: TUserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type TUserModelPropsInput = TReplace<
  IUserModelProps,
  {
    id?: number;
    role?: TUserRole;
    createdAt?: Date;
    updatedAt?: Date;
  }
>;

export type TUserRole = 'owner' | 'admin' | 'user' | 'not_provided';
export const userRoleList = ['owner', 'admin', 'user'];

export interface IUserJsonProps extends IUserModelProps {}

@Unique('UQ_users_email', ['email'])
@Entity({ name: 'users' })
export class UserModel {
  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_users_id',
  })
  id: number;

  @Column({ name: 'external_uid', length: 64, type: 'varchar', nullable: true })
  uid?: string;

  @Column({ name: 'email', length: 320, type: 'varchar' })
  email: string;

  @Column({ name: 'name', length: 320, type: 'varchar', nullable: true })
  name: string;

  @Column({ name: 'role', length: 20, type: 'varchar' })
  role: TUserRole;

  @Column({ name: 'provider', length: 12, type: 'varchar' })
  provider: TUserProviderType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(props: TUserModelPropsInput) {
    if (!props) return;

    if (props.id) this.id = props.id;
    if (props.name) this.name = props.name;
    if (props.uid) this.uid = props.uid;

    this.email = props.email;

    this.provider = props.provider;
    this.role = props.role ?? 'not_provided';
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  toJSON(): IUserJsonProps {
    return {
      id: this.id,
      uid: this.uid,
      email: this.email,
      name: this.name,
      provider: this.provider,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  get props() {
    return {
      id: this.id,
      uid: this.uid,
      email: this.email,
      name: this.name,
      role: this.role,
      provider: this.provider,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
