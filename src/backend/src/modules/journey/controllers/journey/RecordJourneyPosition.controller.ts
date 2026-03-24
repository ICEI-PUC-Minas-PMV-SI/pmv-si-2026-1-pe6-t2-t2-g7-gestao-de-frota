import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RecordPositionRequestDto } from '../../dtos/journey/RecordPositionRequest.dto';
import { RecordPositionResponseDto } from '../../dtos/journey/RecordPositionResponse.dto';
import { RecordJourneyPositionService } from '../../services/RecordJourneyPosition.service';
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { IUserContainer } from 'src/modules/commons/auth/auth.types';

@Controller('journey')
export class RecordJourneyPositionController {
  constructor(private readonly recordPosition: RecordJourneyPositionService) {}

  @Post(':journeyId/positions')
  @ApiOperation({
    summary: 'Registar posição atual na jornada',
    tags: ['Jornada'],
  })
  @ApiResponse({ status: 201, type: RecordPositionResponseDto })
  @ApiBody({ type: RecordPositionRequestDto })
  @HttpCode(201)
  async exec(
    @Param('journeyId', ParseUUIDPipe) journeyId: string,
    @Body() body: RecordPositionRequestDto,
    @UserContainer() container: IUserContainer,
  ): Promise<RecordPositionResponseDto> {
    return await this.recordPosition.exec({
      userId: container.user.id,
      journeyId,
      latitude: body.latitude,
      longitude: body.longitude,
    });
  }
}
