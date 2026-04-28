import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TelemetryResponseDto } from '../../dtos/telemetry/TelemetryResponse.dto';
import { GetJourneyTelemetryService } from '../../services/GetJourneyTelemetry.service';

@Controller('vehicle')
export class GetJourneyTelemetryController {
  constructor(
    private readonly getJourneyTelemetry: GetJourneyTelemetryService,
  ) {}

  @Get(':vehicleId/telemetry')
  @ApiOperation({
    summary: 'Listar telemetria de um veículo',
    tags: ['Telemetria'],
  })
  @ApiResponse({ status: 200, type: [TelemetryResponseDto] })
  async exec(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ): Promise<TelemetryResponseDto[]> {
    return await this.getJourneyTelemetry.exec({
      vehicleId,
    });
  }
}
