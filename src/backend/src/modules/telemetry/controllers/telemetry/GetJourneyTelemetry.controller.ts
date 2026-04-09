import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TelemetryResponseDto } from '../../dtos/telemetry/TelemetryResponse.dto';
import { GetJourneyTelemetryService } from '../../services/GetJourneyTelemetry.service';
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { IUserContainer } from 'src/modules/commons/auth/auth.types';

@Controller('journey')
export class GetJourneyTelemetryController {
  constructor(
    private readonly getJourneyTelemetry: GetJourneyTelemetryService,
  ) {}

  @Get(':journeyId/telemetry')
  @ApiOperation({
    summary: 'Listar telemetria de uma jornada',
    tags: ['Telemetria'],
  })
  @ApiResponse({ status: 200, type: [TelemetryResponseDto] })
  async exec(
    @Param('journeyId', ParseUUIDPipe) journeyId: string,
    @UserContainer() container: IUserContainer,
  ): Promise<TelemetryResponseDto[]> {
    return await this.getJourneyTelemetry.exec({
      userId: container.user.id,
      journeyId,
    });
  }
}
