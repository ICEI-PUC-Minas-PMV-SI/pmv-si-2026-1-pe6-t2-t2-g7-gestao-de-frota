import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FindOwnersService } from '../services/member/FindOwners.service';
import { OWNER_KEY } from '../decorator/owner.decorator';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthTypes } from '../auth.types';

@ApiBearerAuth(AuthTypes.ID_TOKEN)
@Injectable()
export class PreventOwnerGuard implements CanActivate {
  constructor(
    private readonly findOwners: FindOwnersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const key = this.reflector.getAllAndOverride<string>(OWNER_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (typeof key !== 'string')
      throw new InternalServerErrorException(
        "Could not finish 'PreventOwner' validation. Cause: 'key' parameter must be provided",
      );

    const request = ctx.switchToHttp().getRequest<Request>();
    const rawId = request.params[key] ?? request.query[key];
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const ownersList = await this.findOwners.exec();
    const hasOwner = ownersList.some((owner) => owner.id === Number(id));
    if (hasOwner) {
      throw new UnauthorizedException(
        'Cannot execute this operation on owners',
      );
    }

    return true;
  }
}
