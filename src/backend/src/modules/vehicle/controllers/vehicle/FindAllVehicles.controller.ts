import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetVehicleResponseDto } from '../../dtos/vehicle/GetResponse.dto';
import { FindAllVehiclesService } from '../../services/FindAllVehicles.service';

@Controller('vehicle')
export class FindAllVehiclesController {
  constructor(private readonly findAllVehicles: FindAllVehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os veículos', tags: ['Vehicle'] })
  @ApiResponse({ status: 200, type: GetVehicleResponseDto, isArray: true })
  @HttpCode(200)
  async exec(): Promise<GetVehicleResponseDto[]> {
    const vehicles = await this.findAllVehicles.exec();
    return vehicles.map((vehicle) => vehicle.toJSON());
  }
}
