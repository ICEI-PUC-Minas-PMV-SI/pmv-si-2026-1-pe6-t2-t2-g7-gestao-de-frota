import { AuthGuard } from 'src/modules/commons/auth/guards/Auth.guard';
import { UserModel } from 'src/modules/commons/auth/models/User.model';

const makeContext = (authorization?: string) => {
  const request = { headers: { authorization } };
  const response = { locals: {} as Record<string, unknown> };

  return {
    request,
    response,
    ctx: {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as never,
  };
};

describe('AuthGuard', () => {
  it('deve negar quando o token nao existe', async () => {
    const guard = new AuthGuard(
      { exec: jest.fn() } as never,
      {} as never,
      {} as never,
    );

    await expect(guard.canActivate(makeContext().ctx)).resolves.toBe(false);
  });

  it('deve negar quando o payload nao tem email ou provider', async () => {
    const guard = new AuthGuard(
      { exec: jest.fn(() => Promise.resolve({ uid: 'uid' })) } as never,
      {} as never,
      {} as never,
    );

    await expect(
      guard.canActivate(makeContext('Bearer token').ctx),
    ).resolves.toBe(false);
  });

  it('deve carregar usuario existente no container', async () => {
    const user = new UserModel({
      id: 1,
      uid: 'uid',
      email: 'user@test.com',
      name: 'User',
      provider: 'password',
      role: 'user',
    });
    const { ctx, response } = makeContext('Bearer token');
    const guard = new AuthGuard(
      {
        exec: jest.fn(() =>
          Promise.resolve({
            uid: 'uid',
            email: 'user@test.com',
            provider: 'password',
          }),
        ),
      } as never,
      { findByUid: jest.fn(() => Promise.resolve(user)) } as never,
      { exec: jest.fn() } as never,
    );

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(response.locals.user).toMatchObject({
      user: { id: 1 },
      payload: { uid: 'uid' },
    });
  });

  it('deve salvar usuario inexistente e tratar erro como falso', async () => {
    const user = new UserModel({
      id: 2,
      uid: 'uid-2',
      email: 'new@test.com',
      name: 'New',
      provider: 'password',
      role: 'user',
    });
    const saveExecMock = jest.fn(() => Promise.resolve(user));
    const guard = new AuthGuard(
      {
        exec: jest.fn(() =>
          Promise.resolve({
            uid: 'uid-2',
            email: 'new@test.com',
            provider: 'password',
          }),
        ),
      } as never,
      { findByUid: jest.fn(() => Promise.resolve(null)) } as never,
      { exec: saveExecMock } as never,
    );

    await expect(
      guard.canActivate(makeContext('Bearer token').ctx),
    ).resolves.toBe(true);
    expect(saveExecMock).toHaveBeenCalled();

    const errorGuard = new AuthGuard(
      { exec: jest.fn(() => Promise.reject(new Error('boom'))) } as never,
      {} as never,
      {} as never,
    );
    await expect(
      errorGuard.canActivate(makeContext('Bearer token').ctx),
    ).resolves.toBe(false);
  });
});
