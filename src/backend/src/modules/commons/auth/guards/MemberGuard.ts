import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { getUserContainer } from '../../utils/getUserContainer';
import { Reflector } from '@nestjs/core';
import { ROLES_KEYS } from '../decorator/roles.decorator';

@Injectable()
export class MemberGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const userContainer = getUserContainer(ctx);

    const requiredRoles = this.reflector.getAllAndMerge<string[]>(ROLES_KEYS, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const hasRole = requiredRoles.some(
      (role) => role === userContainer.user.role,
    );
    if (!hasRole) return false;

    return true;
  }
}
