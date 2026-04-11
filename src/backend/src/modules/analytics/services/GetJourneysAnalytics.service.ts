import { Injectable } from '@nestjs/common';
import { AnalyticsRepo } from '../repositories/analytics/interface';
import { JourneysAnalyticsResponseDto } from '../dtos/analytics/JourneysAnalyticsResponse.dto';

@Injectable()
export class GetJourneysAnalyticsService {
  constructor(private readonly analyticsRepo: AnalyticsRepo) {}

  async exec(): Promise<JourneysAnalyticsResponseDto[]> {
    const rows = await this.analyticsRepo.getJourneysAnalytics();
    return rows.map((row) => ({
      journeyId: row.journey_id,
      journeyName: row.journey_name ?? undefined,
      status: row.status,
      startedAt: row.started_at,
      userId: Number(row.user_id),
      userName: row.user_name ?? undefined,
      userEmail: row.user_email,
    }));
  }
}
