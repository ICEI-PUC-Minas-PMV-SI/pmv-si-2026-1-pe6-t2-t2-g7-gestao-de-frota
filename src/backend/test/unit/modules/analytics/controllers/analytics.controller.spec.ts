import { GetDashboardController } from '../../../../../src/modules/analytics/controllers/analytics/GetDashboard.controller';
import { GetJourneysAnalyticsController } from '../../../../../src/modules/analytics/controllers/analytics/GetJourneysAnalytics.controller';
import { GetUsersAnalyticsController } from '../../../../../src/modules/analytics/controllers/analytics/GetUsersAnalytics.controller';

describe('Analytics controllers', () => {
  it('deve retornar o dashboard pelo service', async () => {
    const execMock = jest.fn(() =>
      Promise.resolve({
        totalUsers: 1,
        totalVehicles: 2,
        totalJourneys: 3,
        journeysInProgress: 4,
        journeysFinished: 5,
      }),
    );
    const controller = new GetDashboardController({
      exec: execMock,
    } as never);

    await expect(controller.exec()).resolves.toEqual({
      totalUsers: 1,
      totalVehicles: 2,
      totalJourneys: 3,
      journeysInProgress: 4,
      journeysFinished: 5,
    });
    expect(execMock).toHaveBeenCalledTimes(1);
  });

  it('deve retornar analytics de usuarios pelo service', async () => {
    const execMock = jest.fn(() =>
      Promise.resolve([{ userId: 1, name: 'User', email: 'u@test.com' }]),
    );
    const controller = new GetUsersAnalyticsController({
      exec: execMock,
    } as never);

    await expect(controller.exec()).resolves.toEqual([
      { userId: 1, name: 'User', email: 'u@test.com' },
    ]);
  });

  it('deve retornar analytics de jornadas pelo service', async () => {
    const execMock = jest.fn(() =>
      Promise.resolve([{ journeyId: 'j1', status: 'finished' }]),
    );
    const controller = new GetJourneysAnalyticsController({
      exec: execMock,
    } as never);

    await expect(controller.exec()).resolves.toEqual([
      { journeyId: 'j1', status: 'finished' },
    ]);
  });
});
