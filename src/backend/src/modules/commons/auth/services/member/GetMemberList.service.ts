import { Injectable } from '@nestjs/common';
import { UserRepo } from '../../repositories/user/interface';

interface IProps {
  lastItemId: number;
  limit: number;
}

@Injectable()
export class GetMemberListService {
  constructor(private readonly userRepo: UserRepo) {}

  async exec(props: IProps) {
    return await this.userRepo.findList(props);
  }
}
