import { Injectable } from '@nestjs/common';
import { UserRepo } from '../../repositories/user/interface';
import { TUserModelPropsInput, UserModel } from '../../models/User.model';
import { TReplace } from '../../../utils/replace';

@Injectable()
export class UpdateUserService {
  constructor(private readonly userRepo: UserRepo) {}

  async exec(user: TReplace<Partial<TUserModelPropsInput>, { id: number }>) {
    return await this.userRepo.update(
      new UserModel(user as TUserModelPropsInput),
    );
  }
}
