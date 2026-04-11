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

export enum IncidentType {
  SINISTRO = 'sinistro',
  MULTA = 'multa',
}

export class CreateIncidentRequestDto {
  @ApiProperty({ example: 'a0f5a1d3-34a2-4f78-9b1e-7cf426d5fa77' })
  @IsUUID()
  vehicleId: string;

  @ApiProperty({ example: 'sinistro', enum: IncidentType })
  @IsEnum(IncidentType)
  tipo: IncidentType;

  @ApiProperty({ example: 'Colisão traseira em estacionamento' })
  @IsString()
  @MaxLength(1024)
  descricao: string;

  @ApiProperty({ example: 500.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;

  @ApiProperty({ example: '2026-04-10T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  data?: string;
}
