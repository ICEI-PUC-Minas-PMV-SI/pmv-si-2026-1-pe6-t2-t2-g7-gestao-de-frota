import request from 'supertest';
import { getE2eHttpServer, getE2eState } from './setup';

const auth = (token: string) => `Bearer ${token}`;
const vehicleOneId = '11111111-1111-4111-8111-111111111111';
const vehicleTwoId = '22222222-2222-4222-8222-222222222222';

describe('IncidentModule (e2e)', () => {
  describe('autenticação', () => {
    it('deve exigir autenticação para listar incidentes', async () => {
      await request(getE2eHttpServer()).get('/incident').expect(403);

      expect(getE2eState().verifyIdToken).not.toHaveBeenCalled();
    });
  });

  describe('incidentes', () => {
    it('deve listar todos os incidentes para usuário autenticado', async () => {
      const response = await request(getE2eHttpServer())
        .get('/incident')
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toMatchObject([
        {
          id: 'incident-1-id',
          vehicleId: vehicleOneId,
          tipo: 'sinistro',
          descricao: 'Colisao traseira leve',
          valor: 500,
        },
        {
          id: 'incident-2-id',
          vehicleId: vehicleTwoId,
          tipo: 'multa',
          descricao: 'Excesso de velocidade',
          valor: 250,
        },
      ]);
    });

    it('deve buscar um incidente por id', async () => {
      const response = await request(getE2eHttpServer())
        .get('/incident/incident-1-id')
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'incident-1-id',
        vehicleId: vehicleOneId,
        tipo: 'sinistro',
        descricao: 'Colisao traseira leve',
        valor: 500,
      });
    });

    it('deve listar incidentes filtrando por veículo', async () => {
      const response = await request(getE2eHttpServer())
        .get(`/incident/vehicle/${vehicleOneId}`)
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toEqual([
        expect.objectContaining({
          id: 'incident-1-id',
          vehicleId: vehicleOneId,
        }),
      ]);
    });

    it('deve criar um incidente com payload válido', async () => {
      const response = await request(getE2eHttpServer())
        .post('/incident')
        .set('Authorization', auth('valid-user-token'))
        .send({
          vehicleId: vehicleOneId,
          tipo: 'sinistro',
          status: 'aberto',
          severidade: 'media',
          descricao: 'Dano na lateral',
          valor: 900,
          natureza: 'colisao',
          local: 'Av. Brasil, 500',
          data: '2026-04-10T00:00:00.000Z',
        })
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        vehicleId: vehicleOneId,
        tipo: 'sinistro',
        status: 'aberto',
        severidade: 'media',
        descricao: 'Dano na lateral',
        valor: 900,
        natureza: 'colisao',
        local: 'Av. Brasil, 500',
        data: '2026-04-10T00:00:00.000Z',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('deve rejeitar criação com descrição acima do limite', async () => {
      await request(getE2eHttpServer())
        .post('/incident')
        .set('Authorization', auth('valid-user-token'))
        .send({
          vehicleId: vehicleOneId,
          tipo: 'sinistro',
          status: 'aberto',
          severidade: 'media',
          descricao: 'a'.repeat(1025),
          data: '2026-04-10T00:00:00.000Z',
        })
        .expect(400);
    });

    it('deve atualizar um incidente existente', async () => {
      const response = await request(getE2eHttpServer())
        .patch('/incident/incident-1-id')
        .set('Authorization', auth('valid-user-token'))
        .send({
          tipo: 'multa',
          descricao: 'Descricao atualizada',
          valor: 650,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'incident-1-id',
        vehicleId: vehicleOneId,
        tipo: 'multa',
        descricao: 'Descricao atualizada',
        valor: 650,
      });
    });

    it('deve retornar 404 ao atualizar incidente inexistente', async () => {
      await request(getE2eHttpServer())
        .patch('/incident/incident-inexistente')
        .set('Authorization', auth('valid-user-token'))
        .send({ descricao: 'Nao Existe' })
        .expect(404);
    });

    it('deve remover um incidente existente', async () => {
      await request(getE2eHttpServer())
        .delete('/incident/incident-1-id')
        .set('Authorization', auth('valid-user-token'))
        .expect(204);

      const deleteIncidentMock = getE2eState().incidentRepo.delete as jest.Mock;

      expect(deleteIncidentMock).toHaveBeenCalledWith('incident-1-id');
    });
  });
});
