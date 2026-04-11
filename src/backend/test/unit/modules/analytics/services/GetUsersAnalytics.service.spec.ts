import { GetUsersAnalyticsService } from '../../../../../src/modules/analytics/services/GetUsersAnalytics.service';
import {
  AnalyticsRepo,
  UsersAnalyticsViewRow,
} from '../../../../../src/modules/analytics/repositories/analytics/interface';

describe('GetUsersAnalyticsService', () => {
  it('deve mapear usuarios preservando strings e convertendo totais para number', async () => {
    const repo: Pick<AnalyticsRepo, 'getUsersAnalytics'> = {
      getUsersAnalytics: jest.fn<Promise<UsersAnalyticsViewRow[]>, []>(() =>
        Promise.resolve([
          {
            user_id: '10',
            name: 'Maria Silva',
            email: 'maria@test.com',
            role: 'admin',
            total_journeys: '8',
            journeys_in_progress: '3',
            journeys_finished: '5',
          },
        ]),
      ),
    };
    const service = new GetUsersAnalyticsService(repo as AnalyticsRepo);

    const result = await service.exec();

    expect(repo.getUsersAnalytics).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        userId: 10,
        name: 'Maria Silva',
        email: 'maria@test.com',
        role: 'admin',
        totalJourneys: 8,
        journeysInProgress: 3,
        journeysFinished: 5,
      },
    ]);
  });
});
