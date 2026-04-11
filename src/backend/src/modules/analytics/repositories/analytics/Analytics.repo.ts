import { Inject, Injectable } from '@nestjs/common';
import { typeORMConsts } from 'src/modules/commons/typeorm/consts';
import { DataSource } from 'typeorm';
import {
  AnalyticsRepo,
  DashboardViewRow,
  JourneysAnalyticsViewRow,
  UsersAnalyticsViewRow,
} from './interface';

@Injectable()
export class AnalyticsRepoImpl implements AnalyticsRepo {
  constructor(
    @Inject(typeORMConsts.databaseProviders)
    private readonly dataSource: DataSource,
  ) {}

  async getDashboard(): Promise<DashboardViewRow> {
    const rows = await this.dataSource.query(
      'SELECT * FROM vw_analytics_dashboard LIMIT 1',
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return rows[0];
  }

  async getUsersAnalytics(): Promise<UsersAnalyticsViewRow[]> {
    return await this.dataSource.query('SELECT * FROM vw_analytics_users');
  }

  async getJourneysAnalytics(): Promise<JourneysAnalyticsViewRow[]> {
    return await this.dataSource.query('SELECT * FROM vw_journeys_users');
  }
}
