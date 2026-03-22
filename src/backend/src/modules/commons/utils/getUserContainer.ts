import { Response } from 'express';
import { IUserContainer } from '../auth/auth.types';
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const UserContainer = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IUserContainer => {
    const response = ctx.switchToHttp().getResponse<Response>();
    const user = response.locals.user as unknown as IUserContainer;

    if (!user)
      throw new UnauthorizedException('User payload does not exist yet!');

    return user;
  },
);

export const getUserContainer = (ctx: ExecutionContext): IUserContainer => {
  const response = ctx.switchToHttp().getResponse<Response>();
  const user = response.locals.user as unknown as IUserContainer;

  if (!user)
    throw new UnauthorizedException('User payload does not exist yet!');

  return user;
};
