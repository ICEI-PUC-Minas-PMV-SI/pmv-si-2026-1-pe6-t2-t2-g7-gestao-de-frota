import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class JourneyParadaRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  ordem: number;

  @ApiProperty({ example: -19.8157 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -43.9542 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class CreateJourneyRequestDto {
  @ApiPropertyOptional({ example: 'Entrega manhã — zona sul' })
  @IsOptional()
  @IsString()
  @MaxLength(320)
  nome?: string;

  @ApiProperty({ type: [JourneyParadaRequestDto] })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => JourneyParadaRequestDto)
  paradas: JourneyParadaRequestDto[];

  @ApiProperty({ example: 'd7e15cc6-c0d9-455d-bb27-2ec9fd68a1c7' })
  @IsUUID()
  vehicleId: string;
}
