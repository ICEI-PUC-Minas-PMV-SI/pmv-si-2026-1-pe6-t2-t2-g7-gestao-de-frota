import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserRequestDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  @MaxLength(320)
  name: string;
}
