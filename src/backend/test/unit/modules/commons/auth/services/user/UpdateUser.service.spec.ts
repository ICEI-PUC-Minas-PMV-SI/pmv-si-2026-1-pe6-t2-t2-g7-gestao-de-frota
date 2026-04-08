import { UpdateUserService } from '../../../../../../../src/modules/commons/auth/services/user/UpdateUser.service';
import { UserRepo } from '../../../../../../../src/modules/commons/auth/repositories/user/interface';
import { UserModel } from '../../../../../../../src/modules/commons/auth/models/User.model';

describe('UpdateUserService', () => {
  it('deve chamar repositório com UserModel', async () => {
    const repo: Pick<UserRepo, 'update'> = {
      update: jest.fn((user) => Promise.resolve(user)),
    };
    const service = new UpdateUserService(repo as UserRepo);

    await service.exec({
      id: 1,
      email: 'user@test.com',
      name: 'User Updated',
      provider: 'password',
      role: 'user',
    });

    expect(repo.update).toHaveBeenCalledTimes(1);
    const [userArg] = (repo.update as jest.Mock).mock.calls[0] as [UserModel];
    expect(userArg).toBeInstanceOf(UserModel);
    expect(userArg.id).toBe(1);
  });

  it('deve atualizar dados parciais como name', async () => {
    const repo: Pick<UserRepo, 'update'> = {
      update: jest.fn((user) => Promise.resolve(user)),
    };
    const service = new UpdateUserService(repo as UserRepo);

    const result = await service.exec({
      id: 2,
      email: 'partial@test.com',
      name: 'Partial Updated',
      provider: 'google.com',
    });

    expect(result.name).toBe('Partial Updated');
    expect(result.email).toBe('partial@test.com');
    expect(result.provider).toBe('google.com');
  });

  it('deve atualizar role para fluxo de alteração de membro', async () => {
    const repo: Pick<UserRepo, 'update'> = {
      update: jest.fn((user) => Promise.resolve(user)),
    };
    const service = new UpdateUserService(repo as UserRepo);

    await service.exec({
      id: 3,
      email: 'member@test.com',
      provider: 'password',
      role: 'admin',
    });

    const [userArg] = (repo.update as jest.Mock).mock.calls[0] as [UserModel];
    expect(userArg.role).toBe('admin');
  });
});
