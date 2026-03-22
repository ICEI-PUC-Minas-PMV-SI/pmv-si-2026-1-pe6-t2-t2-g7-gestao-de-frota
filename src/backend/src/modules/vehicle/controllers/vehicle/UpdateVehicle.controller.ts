import { Body, Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateVehicleRequestDto } from '../../dtos/vehicle/UpdateRequest.dto';
import { GetVehicleResponseDto } from '../../dtos/vehicle/GetResponse.dto';
import { UpdateVehicleService } from '../../services/UpdateVehicle.service';

@Controller('vehicle')
export class UpdateVehicleController {
  constructor(private readonly updateVehicle: UpdateVehicleService) {}

  @Patch('/:id')
  @ApiOperation({ summary: 'Atualizar um veículo', tags: ['Veículo'] })
  @ApiResponse({ status: 200, type: GetVehicleResponseDto })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ type: UpdateVehicleRequestDto })
  @HttpCode(200)
  async exec(
    @Body() body: UpdateVehicleRequestDto,
    @Param('id') id: string,
  ): Promise<GetVehicleResponseDto> {
    const vehicle = await this.updateVehicle.exec({
      id,
      ...(body.marca !== undefined && { marca: body.marca }),
      ...(body.modelo !== undefined && { modelo: body.modelo }),
      ...(body.ano !== undefined && { ano: body.ano }),
      ...(body.placa !== undefined && { placa: body.placa }),
    });
    return vehicle.toJSON();
  }
}
