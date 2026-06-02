import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetIncidentResponseDto } from '../../dtos/incident/GetResponse.dto';
import { FindAllIncidentsService } from '../../services/FindAllIncidents.service';
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { IUserContainer } from 'src/modules/commons/auth/auth.types';

@Controller('incident')
export class FindAllIncidentsController {
  constructor(private readonly findAllIncidents: FindAllIncidentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os incidentes', tags: ['Incidente'] })
  @ApiResponse({ status: 200, type: GetIncidentResponseDto, isArray: true })
  @HttpCode(200)
  async exec(
    @UserContainer() container: IUserContainer,
  ): Promise<GetIncidentResponseDto[]> {
    const incidents = await this.findAllIncidents.exec(container.user.id);
    return incidents.map((incident) => incident.toJSON());
  }
}
