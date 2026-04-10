import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GetIncidentResponseDto } from '../../dtos/incident/GetResponse.dto';
import { FindIncidentsByVehicleService } from '../../services/FindIncidentsByVehicle.service';

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
  ): Promise<GetIncidentResponseDto[]> {
    const incidents = await this.findIncidentsByVehicle.exec(vehicleId);
    return incidents.map((incident) => incident.toJSON());
  }
}
