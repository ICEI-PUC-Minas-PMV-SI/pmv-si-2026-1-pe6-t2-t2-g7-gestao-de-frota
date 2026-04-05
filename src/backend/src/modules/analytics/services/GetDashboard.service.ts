import { Injectable } from '@nestjs/common';
import { AnalyticsRepo } from '../repositories/analytics/interface';
import { DashboardResponseDto } from '../dtos/analytics/DashboardResponse.dto';

@Injectable()
export class GetDashboardService {
  constructor(private readonly analyticsRepo: AnalyticsRepo) {}

  async exec(): Promise<DashboardResponseDto> {
    const row = await this.analyticsRepo.getDashboard();
    return {
      totalUsers: Number(row.total_users),
      totalVehicles: Number(row.total_vehicles),
      totalJourneys: Number(row.total_journeys),
      journeysInProgress: Number(row.journeys_in_progress),
      journeysFinished: Number(row.journeys_finished),
    };
  }
}
