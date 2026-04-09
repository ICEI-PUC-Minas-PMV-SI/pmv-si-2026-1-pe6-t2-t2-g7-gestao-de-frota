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
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { IUserContainer } from 'src/modules/commons/auth/auth.types';

@Controller('journey')
export class RecordTelemetryController {
  constructor(private readonly recordTelemetry: RecordTelemetryService) {}

  @Post(':journeyId/telemetry')
  @ApiOperation({
    summary: 'Registrar telemetria da jornada',
    tags: ['Telemetria'],
  })
  @ApiResponse({ status: 201, type: TelemetryResponseDto })
  @ApiBody({ type: RecordTelemetryRequestDto })
  @HttpCode(201)
  async exec(
    @Param('journeyId', ParseUUIDPipe) journeyId: string,
    @Body() body: RecordTelemetryRequestDto,
    @UserContainer() container: IUserContainer,
  ): Promise<TelemetryResponseDto> {
    return await this.recordTelemetry.exec({
      userId: container.user.id,
      journeyId,
      vehicleId: body.vehicleId,
      kmRodados: body.kmRodados,
      combustivelGasto: body.combustivelGasto,
      nivelCombustivel: body.nivelCombustivel,
      latitude: body.latitude,
      longitude: body.longitude,
      velocidadeMedia: body.velocidadeMedia,
    });
  }
}
