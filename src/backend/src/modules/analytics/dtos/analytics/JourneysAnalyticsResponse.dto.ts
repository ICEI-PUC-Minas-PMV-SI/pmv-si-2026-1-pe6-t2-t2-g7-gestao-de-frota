import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JourneysAnalyticsResponseDto {
  @ApiProperty()
  journeyId: string;

  @ApiPropertyOptional()
  journeyName?: string;

  @ApiProperty({ enum: ['in_progress', 'finished'] })
  status: string;

  @ApiProperty()
  startedAt: string;

  @ApiProperty()
  userId: number;

  @ApiPropertyOptional()
  userName?: string;

  @ApiProperty()
  userEmail: string;
}
