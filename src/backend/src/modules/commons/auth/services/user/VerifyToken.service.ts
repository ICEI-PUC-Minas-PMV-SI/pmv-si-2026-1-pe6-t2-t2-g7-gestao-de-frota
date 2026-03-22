import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../../firebase/firebase.service';
import { ITokenPayload } from '../../auth.types';
import { ServiceError } from 'src/modules/commons/errors/Service.error';
import { TUserProviderType } from '../../models/User.model';

interface IProps {
  idToken: string;
}

@Injectable()
export class VerifyTokenService {
  constructor(private readonly firebase: FirebaseService) {}

  async exec(props: IProps): Promise<ITokenPayload> {
    const payload = await this.firebase.client
      .auth()
      .verifyIdToken(props.idToken, true);
    if (!payload.email || !payload.firebase.sign_in_provider)
      throw new ServiceError(
        'Invalid Provider',
        `[${payload.firebase.sign_in_provider}]: provider not supported!`,
      );
    return {
      uid: payload.uid,
      name: payload?.name ?? 'Not Provided',
      email: payload?.email,
      provider: payload.firebase.sign_in_provider as TUserProviderType,
    };
  }
}
