import { UserModel } from 'src/modules/commons/auth/models/User.model';
import { UserRepoImpl } from 'src/modules/commons/auth/repositories/user/User.repo';

describe('UserRepoImpl', () => {
  it('deve executar save, update, delete e buscas', async () => {
    const upsertMock = jest.fn(() => Promise.resolve(undefined));
    const findOneByOrFailMock = jest.fn(() => Promise.resolve({ id: 1 }));
    const updateMock = jest.fn(() => Promise.resolve(undefined));
    const deleteMock = jest.fn(() => Promise.resolve(undefined));
    const findOneByMock = jest.fn(() => Promise.resolve({ id: 1 }));
    const findByMock = jest.fn(() => Promise.resolve([{ id: 1 }]));
    const countByMock = jest.fn(() => Promise.resolve(1));
    const findMock = jest.fn(() => Promise.resolve([{ id: 1 }]));
    const repo = new UserRepoImpl({
      getRepository: jest.fn(() => ({
        upsert: upsertMock,
        findOneByOrFail: findOneByOrFailMock,
        update: updateMock,
        delete: deleteMock,
        findOneBy: findOneByMock,
        findBy: findByMock,
        countBy: countByMock,
        find: findMock,
      })),
    } as never);
    const user = new UserModel({
      id: 1,
      uid: 'uid',
      email: 'user@test.com',
      name: 'User',
      provider: 'password',
      role: 'user',
    });

    await expect(repo.save(user)).resolves.toEqual({ id: 1 });
    await expect(repo.update(user)).resolves.toBe(user);
    await expect(repo.delete(1)).resolves.toBeUndefined();
    await expect(repo.findById(1)).resolves.toEqual({ id: 1 });
    await expect(repo.findByUid('uid')).resolves.toEqual({ id: 1 });
    await expect(repo.findOwners()).resolves.toEqual([{ id: 1 }]);
    await expect(repo.findList({ limit: 10, lastItemId: 0 })).resolves.toEqual({
      list: [{ id: 1 }],
      total: 1,
    });
    await expect(repo.changeRole(1, 'admin')).resolves.toBeUndefined();
  });
});
