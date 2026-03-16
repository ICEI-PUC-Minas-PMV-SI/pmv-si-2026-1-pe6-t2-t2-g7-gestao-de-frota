import { Injectable } from '@nestjs/common';
import { UserRepo } from '../repositories/user/interface';
import { TUserModelPropsInput, UserModel } from '../models/User.model';

@Injectable()
export class UpdateUserService {
  constructor(private readonly userRepo: UserRepo) {}

  async exec(user: TUserModelPropsInput) {
    return await this.userRepo.update(new UserModel(user));
  }
}
