import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { DeleteVehicleService } from '../../services/DeleteVehicle.service';

@Controller('vehicle')
export class DeleteVehicleController {
  constructor(private readonly deleteVehicle: DeleteVehicleService) {}

  @Delete('/:id')
  @ApiOperation({ summary: 'Deletar um veículo', tags: ['Vehicle'] })
  @ApiResponse({ status: 204 })
  @ApiParam({ name: 'id', required: true })
  @HttpCode(204)
  async exec(@Param('id') id: string): Promise<void> {
    await this.deleteVehicle.exec(id);
  }
}
