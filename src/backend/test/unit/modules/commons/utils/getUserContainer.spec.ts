import { UnauthorizedException } from '@nestjs/common';
import { getUserContainer } from 'src/modules/commons/utils/getUserContainer';

describe('getUserContainer', () => {
  it('deve retornar o usuario armazenado no response.locals', () => {
    const ctx = {
      switchToHttp: () => ({
        getResponse: () => ({ locals: { user: { user: { id: 1 } } } }),
      }),
    } as never;

    expect(getUserContainer(ctx)).toEqual({ user: { id: 1 } });
  });

  it('deve lancar erro quando o usuario nao existe', () => {
    const ctx = {
      switchToHttp: () => ({
        getResponse: () => ({ locals: {} }),
      }),
    } as never;

    expect(() => getUserContainer(ctx)).toThrow(UnauthorizedException);
  });
});
