import { GetJourneysAnalyticsService } from '../../../../../src/modules/analytics/services/GetJourneysAnalytics.service';
import {
  AnalyticsRepo,
  JourneysAnalyticsViewRow,
} from '../../../../../src/modules/analytics/repositories/analytics/interface';

describe('GetJourneysAnalyticsService', () => {
  it('deve mapear jornadas convertendo userId e preservando strings', async () => {
    const repo: Pick<AnalyticsRepo, 'getJourneysAnalytics'> = {
      getJourneysAnalytics: jest.fn<Promise<JourneysAnalyticsViewRow[]>, []>(
        () =>
          Promise.resolve([
            {
              journey_id: 'journey-1',
              journey_name: 'Entrega Norte',
              status: 'in_progress',
              started_at: '2026-04-01T08:00:00.000Z',
              user_id: '15',
              user_name: 'Carlos',
              user_email: 'carlos@test.com',
            },
          ]),
      ),
    };
    const service = new GetJourneysAnalyticsService(repo as AnalyticsRepo);

    const result = await service.exec();

    expect(repo.getJourneysAnalytics).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        journeyId: 'journey-1',
        journeyName: 'Entrega Norte',
        status: 'in_progress',
        startedAt: '2026-04-01T08:00:00.000Z',
        userId: 15,
        userName: 'Carlos',
        userEmail: 'carlos@test.com',
      },
    ]);
  });

  it('deve omitir campos opcionais nulos no retorno', async () => {
    const repo: Pick<AnalyticsRepo, 'getJourneysAnalytics'> = {
      getJourneysAnalytics: jest.fn<Promise<JourneysAnalyticsViewRow[]>, []>(
        () =>
          Promise.resolve([
            {
              journey_id: 'journey-2',
              journey_name: null as unknown as string,
              status: 'finished',
              started_at: '2026-04-02T08:00:00.000Z',
              user_id: '22',
              user_name: null as unknown as string,
              user_email: 'sem-nome@test.com',
            },
          ]),
      ),
    };
    const service = new GetJourneysAnalyticsService(repo as AnalyticsRepo);

    const result = await service.exec();

    expect(result).toEqual([
      {
        journeyId: 'journey-2',
        journeyName: undefined,
        status: 'finished',
        startedAt: '2026-04-02T08:00:00.000Z',
        userId: 22,
        userName: undefined,
        userEmail: 'sem-nome@test.com',
      },
    ]);
  });
});
