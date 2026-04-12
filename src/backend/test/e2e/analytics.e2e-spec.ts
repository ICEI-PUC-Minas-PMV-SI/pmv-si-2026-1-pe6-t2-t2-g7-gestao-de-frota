import request from 'supertest';
import { getE2eHttpServer, getE2eState } from './setup';

const auth = (token: string) => `Bearer ${token}`;

describe('AnalyticsModule (e2e)', () => {
  describe('autenticação', () => {
    it('deve exigir autenticação para consultar o dashboard', async () => {
      await request(getE2eHttpServer()).get('/analytics/dashboard').expect(403);

      expect(getE2eState().verifyIdToken).not.toHaveBeenCalled();
    });
  });

  describe('analytics', () => {
    it('deve retornar o dashboard com contrato numérico para usuário autenticado', async () => {
      const response = await request(getE2eHttpServer())
        .get('/analytics/dashboard')
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toEqual({
        totalUsers: 3,
        totalVehicles: 2,
        totalJourneys: 5,
        journeysInProgress: 2,
        journeysFinished: 3,
      });
      expect(getE2eState().queryDataSourceMock).toHaveBeenCalledWith(
        'SELECT * FROM vw_analytics_dashboard LIMIT 1',
      );
    });

    it('deve retornar a lista de analytics de usuários com os nomes de campos expostos pelo DTO', async () => {
      const response = await request(getE2eHttpServer())
        .get('/analytics/users')
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toEqual([
        {
          userId: 1,
          name: 'Usuario Teste',
          email: 'user@test.com',
          role: 'user',
          totalJourneys: 2,
          journeysInProgress: 1,
          journeysFinished: 1,
        },
        {
          userId: 2,
          name: 'Admin Teste',
          email: 'admin@test.com',
          role: 'admin',
          totalJourneys: 3,
          journeysInProgress: 1,
          journeysFinished: 2,
        },
      ]);
      expect(Array.isArray(response.body)).toBe(true);
      expect(getE2eState().queryDataSourceMock).toHaveBeenCalledWith(
        'SELECT * FROM vw_analytics_users',
      );
    });

    it('deve retornar a lista de jornadas mapeando campos opcionais ausentes como undefined no contrato HTTP', async () => {
      const response = await request(getE2eHttpServer())
        .get('/analytics/journeys')
        .set('Authorization', auth('valid-user-token'))
        .expect(200);

      expect(response.body).toEqual([
        {
          journeyId: 'journey-1',
          journeyName: 'Rota Centro',
          status: 'in_progress',
          startedAt: '2026-04-01T10:00:00.000Z',
          userId: 1,
          userName: 'Usuario Teste',
          userEmail: 'user@test.com',
        },
        {
          journeyId: 'journey-2',
          status: 'finished',
          startedAt: '2026-04-02T15:30:00.000Z',
          userId: 2,
          userEmail: 'admin@test.com',
        },
      ]);
      expect(Array.isArray(response.body)).toBe(true);
      expect(getE2eState().queryDataSourceMock).toHaveBeenCalledWith(
        'SELECT * FROM vw_journeys_users',
      );
    });
  });
});
