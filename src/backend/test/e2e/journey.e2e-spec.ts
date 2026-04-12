import request from 'supertest';
import { getE2eHttpServer } from './setup';

const auth = (token: string) => `Bearer ${token}`;
const inProgressJourneyId = '33333333-3333-4333-8333-333333333333';
const completedJourneyId = '44444444-4444-4444-8444-444444444444';
const journeyWithoutPositionsId = '55555555-5555-4555-8555-555555555555';

describe('JourneyModule (e2e)', () => {
  describe('autenticação', () => {
    it('deve exigir autenticação para obter uma jornada', async () => {
      await request(getE2eHttpServer())
        .get(`/journey/${inProgressJourneyId}`)
        .expect(403);
    });
  });

  describe('jornadas', () => {
    it('deve criar uma jornada com paradas ordenadas e usuário autenticado', async () => {
      const response = await request(getE2eHttpServer())
        .post('/journey')
        .set('Authorization', auth('valid-user-token'))
        .send({
          nome: 'Coleta Zona Norte',
          paradas: [
            {
              ordem: 2,
              latitude: -23.62,
              longitude: -46.7,
            },
            {
              ordem: 1,
              latitude: -23.61,
              longitude: -46.69,
            },
          ],
        })
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        userId: 1,
        nome: 'Coleta Zona Norte',
        status: 'in_progress',
        iniciadaEm: expect.any(String),
        paradas: [
          {
            id: expect.any(String),
            ordem: 1,
            latitude: -23.61,
            longitude: -46.69,
          },
          {
            id: expect.any(String),
            ordem: 2,
            latitude: -23.62,
            longitude: -46.7,
          },
        ],
        criadaEm: expect.any(String),
        atualizadaEm: expect.any(String),
      });
    });

    it('deve rejeitar criação com menos de duas paradas', async () => {
      await request(getE2eHttpServer())
        .post('/journey')
        .set('Authorization', auth('valid-user-token'))
        .send({
          nome: 'Jornada invalida',
          paradas: [
            {
              ordem: 1,
              latitude: -23.61,
              longitude: -46.69,
            },
          ],
        })
        .expect(400);
    });

    it('deve obter uma jornada com paradas', async () => {
      const response = await request(getE2eHttpServer())
        .get(`/journey/${inProgressJourneyId}`)
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toEqual({
        id: inProgressJourneyId,
        userId: 1,
        nome: 'Rota Centro',
        status: 'in_progress',
        iniciadaEm: '2026-04-08T08:00:00.000Z',
        paradas: [
          {
            id: 'journey-stop-1',
            ordem: 1,
            latitude: -23.5505,
            longitude: -46.6333,
          },
          {
            id: 'journey-stop-2',
            ordem: 2,
            latitude: -23.5614,
            longitude: -46.6559,
          },
        ],
        criadaEm: '2026-04-08T08:00:00.000Z',
        atualizadaEm: '2026-04-08T08:00:00.000Z',
      });
    });

    it('deve retornar 404 ao buscar jornada inexistente', async () => {
      await request(getE2eHttpServer())
        .get('/journey/66666666-6666-4666-8666-666666666666')
        .set('Authorization', auth('valid-user-token'))
        .expect(404);
    });

    it('deve registrar posição em jornada em andamento', async () => {
      const response = await request(getE2eHttpServer())
        .post(`/journey/${inProgressJourneyId}/positions`)
        .set('Authorization', auth('valid-user-token'))
        .send({
          latitude: -23.552,
          longitude: -46.635,
        })
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        latitude: -23.552,
        longitude: -46.635,
        registradaEm: expect.any(String),
      });
    });

    it('deve impedir registro de posição em jornada concluída', async () => {
      await request(getE2eHttpServer())
        .post(`/journey/${completedJourneyId}/positions`)
        .set('Authorization', auth('valid-user-token'))
        .send({
          latitude: -23.54,
          longitude: -46.63,
        })
        .expect(403);
    });

    it('deve retornar a última posição registrada da jornada', async () => {
      const response = await request(getE2eHttpServer())
        .get(`/journey/${inProgressJourneyId}/positions/latest`)
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toEqual({
        temPosicao: true,
        latitude: -23.551,
        longitude: -46.634,
        registradaEm: '2026-04-08T08:15:00.000Z',
      });
    });

    it('deve indicar ausência de posição quando a jornada ainda não possui registros', async () => {
      const response = await request(getE2eHttpServer())
        .get(`/journey/${journeyWithoutPositionsId}/positions/latest`)
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toEqual({
        temPosicao: false,
      });
    });
  });
});
