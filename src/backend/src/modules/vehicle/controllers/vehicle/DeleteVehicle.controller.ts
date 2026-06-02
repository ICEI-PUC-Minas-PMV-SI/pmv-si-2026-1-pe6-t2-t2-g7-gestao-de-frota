import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { DeleteVehicleService } from '../../services/DeleteVehicle.service';
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { IUserContainer } from 'src/modules/commons/auth/auth.types';

@Controller('vehicle')
export class DeleteVehicleController {
  constructor(private readonly deleteVehicle: DeleteVehicleService) {}

  @Delete('/:id')
  @ApiOperation({ summary: 'Deletar um veículo', tags: ['Veículo'] })
  @ApiResponse({ status: 204 })
  @ApiParam({ name: 'id', required: true })
  @HttpCode(204)
  async exec(
    @Param('id') id: string,
    @UserContainer() container: IUserContainer,
  ): Promise<void> {
    await this.deleteVehicle.exec(id, container.user.id);
  }
}
