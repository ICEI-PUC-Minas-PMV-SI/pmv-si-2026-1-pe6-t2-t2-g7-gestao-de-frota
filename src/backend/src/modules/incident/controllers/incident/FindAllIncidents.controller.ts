import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetIncidentResponseDto } from '../../dtos/incident/GetResponse.dto';
import { FindAllIncidentsService } from '../../services/FindAllIncidents.service';

@Controller('incident')
export class FindAllIncidentsController {
  constructor(private readonly findAllIncidents: FindAllIncidentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os incidentes', tags: ['Incidente'] })
  @ApiResponse({ status: 200, type: GetIncidentResponseDto, isArray: true })
  @HttpCode(200)
  async exec(): Promise<GetIncidentResponseDto[]> {
    const incidents = await this.findAllIncidents.exec();
    return incidents.map((incident) => incident.toJSON());
  }
}
