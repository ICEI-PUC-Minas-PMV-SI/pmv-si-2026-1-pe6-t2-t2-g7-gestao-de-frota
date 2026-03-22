import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { VerifyTokenService } from '../services/user/VerifyToken.service';
import { Request, Response } from 'express';
import { SaveUserService } from '../services/user/SaveUser.service';
import { TUserProviderType } from '../models/User.model';
import { IUserContainer } from '../auth.types';
import { FindUserService } from '../services/user/FindUser.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly verifyToken: VerifyTokenService,
    private readonly findUser: FindUserService,
    private readonly saveUser: SaveUserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const token = request.headers['authorization']?.replace('Bearer ', '');
    if (!token || token.length <= 0) return false;

    try {
      const payload = await this.verifyToken.exec({ idToken: token });
      if (!payload?.email || !payload?.provider) return false;

      let user = await this.findUser.findByUid(payload.uid);
      if (!user)
        user = await this.saveUser.exec({
          email: payload.email,
          provider: payload.provider satisfies TUserProviderType,
        });
      response.locals.user = {
        user: user.toJSON(),
        payload,
      } satisfies IUserContainer;
      return true;
    } catch {
      return false;
    }
  }
}
