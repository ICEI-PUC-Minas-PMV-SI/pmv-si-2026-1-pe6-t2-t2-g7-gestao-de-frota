import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TJourneyStatus } from '../../models/Journey.model';

export class JourneyHistoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  vehicleId: string;

  @ApiPropertyOptional()
  nome?: string;

  @ApiProperty({ enum: ['in_progress', 'completed', 'cancelled'] })
  status: TJourneyStatus;

  @ApiProperty()
  kmRodados: number;

  @ApiProperty()
  combustivelGasto: number;

  @ApiProperty()
  nivelCombustivel: number;

  @ApiProperty()
  iniciadaEm: string;

  @ApiProperty()
  criadaEm: string;

  @ApiProperty()
  atualizadaEm: string;
}
