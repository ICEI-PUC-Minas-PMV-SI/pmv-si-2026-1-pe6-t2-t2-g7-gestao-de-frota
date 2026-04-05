import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardResponseDto } from '../../dtos/analytics/DashboardResponse.dto';
import { GetDashboardService } from '../../services/GetDashboard.service';

@Controller('analytics')
export class GetDashboardController {
  constructor(private readonly getDashboard: GetDashboardService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Painel geral de analytics',
    tags: ['Analytics'],
  })
  @ApiResponse({ status: 200, type: DashboardResponseDto })
  async exec(): Promise<DashboardResponseDto> {
    return this.getDashboard.exec();
  }
}
