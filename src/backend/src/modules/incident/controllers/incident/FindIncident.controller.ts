import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GetIncidentResponseDto } from '../../dtos/incident/GetResponse.dto';
import { FindIncidentService } from '../../services/FindIncident.service';

@Controller('incident')
export class FindIncidentController {
  constructor(private readonly findIncident: FindIncidentService) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Buscar um incidente por ID', tags: ['Incidente'] })
  @ApiResponse({ status: 200, type: GetIncidentResponseDto })
  @ApiParam({ name: 'id', required: true })
  @HttpCode(200)
  async exec(
    @Param('id') id: string,
  ): Promise<GetIncidentResponseDto | undefined> {
    const incident = await this.findIncident.exec(id);
    return incident?.toJSON();
  }
}
