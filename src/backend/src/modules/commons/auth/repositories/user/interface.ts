import { TUserRole, UserModel } from '../../models/User.model';

export interface IFindUserListProps {
  limit: number;
  lastItemId: number;
}

export interface IFindUserListResultProps {
  list: UserModel[];
  total: number;
}

export abstract class UserRepo {
  abstract save(user: UserModel): Promise<UserModel>;
  abstract update(user: UserModel): Promise<UserModel>;
  abstract delete(id: number): Promise<void>;
  abstract findById(id: number): Promise<UserModel | null>;
  abstract findByUid(uid: string): Promise<UserModel | null>;
  abstract findOwners(): Promise<UserModel[]>;
  abstract findList({
    limit,
    lastItemId,
  }: IFindUserListProps): Promise<IFindUserListResultProps>;
  abstract changeRole(id: number, role: TUserRole): Promise<void>;
}
