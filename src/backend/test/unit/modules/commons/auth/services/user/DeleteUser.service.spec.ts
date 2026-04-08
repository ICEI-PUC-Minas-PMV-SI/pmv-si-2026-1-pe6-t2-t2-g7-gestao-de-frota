import { DeleteUserService } from '../../../../../../../src/modules/commons/auth/services/user/DeleteUser.service';
import { UserRepo } from '../../../../../../../src/modules/commons/auth/repositories/user/interface';
import { FirebaseService } from '../../../../../../../src/modules/commons/firebase/firebase.service';

describe('DeleteUserService', () => {
  it('deve remover no Firebase e no repositório quando externalUid existir', async () => {
    const deleteUser = jest.fn(() => Promise.resolve());
    const auth = jest.fn(() => ({ deleteUser }));
    const repo: Pick<UserRepo, 'delete'> = {
      delete: jest.fn(() => Promise.resolve()),
    };
    const firebase = {
      client: {
        auth,
      },
    } as unknown as FirebaseService;
    const service = new DeleteUserService(repo as UserRepo, firebase);

    await service.exec({ id: 1, externalUid: 'firebase-uid' });

    expect(auth).toHaveBeenCalledTimes(1);
    expect(deleteUser).toHaveBeenCalledWith('firebase-uid');
    expect(repo.delete).toHaveBeenCalledWith(1);
    expect(repo.delete).toHaveBeenCalledTimes(1);
  });

  it('deve remover apenas no repositório quando externalUid não existir', async () => {
    const deleteUser = jest.fn();
    const auth = jest.fn(() => ({ deleteUser }));
    const repo: Pick<UserRepo, 'delete'> = {
      delete: jest.fn(() => Promise.resolve()),
    };
    const firebase = {
      client: {
        auth,
      },
    } as unknown as FirebaseService;
    const service = new DeleteUserService(repo as UserRepo, firebase);

    await service.exec({ id: 2 });

    expect(auth).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
    expect(repo.delete).toHaveBeenCalledWith(2);
  });

  it('deve propagar erro do Firebase e não chamar repositório', async () => {
    const error = new Error('firebase delete failed');
    const deleteUser = jest.fn(() => Promise.reject(error));
    const repo: Pick<UserRepo, 'delete'> = {
      delete: jest.fn(),
    };
    const firebase = {
      client: {
        auth: jest.fn(() => ({ deleteUser })),
      },
    } as unknown as FirebaseService;
    const service = new DeleteUserService(repo as UserRepo, firebase);

    await expect(
      service.exec({ id: 3, externalUid: 'firebase-uid' }),
    ).rejects.toBe(error);
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
