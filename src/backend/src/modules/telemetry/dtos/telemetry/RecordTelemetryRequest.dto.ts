import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class RecordTelemetryRequestDto {
  @ApiProperty({ example: 120.5 })
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  kmRodados: number;

  @ApiProperty({ example: 8.3 })
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  combustivelGasto: number;

  @ApiProperty({ example: 45.0 })
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(100)
  nivelCombustivel: number;

  @ApiProperty({ example: 60 })
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(300)
  velocidadeMedia: number;
}
