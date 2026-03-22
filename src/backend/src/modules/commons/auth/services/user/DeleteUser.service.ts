import { Injectable } from '@nestjs/common';
import { UserRepo } from '../../repositories/user/interface';
import { FirebaseService } from 'src/modules/commons/firebase/firebase.service';

interface IProps {
  id: number;
  externalUid?: string;
}

@Injectable()
export class DeleteUserService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly firebaseService: FirebaseService,
  ) {}

  async exec(props: IProps) {
    if (props.externalUid)
      await this.firebaseService.client.auth().deleteUser(props.externalUid);
    return await this.userRepo.delete(props.id);
  }
}
