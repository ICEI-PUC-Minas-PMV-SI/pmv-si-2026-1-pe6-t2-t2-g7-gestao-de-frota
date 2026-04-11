import { Reflector } from '@nestjs/core';
import { MemberGuard } from 'src/modules/commons/auth/guards/MemberGuard';

describe('MemberGuard', () => {
  const makeCtx = (role: string) =>
    ({
      switchToHttp: () => ({
        getResponse: () => ({ locals: { user: { user: { role } } } }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as never;

  it('deve permitir quando nao ha roles exigidas', () => {
    const guard = new MemberGuard({
      getAllAndMerge: jest.fn(() => []),
    } as unknown as Reflector);

    expect(guard.canActivate(makeCtx('user'))).toBe(true);
  });

  it('deve validar cargo exigido', () => {
    const guard = new MemberGuard({
      getAllAndMerge: jest.fn(() => ['admin']),
    } as unknown as Reflector);

    expect(guard.canActivate(makeCtx('admin'))).toBe(true);
    expect(guard.canActivate(makeCtx('user'))).toBe(false);
  });
});
