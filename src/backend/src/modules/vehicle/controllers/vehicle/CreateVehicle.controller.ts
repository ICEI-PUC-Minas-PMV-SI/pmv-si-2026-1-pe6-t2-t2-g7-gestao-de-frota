import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateVehicleRequestDto } from '../../dtos/vehicle/CreateRequest.dto';
import { GetVehicleResponseDto } from '../../dtos/vehicle/GetResponse.dto';
import { CreateVehicleService } from '../../services/CreateVehicle.service';

@Controller('vehicle')
export class CreateVehicleController {
  constructor(private readonly createVehicle: CreateVehicleService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um veículo', tags: ['Veículo'] })
  @ApiResponse({ status: 201, type: GetVehicleResponseDto })
  @ApiBody({ type: CreateVehicleRequestDto })
  @HttpCode(201)
  async exec(
    @Body() body: CreateVehicleRequestDto,
  ): Promise<GetVehicleResponseDto> {
    const vehicle = await this.createVehicle.exec({
      marca: body.marca,
      modelo: body.modelo,
      ano: body.ano,
      placa: body.placa,
    });
    return vehicle.toJSON();
  }
}
