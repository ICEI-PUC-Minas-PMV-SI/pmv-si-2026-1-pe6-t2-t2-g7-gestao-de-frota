import {
  Controller,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CompleteJourneyService } from '../../services/CompleteJourney.service';
import { CreateJourneyResponseDto } from '../../dtos/journey/CreateResponse.dto';
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { IUserContainer } from 'src/modules/commons/auth/auth.types';

@Controller('journey')
export class CompleteJourneyController {
  constructor(private readonly completeJourney: CompleteJourneyService) {}

  @Patch(':journeyId/complete')
  @ApiOperation({
    summary: 'Concluir jornada e consolidar métricas',
    tags: ['Jornada'],
  })
  @ApiResponse({ status: 200, type: CreateJourneyResponseDto })
  @HttpCode(200)
  async exec(
    @Param('journeyId', ParseUUIDPipe) journeyId: string,
    @UserContainer() container: IUserContainer,
  ): Promise<CreateJourneyResponseDto> {
    return await this.completeJourney.exec({
      userId: container.user.id,
      journeyId,
    });
  }
}
