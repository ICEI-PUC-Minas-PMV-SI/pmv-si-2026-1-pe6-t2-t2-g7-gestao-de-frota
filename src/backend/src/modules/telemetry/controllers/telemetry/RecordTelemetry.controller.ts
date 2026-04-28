import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RecordTelemetryRequestDto } from '../../dtos/telemetry/RecordTelemetryRequest.dto';
import { TelemetryResponseDto } from '../../dtos/telemetry/TelemetryResponse.dto';
import { RecordTelemetryService } from '../../services/RecordTelemetry.service';

@Controller('vehicle')
export class RecordTelemetryController {
  constructor(private readonly recordTelemetry: RecordTelemetryService) {}

  @Post(':vehicleId/telemetry')
  @ApiOperation({
    summary: 'Registrar telemetria do veículo',
    tags: ['Telemetria'],
  })
  @ApiResponse({ status: 201, type: TelemetryResponseDto })
  @ApiBody({ type: RecordTelemetryRequestDto })
  @HttpCode(201)
  async exec(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Body() body: RecordTelemetryRequestDto,
  ): Promise<TelemetryResponseDto> {
    return await this.recordTelemetry.exec({
      vehicleId,
      kmRodados: body.kmRodados,
      combustivelGasto: body.combustivelGasto,
      nivelCombustivel: body.nivelCombustivel,
      velocidadeMedia: body.velocidadeMedia,
    });
  }
}
