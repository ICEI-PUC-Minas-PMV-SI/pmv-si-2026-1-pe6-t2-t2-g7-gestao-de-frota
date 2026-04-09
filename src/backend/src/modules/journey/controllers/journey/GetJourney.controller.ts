import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetJourneyService } from '../../services/GetJourney.service';
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { IUserContainer } from 'src/modules/commons/auth/auth.types';

@Controller('journey')
export class GetJourneyController {
  constructor(private readonly getJourney: GetJourneyService) {}

  @Get(':journeyId')
  @ApiOperation({
    summary: 'Obter jornada com paradas',
    tags: ['Jornada'],
  })
  @ApiResponse({ status: 200 })
  async exec(
    @Param('journeyId', ParseUUIDPipe) journeyId: string,
    @UserContainer() container: IUserContainer,
  ) {
    return await this.getJourney.exec({
      userId: container.user.id,
      journeyId,
    });
  }
}
