import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GetIncidentResponseDto } from '../../dtos/incident/GetResponse.dto';
import { FindIncidentsByVehicleService } from '../../services/FindIncidentsByVehicle.service';
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { IUserContainer } from 'src/modules/commons/auth/auth.types';

@Controller('incident')
export class FindIncidentsByVehicleController {
  constructor(
    private readonly findIncidentsByVehicle: FindIncidentsByVehicleService,
  ) {}

  @Get('vehicle/:vehicleId')
  @ApiOperation({
    summary: 'Listar incidentes de um veículo',
    tags: ['Incidente'],
  })
  @ApiResponse({ status: 200, type: GetIncidentResponseDto, isArray: true })
  @ApiParam({ name: 'vehicleId', required: true })
  @HttpCode(200)
  async exec(
    @Param('vehicleId') vehicleId: string,
    @UserContainer() container: IUserContainer,
  ): Promise<GetIncidentResponseDto[]> {
    const incidents = await this.findIncidentsByVehicle.exec(
      vehicleId,
      container.user.id,
    );
    return incidents.map((incident) => incident.toJSON());
  }
}
