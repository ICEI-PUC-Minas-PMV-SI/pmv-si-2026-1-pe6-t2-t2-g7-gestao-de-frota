import { GetDashboardService } from '../../../../../src/modules/analytics/services/GetDashboard.service';
import {
  AnalyticsRepo,
  DashboardViewRow,
} from '../../../../../src/modules/analytics/repositories/analytics/interface';

describe('GetDashboardService', () => {
  it('deve converter os campos numericos e retornar o shape esperado', async () => {
    const repo: Pick<AnalyticsRepo, 'getDashboard'> = {
      getDashboard: jest.fn<Promise<DashboardViewRow>, []>(() =>
        Promise.resolve({
          total_users: '12',
          total_vehicles: '7',
          total_journeys: '19',
          journeys_in_progress: '4',
          journeys_finished: '15',
        }),
      ),
    };
    const service = new GetDashboardService(repo as AnalyticsRepo);

    const result = await service.exec();

    expect(repo.getDashboard).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      totalUsers: 12,
      totalVehicles: 7,
      totalJourneys: 19,
      journeysInProgress: 4,
      journeysFinished: 15,
    });
  });
});
