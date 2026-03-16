import { Injectable } from '@nestjs/common';
import { UserRepo } from '../repositories/user/interface';
import { TUserModelPropsInput, UserModel } from '../models/User.model';

@Injectable()
export class CreateUserService {
  constructor(private readonly userRepo: UserRepo) {}

  async exec(user: TUserModelPropsInput) {
    return await this.userRepo.create(new UserModel(user));
  }
}
