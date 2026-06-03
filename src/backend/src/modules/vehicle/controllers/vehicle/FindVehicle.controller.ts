import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GetVehicleResponseDto } from '../../dtos/vehicle/GetResponse.dto';
import { FindVehicleService } from '../../services/FindVehicle.service';
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { IUserContainer } from 'src/modules/commons/auth/auth.types';

@Controller('vehicle')
export class FindVehicleController {
  constructor(private readonly findVehicle: FindVehicleService) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Buscar um veículo por ID', tags: ['Veículo'] })
  @ApiResponse({ status: 200, type: GetVehicleResponseDto })
  @ApiParam({ name: 'id', required: true })
  @HttpCode(200)
  async exec(
    @Param('id') id: string,
    @UserContainer() container: IUserContainer,
  ): Promise<GetVehicleResponseDto | undefined> {
    const vehicle = await this.findVehicle.exec(id, container.user.id);
    return vehicle?.toJSON();
  }
}
