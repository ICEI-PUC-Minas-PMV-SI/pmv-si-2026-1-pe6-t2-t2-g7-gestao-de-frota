import { FindOwnersService } from '../../../../../../../src/modules/commons/auth/services/member/FindOwners.service';
import { UserRepo } from '../../../../../../../src/modules/commons/auth/repositories/user/interface';
import { UserModel } from '../../../../../../../src/modules/commons/auth/models/User.model';

describe('FindOwnersService', () => {
  it('deve retornar lista de owners', async () => {
    const owners = [
      new UserModel({
        id: 1,
        email: 'owner@test.com',
        provider: 'password',
        role: 'owner',
      }),
    ];
    const repo: Pick<UserRepo, 'findOwners'> = {
      findOwners: jest.fn(() => Promise.resolve(owners)),
    };
    const service = new FindOwnersService(repo as UserRepo);

    await expect(service.exec()).resolves.toBe(owners);
    expect(repo.findOwners).toHaveBeenCalledTimes(1);
  });

  it('deve retornar lista vazia quando não houver owners', async () => {
    const repo: Pick<UserRepo, 'findOwners'> = {
      findOwners: jest.fn(() => Promise.resolve([])),
    };
    const service = new FindOwnersService(repo as UserRepo);

    await expect(service.exec()).resolves.toEqual([]);
    expect(repo.findOwners).toHaveBeenCalledTimes(1);
  });
});
