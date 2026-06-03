import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetVehicleJourneyHistoryService } from '../../services/GetVehicleJourneyHistory.service';
import { JourneyHistoryResponseDto } from '../../dtos/journey/HistoryResponse.dto';
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { IUserContainer } from 'src/modules/commons/auth/auth.types';

@Controller('vehicle')
export class GetVehicleJourneyHistoryController {
  constructor(
    private readonly getVehicleJourneyHistory: GetVehicleJourneyHistoryService,
  ) {}

  @Get(':vehicleId/journeys')
  @ApiOperation({
    summary: 'Listar histórico de jornadas de um veículo',
    tags: ['Jornada'],
  })
  @ApiResponse({ status: 200, type: [JourneyHistoryResponseDto] })
  async exec(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @UserContainer() container: IUserContainer,
  ): Promise<JourneyHistoryResponseDto[]> {
    return await this.getVehicleJourneyHistory.exec({
      vehicleId,
      userId: container.user.id,
    });
  }
}
