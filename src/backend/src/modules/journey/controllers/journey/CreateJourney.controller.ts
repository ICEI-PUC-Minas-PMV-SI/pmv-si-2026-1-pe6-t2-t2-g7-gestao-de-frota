import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateJourneyRequestDto } from '../../dtos/journey/CreateRequest.dto';
import { CreateJourneyResponseDto } from '../../dtos/journey/CreateResponse.dto';
import { CreateJourneyService } from '../../services/CreateJourney.service';
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { IUserContainer } from 'src/modules/commons/auth/auth.types';

@Controller('journey')
export class CreateJourneyController {
  constructor(private readonly createJourney: CreateJourneyService) {}

  @Post()
  @ApiOperation({
    summary: 'Iniciar jornada (criar com paradas)',
    tags: ['Jornada'],
  })
  @ApiResponse({ status: 201, type: CreateJourneyResponseDto })
  @ApiBody({ type: CreateJourneyRequestDto })
  @HttpCode(201)
  async exec(
    @Body() body: CreateJourneyRequestDto,
    @UserContainer() container: IUserContainer,
  ): Promise<CreateJourneyResponseDto> {
    return await this.createJourney.exec({
      userId: container.user.id,
      vehicleId: body.vehicleId,
      nome: body.nome,
      paradas: body.paradas.map((p) => ({
        ordem: p.ordem,
        latitude: p.latitude,
        longitude: p.longitude,
      })),
    });
  }
}
