import { Injectable } from '@nestjs/common';
import { UserRepo } from '../repositories/user/interface';

@Injectable()
export class DeleteUserService {
  constructor(private readonly userRepo: UserRepo) {}

  async exec(id: string) {
    return await this.userRepo.delete(id);
  }
}
