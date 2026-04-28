import { ApiProperty } from '@nestjs/swagger';

export class TelemetryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  vehicleId: string;

  @ApiProperty()
  kmRodados: number;

  @ApiProperty()
  combustivelGasto: number;

  @ApiProperty()
  nivelCombustivel: number;

  @ApiProperty()
  velocidadeMedia: number;

  @ApiProperty()
  registradaEm: string;
}

export class LatestTelemetryResponseDto {
  @ApiProperty()
  temTelemetria: boolean;

  @ApiProperty({ required: false })
  id?: string;

  @ApiProperty({ required: false })
  vehicleId?: string;

  @ApiProperty({ required: false })
  kmRodados?: number;

  @ApiProperty({ required: false })
  combustivelGasto?: number;

  @ApiProperty({ required: false })
  nivelCombustivel?: number;

  @ApiProperty({ required: false })
  velocidadeMedia?: number;

  @ApiProperty({ required: false })
  registradaEm?: string;
}
