import { ApiProperty } from '@nestjs/swagger';

export class LatestPositionResponseDto {
  @ApiProperty()
  temPosicao: boolean;

  @ApiProperty({ required: false })
  latitude?: number;

  @ApiProperty({ required: false })
  longitude?: number;

  @ApiProperty({ required: false })
  registradaEm?: string;
}
