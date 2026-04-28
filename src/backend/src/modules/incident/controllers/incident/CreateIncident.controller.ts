import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateIncidentRequestDto } from '../../dtos/incident/CreateRequest.dto';
import { GetIncidentResponseDto } from '../../dtos/incident/GetResponse.dto';
import { CreateIncidentService } from '../../services/CreateIncident.service';

@Controller('incident')
export class CreateIncidentController {
  constructor(private readonly createIncident: CreateIncidentService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar um registro de sinistro ou multa',
    tags: ['Incidente'],
  })
  @ApiResponse({ status: 201, type: GetIncidentResponseDto })
  @ApiBody({ type: CreateIncidentRequestDto })
  @HttpCode(201)
  async exec(
    @Body() body: CreateIncidentRequestDto,
  ): Promise<GetIncidentResponseDto> {
    const incident = await this.createIncident.exec({
      vehicleId: body.vehicleId,
      tipo: body.tipo,
      status: body.status,
      severidade: body.severidade,
      descricao: body.descricao,
      codigoInfracao: body.codigoInfracao,
      valor: body.valor,
      localInfracao: body.localInfracao,
      natureza: body.natureza,
      local: body.local,
      data: body.data ? new Date(body.data) : undefined,
    });

    return incident.toJSON();
  }
}
