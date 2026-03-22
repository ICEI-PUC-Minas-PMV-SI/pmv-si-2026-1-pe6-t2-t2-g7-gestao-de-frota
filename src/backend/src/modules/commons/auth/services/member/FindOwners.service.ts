import { Injectable } from '@nestjs/common';
import { UserRepo } from '../../repositories/user/interface';

@Injectable()
export class FindOwnersService {
  constructor(private readonly userRepo: UserRepo) {}

  async exec() {
    return await this.userRepo.findOwners();
  }
}
