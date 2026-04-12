import request from 'supertest';
import { getE2eHttpServer, getE2eState } from './setup';

const auth = (token: string) => `Bearer ${token}`;

describe('AuthModule (e2e)', () => {
  describe('autenticação global', () => {
    it('deve negar requisições sem token bearer', async () => {
      await request(getE2eHttpServer()).get('/members').expect(403);

      expect(getE2eState().verifyIdToken).not.toHaveBeenCalled();
    });

    it('deve negar requisições com token inválido', async () => {
      await request(getE2eHttpServer())
        .get('/members')
        .set('Authorization', auth('invalid-token'))
        .expect(403);

      expect(getE2eState().verifyIdToken).toHaveBeenCalledWith(
        'invalid-token',
        true,
      );
    });
  });

  describe('conta', () => {
    it('deve sincronizar usuário novo usando nome do body quando o token não possui nome', async () => {
      const response = await request(getE2eHttpServer())
        .post('/account/sync')
        .set('Authorization', auth('new-user-token'))
        .send({ name: 'Novo Usuario' })
        .expect(201);

      expect(response.body).toMatchObject({
        id: 10,
        uid: 'uid-new-user',
        email: 'new-user@test.com',
        name: 'Novo Usuario',
        provider: 'google.com',
        role: 'user',
      });
    });

    it('deve atualizar o nome do usuário autenticado', async () => {
      const response = await request(getE2eHttpServer())
        .patch('/account/1')
        .set('Authorization', auth('valid-user-token'))
        .send({ name: 'Usuario Atualizado' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: 1,
        uid: 'uid-user',
        email: 'user@test.com',
        name: 'Usuario Atualizado',
        role: 'user',
      });
    });

    it('deve remover a conta autenticada no Firebase e no repositório', async () => {
      await request(getE2eHttpServer())
        .delete('/account/1')
        .set('Authorization', auth('valid-user-token'))
        .expect(204);

      expect(getE2eState().deleteFirebaseUser).toHaveBeenCalledWith('uid-user');
      expect(getE2eState().deleteUserRepoMock).toHaveBeenCalledWith(1);
    });
  });

  describe('membros', () => {
    it('deve listar membros autenticados com paginação', async () => {
      const response = await request(getE2eHttpServer())
        .get('/members?limit=2')
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toMatchObject({
        total: 3,
        list: [
          { id: 1, email: 'user@test.com', role: 'user' },
          { id: 2, email: 'admin@test.com', role: 'admin' },
        ],
      });
    });

    it('deve buscar membro por id', async () => {
      const response = await request(getE2eHttpServer())
        .get('/member/2')
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toMatchObject({
        id: 2,
        uid: 'uid-admin',
        email: 'admin@test.com',
        role: 'admin',
      });
    });

    it('deve bloquear alteração de cargo para usuário sem perfil admin ou owner', async () => {
      await request(getE2eHttpServer())
        .patch('/member/2?role=admin')
        .set('Authorization', auth('valid-user-token'))
        .expect(403);
    });

    it('deve permitir que admin altere cargo de membro que não é owner', async () => {
      const response = await request(getE2eHttpServer())
        .patch('/member/1?role=admin')
        .set('Authorization', auth('valid-admin-token'))
        .expect(200);

      expect(response.body).toMatchObject({
        id: 1,
        email: 'user@test.com',
        role: 'admin',
      });
    });

    it('deve impedir remoção de usuário owner', async () => {
      await request(getE2eHttpServer())
        .delete('/member/3')
        .set('Authorization', auth('valid-admin-token'))
        .expect(401);
    });

    it('deve permitir que admin remova membro que não é owner', async () => {
      await request(getE2eHttpServer())
        .delete('/member/1')
        .set('Authorization', auth('valid-admin-token'))
        .expect(204);

      expect(getE2eState().deleteFirebaseUser).toHaveBeenCalledWith('uid-user');
      expect(getE2eState().deleteUserRepoMock).toHaveBeenCalledWith(1);
    });
  });
});
