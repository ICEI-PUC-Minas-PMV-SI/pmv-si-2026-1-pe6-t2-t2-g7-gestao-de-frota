import { ChangeMemberRoleController } from 'src/modules/commons/auth/controllers/member/ChangeMemberRole.controller';
import { DeleteMemberController } from 'src/modules/commons/auth/controllers/member/DeleteMember.controller';
import { GetMemberController } from 'src/modules/commons/auth/controllers/member/GetMember.controller';
import { ListMemberController } from 'src/modules/commons/auth/controllers/member/ListMembers.controller';
import { DeleteUserController } from 'src/modules/commons/auth/controllers/user/DeleteUser.controller';
import { SignupController } from 'src/modules/commons/auth/controllers/user/Signup.controller';
import { UpdateUserController } from 'src/modules/commons/auth/controllers/user/UpdateUser.controller';
import { UserModel } from 'src/modules/commons/auth/models/User.model';

describe('Auth controllers', () => {
  it('deve alterar o cargo de membro', async () => {
    const user = new UserModel({
      id: 1,
      uid: 'uid',
      email: 'user@test.com',
      name: 'User',
      provider: 'password',
      role: 'admin',
    });
    const execMock = jest.fn(() => Promise.resolve(user));
    const controller = new ChangeMemberRoleController({
      exec: execMock,
    } as never);

    await expect(
      controller.exec({ id: 1 }, { role: 'admin' } as never),
    ).resolves.toBe(user);
  });

  it('deve remover membro existente e retornar 404 quando ausente', async () => {
    const user = new UserModel({
      id: 1,
      uid: 'uid',
      email: 'user@test.com',
      name: 'User',
      provider: 'password',
      role: 'user',
    });
    const deleteExecMock = jest.fn(() => Promise.resolve(undefined));
    const findByIdMock = jest
      .fn()
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null);
    const controller = new DeleteMemberController(
      { exec: deleteExecMock } as never,
      { findById: findByIdMock } as never,
    );
    const response = {
      status: jest.fn(),
      end: jest.fn(),
    };
    response.status.mockReturnValue(response);

    await expect(
      controller.exec(response as never, { id: 1 }),
    ).resolves.toBeUndefined();
    await controller.exec(response as never, { id: 2 });

    expect(deleteExecMock).toHaveBeenCalledWith({ id: 1, externalUid: 'uid' });
    expect(response.status).toHaveBeenCalledWith(404);
  });

  it('deve obter membro', async () => {
    const user = new UserModel({
      id: 1,
      uid: 'uid',
      email: 'user@test.com',
      name: 'User',
      provider: 'password',
      role: 'user',
    });
    const controller = new GetMemberController({
      findById: jest.fn(() => Promise.resolve(user)),
    } as never);

    await expect(controller.exec({ id: 1 })).resolves.toBe(user);
  });

  it('deve listar membros com paginacao', async () => {
    const execMock = jest.fn(() =>
      Promise.resolve({ total: 1, list: [{ id: 1 }] }),
    );
    const controller = new ListMemberController({ exec: execMock } as never);

    await expect(
      controller.exec({ limit: 10, 'last-item-id': 1 } as never),
    ).resolves.toEqual({ total: 1, list: [{ id: 1 }] });
  });

  it('deve deletar o usuario autenticado', async () => {
    const execMock = jest.fn(() => Promise.resolve(undefined));
    const controller = new DeleteUserController({ exec: execMock } as never);

    await expect(
      controller.exec({
        user: { id: 1 },
        payload: { uid: 'uid' },
      } as never),
    ).resolves.toBeUndefined();
  });

  it('deve sincronizar usuario usando nome do payload ou body', async () => {
    const user = new UserModel({
      id: 1,
      uid: 'uid',
      email: 'user@test.com',
      name: 'Novo Nome',
      provider: 'password',
      role: 'user',
    });
    const execMock = jest.fn(() => Promise.resolve(user));
    const signup = new SignupController({ exec: execMock } as never);
    const update = new UpdateUserController({ exec: execMock } as never);

    await expect(
      signup.exec(
        {
          user: { id: 1 },
          payload: { uid: 'uid', name: 'Not Provided' },
        } as never,
        { name: 'Novo Nome' },
      ),
    ).resolves.toMatchObject({ id: 1, name: 'Novo Nome' });

    await expect(
      update.exec({ user: { id: 1 } } as never, { name: 'Atualizado' }),
    ).resolves.toMatchObject({ id: 1 });
  });
});
