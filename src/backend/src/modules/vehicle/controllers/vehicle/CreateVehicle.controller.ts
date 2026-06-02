import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateVehicleRequestDto } from '../../dtos/vehicle/CreateRequest.dto';
import { GetVehicleResponseDto } from '../../dtos/vehicle/GetResponse.dto';
import { CreateVehicleService } from '../../services/CreateVehicle.service';
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { IUserContainer } from 'src/modules/commons/auth/auth.types';

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
    @UserContainer() container: IUserContainer,
  ): Promise<GetVehicleResponseDto> {
    const vehicle = await this.createVehicle.exec({
      userId: container.user.id,
      marca: body.marca,
      modelo: body.modelo,
      ano: body.ano,
      placa: body.placa,
      fotoUrl: body.fotoUrl,
      tamanhoTanque: body.tamanhoTanque,
      consumoMedio: body.consumoMedio,
    });
    return vehicle.toJSON();
  }
}
