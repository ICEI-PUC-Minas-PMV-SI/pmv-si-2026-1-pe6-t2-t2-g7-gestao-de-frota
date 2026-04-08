import {
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PreventOwnerGuard } from '../../../../../../src/modules/commons/auth/guards/PreventOwner.guard';
import { FindOwnersService } from '../../../../../../src/modules/commons/auth/services/member/FindOwners.service';
import { UserModel } from '../../../../../../src/modules/commons/auth/models/User.model';

describe('PreventOwnerGuard', () => {
  const owner = new UserModel({
    id: 3,
    email: 'owner@test.com',
    provider: 'password',
    role: 'owner',
  });

  const makeGuard = (key: string | undefined = 'id') => {
    const findOwners: Pick<FindOwnersService, 'exec'> = {
      exec: jest.fn(() => Promise.resolve([owner])),
    };
    const reflector: Pick<Reflector, 'getAllAndOverride'> = {
      getAllAndOverride: jest.fn(() => key),
    };

    return {
      guard: new PreventOwnerGuard(
        findOwners as FindOwnersService,
        reflector as Reflector,
      ),
      findOwners,
      reflector,
    };
  };

  const makeContext = ({
    params = {},
    query = {},
  }: {
    params?: Record<string, string>;
    query?: Record<string, string>;
  }) =>
    ({
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({ params, query })),
      })),
    }) as unknown as ExecutionContext;

  it('deve bloquear owner quando id vier por params', async () => {
    const { guard } = makeGuard();
    const context = makeContext({ params: { id: '3' } });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve bloquear owner quando id vier por query', async () => {
    const { guard } = makeGuard();
    const context = makeContext({ query: { id: '3' } });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('deve permitir usuario que nao e owner', async () => {
    const { guard } = makeGuard();
    const context = makeContext({ params: { id: '1' } });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('deve falhar quando decorator nao informar a chave', async () => {
    const { guard, reflector } = makeGuard();
    (reflector.getAllAndOverride as jest.Mock).mockReturnValueOnce(undefined);
    const context = makeContext({ params: { id: '3' } });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
