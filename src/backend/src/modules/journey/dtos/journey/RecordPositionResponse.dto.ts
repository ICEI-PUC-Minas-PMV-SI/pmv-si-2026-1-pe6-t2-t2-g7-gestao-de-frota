import { ApiProperty } from '@nestjs/swagger';

export class RecordPositionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  registradaEm: string;
}
