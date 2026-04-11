import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JourneysAnalyticsResponseDto } from '../../dtos/analytics/JourneysAnalyticsResponse.dto';
import { GetJourneysAnalyticsService } from '../../services/GetJourneysAnalytics.service';

@Controller('analytics')
export class GetJourneysAnalyticsController {
  constructor(
    private readonly getJourneysAnalytics: GetJourneysAnalyticsService,
  ) {}

  @Get('journeys')
  @ApiOperation({
    summary: 'Analytics de jornadas',
    tags: ['Analytics'],
  })
  @ApiResponse({ status: 200, type: [JourneysAnalyticsResponseDto] })
  async exec(): Promise<JourneysAnalyticsResponseDto[]> {
    return this.getJourneysAnalytics.exec();
  }
}
