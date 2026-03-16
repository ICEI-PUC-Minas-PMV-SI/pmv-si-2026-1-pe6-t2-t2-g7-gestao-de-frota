import { Injectable } from '@nestjs/common';
import { UserRepo } from '../repositories/user/interface';

@Injectable()
export class FindAllUsersService {
  constructor(private readonly userRepo: UserRepo) {}

  async exec() {
    return await this.userRepo.findAll();
  }
}
