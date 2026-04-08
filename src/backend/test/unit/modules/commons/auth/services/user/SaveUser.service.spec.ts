import { SaveUserService } from '../../../../../../../src/modules/commons/auth/services/user/SaveUser.service';
import { UserRepo } from '../../../../../../../src/modules/commons/auth/repositories/user/interface';
import { UserModel } from '../../../../../../../src/modules/commons/auth/models/User.model';

describe('SaveUserService', () => {
  it('deve salvar usuário válido', async () => {
    const repo: Pick<UserRepo, 'save'> = {
      save: jest.fn((user) => Promise.resolve(user)),
    };
    const service = new SaveUserService(repo as UserRepo);

    const result = await service.exec({
      uid: 'firebase-uid',
      email: 'user@test.com',
      name: 'User Test',
      provider: 'password',
      role: 'user',
    });

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(UserModel);
    expect(result.toJSON()).toEqual({
      id: undefined,
      uid: 'firebase-uid',
      email: 'user@test.com',
      name: 'User Test',
      provider: 'password',
      role: 'user',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('deve criar UserModel antes de chamar repositório', async () => {
    const repo: Pick<UserRepo, 'save'> = {
      save: jest.fn((user) => Promise.resolve(user)),
    };
    const service = new SaveUserService(repo as UserRepo);

    await service.exec({
      email: 'model@test.com',
      provider: 'google.com',
      role: 'admin',
    });

    const [userArg] = (repo.save as jest.Mock).mock.calls[0] as [UserModel];
    expect(userArg).toBeInstanceOf(UserModel);
    expect(userArg.email).toBe('model@test.com');
    expect(userArg.provider).toBe('google.com');
    expect(userArg.role).toBe('admin');
  });

  it('deve usar role not_provided quando role não for informada', async () => {
    const repo: Pick<UserRepo, 'save'> = {
      save: jest.fn((user) => Promise.resolve(user)),
    };
    const service = new SaveUserService(repo as UserRepo);

    await service.exec({
      email: 'without-role@test.com',
      provider: 'password',
    });

    const [userArg] = (repo.save as jest.Mock).mock.calls[0] as [UserModel];
    expect(userArg.role).toBe('not_provided');
  });
});
