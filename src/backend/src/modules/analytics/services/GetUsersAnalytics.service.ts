import { Injectable } from '@nestjs/common';
import { AnalyticsRepo } from '../repositories/analytics/interface';
import { UsersAnalyticsResponseDto } from '../dtos/analytics/UsersAnalyticsResponse.dto';

@Injectable()
export class GetUsersAnalyticsService {
  constructor(private readonly analyticsRepo: AnalyticsRepo) {}

  async exec(): Promise<UsersAnalyticsResponseDto[]> {
    const rows = await this.analyticsRepo.getUsersAnalytics();
    return rows.map((row) => ({
      userId: Number(row.user_id),
      name: row.name,
      email: row.email,
      role: row.role,
      totalJourneys: Number(row.total_journeys),
      journeysInProgress: Number(row.journeys_in_progress),
      journeysFinished: Number(row.journeys_finished),
    }));
  }
}
