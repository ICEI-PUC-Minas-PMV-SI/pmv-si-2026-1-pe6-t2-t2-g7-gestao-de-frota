import { GetMemberListService } from '../../../../../../../src/modules/commons/auth/services/member/GetMemberList.service';
import { UserRepo } from '../../../../../../../src/modules/commons/auth/repositories/user/interface';
import { UserModel } from '../../../../../../../src/modules/commons/auth/models/User.model';

describe('GetMemberListService', () => {
  it('deve chamar repositório com limit e lastItemId', async () => {
    const result = { list: [], total: 0 };
    const repo: Pick<UserRepo, 'findList'> = {
      findList: jest.fn(() => Promise.resolve(result)),
    };
    const service = new GetMemberListService(repo as UserRepo);

    await service.exec({ limit: 10, lastItemId: 0 });

    expect(repo.findList).toHaveBeenCalledWith({ limit: 10, lastItemId: 0 });
    expect(repo.findList).toHaveBeenCalledTimes(1);
  });

  it('deve retornar list e total sem transformar resultado', async () => {
    const user = new UserModel({
      id: 1,
      email: 'member@test.com',
      provider: 'password',
      role: 'user',
    });
    const result = { list: [user], total: 1 };
    const repo: Pick<UserRepo, 'findList'> = {
      findList: jest.fn(() => Promise.resolve(result)),
    };
    const service = new GetMemberListService(repo as UserRepo);

    await expect(service.exec({ limit: 10, lastItemId: 0 })).resolves.toBe(
      result,
    );
  });

  it('deve cobrir paginação com lastItemId', async () => {
    const result = { list: [], total: 5 };
    const repo: Pick<UserRepo, 'findList'> = {
      findList: jest.fn(() => Promise.resolve(result)),
    };
    const service = new GetMemberListService(repo as UserRepo);

    await expect(service.exec({ limit: 2, lastItemId: 3 })).resolves.toBe(
      result,
    );
    expect(repo.findList).toHaveBeenCalledWith({ limit: 2, lastItemId: 3 });
  });
});
