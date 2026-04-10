import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { IncidentType } from '../../models/Incident.model';

export class UpdateIncidentRequestDto {
  @ApiProperty({
    example: 'a0f5a1d3-34a2-4f78-9b1e-7cf426d5fa77',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @ApiProperty({ example: 'multa', enum: IncidentType, required: false })
  @IsEnum(IncidentType)
  @IsOptional()
  tipo?: IncidentType;

  @ApiProperty({ example: 'Multa por excesso de velocidade', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1024)
  descricao?: string;

  @ApiProperty({ example: 250.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;

  @ApiProperty({ example: '2026-04-10T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  data?: string;
}
