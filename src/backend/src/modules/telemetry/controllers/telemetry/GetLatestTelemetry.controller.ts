import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LatestTelemetryResponseDto } from '../../dtos/telemetry/TelemetryResponse.dto';
import { GetLatestTelemetryService } from '../../services/GetLatestTelemetry.service';

@Controller('vehicle')
export class GetLatestTelemetryController {
  constructor(private readonly getLatestTelemetry: GetLatestTelemetryService) {}

  @Get(':vehicleId/telemetry/latest')
  @ApiOperation({
    summary: 'Obter última telemetria registrada do veículo',
    tags: ['Telemetria'],
  })
  @ApiResponse({ status: 200, type: LatestTelemetryResponseDto })
  async exec(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ): Promise<LatestTelemetryResponseDto> {
    return await this.getLatestTelemetry.exec({
      vehicleId,
    });
  }
}
