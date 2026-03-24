import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LatestPositionResponseDto } from '../../dtos/journey/LatestPositionResponse.dto';
import { GetLatestJourneyPositionService } from '../../services/GetLatestJourneyPosition.service';
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { IUserContainer } from 'src/modules/commons/auth/auth.types';

@Controller('journey')
export class GetLatestJourneyPositionController {
  constructor(private readonly getLatest: GetLatestJourneyPositionService) {}

  @Get(':journeyId/positions/latest')
  @ApiOperation({
    summary: 'Última posição registada da jornada',
    tags: ['Jornada'],
  })
  @ApiResponse({ status: 200, type: LatestPositionResponseDto })
  async exec(
    @Param('journeyId', ParseUUIDPipe) journeyId: string,
    @UserContainer() container: IUserContainer,
  ): Promise<LatestPositionResponseDto> {
    return await this.getLatest.exec({
      userId: container.user.id,
      journeyId,
    });
  }
}
