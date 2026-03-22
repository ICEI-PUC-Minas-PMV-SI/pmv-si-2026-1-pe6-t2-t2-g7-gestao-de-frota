import { Injectable } from '@nestjs/common';
import { UserRepo } from '../../repositories/user/interface';

@Injectable()
export class FindUserService {
  constructor(private readonly userRepo: UserRepo) {}

  async findById(id: number) {
    return await this.userRepo.findById(id);
  }

  async findByUid(uid: string) {
    return await this.userRepo.findByUid(uid);
  }
}
