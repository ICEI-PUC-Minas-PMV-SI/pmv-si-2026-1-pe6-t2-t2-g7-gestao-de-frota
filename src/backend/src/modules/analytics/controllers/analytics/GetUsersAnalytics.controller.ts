import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersAnalyticsResponseDto } from '../../dtos/analytics/UsersAnalyticsResponse.dto';
import { GetUsersAnalyticsService } from '../../services/GetUsersAnalytics.service';

@Controller('analytics')
export class GetUsersAnalyticsController {
  constructor(private readonly getUsersAnalytics: GetUsersAnalyticsService) {}

  @Get('users')
  @ApiOperation({
    summary: 'Analytics de usuários',
    tags: ['Analytics'],
  })
  @ApiResponse({ status: 200, type: [UsersAnalyticsResponseDto] })
  async exec(): Promise<UsersAnalyticsResponseDto[]> {
    return this.getUsersAnalytics.exec();
  }
}
