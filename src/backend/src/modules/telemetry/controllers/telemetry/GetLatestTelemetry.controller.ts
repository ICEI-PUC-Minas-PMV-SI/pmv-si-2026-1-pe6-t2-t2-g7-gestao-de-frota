import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LatestTelemetryResponseDto } from '../../dtos/telemetry/TelemetryResponse.dto';
import { GetLatestTelemetryService } from '../../services/GetLatestTelemetry.service';
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { IUserContainer } from 'src/modules/commons/auth/auth.types';

@Controller('journey')
export class GetLatestTelemetryController {
  constructor(private readonly getLatestTelemetry: GetLatestTelemetryService) {}

  @Get(':journeyId/telemetry/latest')
  @ApiOperation({
    summary: 'Obter última telemetria registrada da jornada',
    tags: ['Telemetria'],
  })
  @ApiResponse({ status: 200, type: LatestTelemetryResponseDto })
  async exec(
    @Param('journeyId', ParseUUIDPipe) journeyId: string,
    @UserContainer() container: IUserContainer,
  ): Promise<LatestTelemetryResponseDto> {
    return await this.getLatestTelemetry.exec({
      userId: container.user.id,
      journeyId,
    });
  }
}
