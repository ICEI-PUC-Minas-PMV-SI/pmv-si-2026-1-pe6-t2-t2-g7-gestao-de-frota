import { Module } from '@nestjs/common';
import { AnalyticsRepoModule } from '../repositories/analyticsRepo.module';
import { GetDashboardService } from '../services/GetDashboard.service';
import { GetUsersAnalyticsService } from '../services/GetUsersAnalytics.service';
import { GetJourneysAnalyticsService } from '../services/GetJourneysAnalytics.service';
import { GetDashboardController } from './analytics/GetDashboard.controller';
import { GetUsersAnalyticsController } from './analytics/GetUsersAnalytics.controller';
import { GetJourneysAnalyticsController } from './analytics/GetJourneysAnalytics.controller';

@Module({
  imports: [AnalyticsRepoModule],
  controllers: [
    GetDashboardController,
    GetUsersAnalyticsController,
    GetJourneysAnalyticsController,
  ],
  providers: [
    GetDashboardService,
    GetUsersAnalyticsService,
    GetJourneysAnalyticsService,
  ],
})
export class AnalyticsModule {}
