import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { DeleteIncidentService } from '../../services/DeleteIncident.service';

@Controller('incident')
export class DeleteIncidentController {
  constructor(private readonly deleteIncident: DeleteIncidentService) {}

  @Delete('/:id')
  @ApiOperation({ summary: 'Deletar um incidente', tags: ['Incidente'] })
  @ApiResponse({ status: 204 })
  @ApiParam({ name: 'id', required: true })
  @HttpCode(204)
  async exec(@Param('id') id: string): Promise<void> {
    await this.deleteIncident.exec(id);
  }
}
