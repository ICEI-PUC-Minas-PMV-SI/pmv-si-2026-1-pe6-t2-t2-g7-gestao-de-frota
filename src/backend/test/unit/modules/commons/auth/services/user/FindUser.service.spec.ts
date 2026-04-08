import { FindUserService } from '../../../../../../../src/modules/commons/auth/services/user/FindUser.service';
import { UserRepo } from '../../../../../../../src/modules/commons/auth/repositories/user/interface';
import { UserModel } from '../../../../../../../src/modules/commons/auth/models/User.model';

describe('FindUserService', () => {
  it('deve buscar usuário por id', async () => {
    const user = new UserModel({
      id: 1,
      email: 'user@test.com',
      provider: 'password',
      role: 'user',
    });
    const repo: Pick<UserRepo, 'findById' | 'findByUid'> = {
      findById: jest.fn(() => Promise.resolve(user)),
      findByUid: jest.fn(),
    };
    const service = new FindUserService(repo as UserRepo);

    await expect(service.findById(1)).resolves.toBe(user);
    expect(repo.findById).toHaveBeenCalledWith(1);
    expect(repo.findById).toHaveBeenCalledTimes(1);
  });

  it('deve retornar null quando usuário não existir por id', async () => {
    const repo: Pick<UserRepo, 'findById' | 'findByUid'> = {
      findById: jest.fn(() => Promise.resolve(null)),
      findByUid: jest.fn(),
    };
    const service = new FindUserService(repo as UserRepo);

    await expect(service.findById(999)).resolves.toBeNull();
    expect(repo.findById).toHaveBeenCalledWith(999);
  });

  it('deve buscar usuário por uid', async () => {
    const user = new UserModel({
      id: 2,
      uid: 'firebase-uid',
      email: 'uid@test.com',
      provider: 'google.com',
      role: 'admin',
    });
    const repo: Pick<UserRepo, 'findById' | 'findByUid'> = {
      findById: jest.fn(),
      findByUid: jest.fn(() => Promise.resolve(user)),
    };
    const service = new FindUserService(repo as UserRepo);

    await expect(service.findByUid('firebase-uid')).resolves.toBe(user);
    expect(repo.findByUid).toHaveBeenCalledWith('firebase-uid');
    expect(repo.findByUid).toHaveBeenCalledTimes(1);
  });

  it('deve retornar null quando usuário não existir por uid', async () => {
    const repo: Pick<UserRepo, 'findById' | 'findByUid'> = {
      findById: jest.fn(),
      findByUid: jest.fn(() => Promise.resolve(null)),
    };
    const service = new FindUserService(repo as UserRepo);

    await expect(service.findByUid('missing-uid')).resolves.toBeNull();
    expect(repo.findByUid).toHaveBeenCalledWith('missing-uid');
  });
});
