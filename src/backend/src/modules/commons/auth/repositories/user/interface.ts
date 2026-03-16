import { UserModel } from '../../models/User.model';

export abstract class UserRepo {
  abstract create(user: UserModel): Promise<UserModel>;
  abstract update(user: UserModel): Promise<UserModel>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<UserModel | null>;
}
