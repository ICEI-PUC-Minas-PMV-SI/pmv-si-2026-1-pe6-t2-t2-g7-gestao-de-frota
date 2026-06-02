import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetVehicleResponseDto } from '../../dtos/vehicle/GetResponse.dto';
import { FindAllVehiclesService } from '../../services/FindAllVehicles.service';
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { IUserContainer } from 'src/modules/commons/auth/auth.types';

@Controller('vehicle')
export class FindAllVehiclesController {
  constructor(private readonly findAllVehicles: FindAllVehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os veículos', tags: ['Veículo'] })
  @ApiResponse({ status: 200, type: GetVehicleResponseDto, isArray: true })
  @HttpCode(200)
  async exec(
    @UserContainer() container: IUserContainer,
  ): Promise<GetVehicleResponseDto[]> {
    const vehicles = await this.findAllVehicles.exec(container.user.id);
    return vehicles.map((vehicle) => vehicle.toJSON());
  }
}
