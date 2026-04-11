import { AnalyticsRepoImpl } from '../../../../../src/modules/analytics/repositories/analytics/Analytics.repo';

describe('AnalyticsRepoImpl', () => {
  it('deve consultar as views de analytics', async () => {
    const queryMock = jest
      .fn()
      .mockResolvedValueOnce([{ total_users: '1' }])
      .mockResolvedValueOnce([{ user_id: '1' }])
      .mockResolvedValueOnce([{ journey_id: 'j1' }]);
    const repo = new AnalyticsRepoImpl({ query: queryMock } as never);

    await expect(repo.getDashboard()).resolves.toEqual({ total_users: '1' });
    await expect(repo.getUsersAnalytics()).resolves.toEqual([{ user_id: '1' }]);
    await expect(repo.getJourneysAnalytics()).resolves.toEqual([
      { journey_id: 'j1' },
    ]);
    expect(queryMock).toHaveBeenNthCalledWith(
      1,
      'SELECT * FROM vw_analytics_dashboard LIMIT 1',
    );
  });
});
