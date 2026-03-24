import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TJourneyStatus } from '../../models/Journey.model';

export class JourneyParadaResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ordem: number;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;
}

export class CreateJourneyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: number;

  @ApiPropertyOptional()
  nome?: string;

  @ApiProperty({ enum: ['in_progress', 'completed', 'cancelled'] })
  status: TJourneyStatus;

  @ApiProperty()
  iniciadaEm: string;

  @ApiProperty({ type: [JourneyParadaResponseDto] })
  paradas: JourneyParadaResponseDto[];

  @ApiProperty()
  criadaEm: string;

  @ApiProperty()
  atualizadaEm: string;
}
