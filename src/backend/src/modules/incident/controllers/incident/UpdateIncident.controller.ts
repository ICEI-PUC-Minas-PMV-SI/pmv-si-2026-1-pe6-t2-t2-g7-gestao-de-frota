import { Body, Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateIncidentRequestDto } from '../../dtos/incident/UpdateRequest.dto';
import { GetIncidentResponseDto } from '../../dtos/incident/GetResponse.dto';
import { UpdateIncidentService } from '../../services/UpdateIncident.service';

@Controller('incident')
export class UpdateIncidentController {
  constructor(private readonly updateIncident: UpdateIncidentService) {}

  @Patch('/:id')
  @ApiOperation({ summary: 'Atualizar um incidente', tags: ['Incidente'] })
  @ApiResponse({ status: 200, type: GetIncidentResponseDto })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ type: UpdateIncidentRequestDto })
  @HttpCode(200)
  async exec(
    @Body() body: UpdateIncidentRequestDto,
    @Param('id') id: string,
  ): Promise<GetIncidentResponseDto> {
    const incident = await this.updateIncident.exec({
      id,
      ...(body.vehicleId !== undefined && { vehicleId: body.vehicleId }),
      ...(body.tipo !== undefined && { tipo: body.tipo }),
      ...(body.descricao !== undefined && { descricao: body.descricao }),
      ...(body.valor !== undefined && { valor: body.valor }),
      ...(body.data !== undefined && { data: new Date(body.data) }),
    });
    return incident.toJSON();
  }
}
