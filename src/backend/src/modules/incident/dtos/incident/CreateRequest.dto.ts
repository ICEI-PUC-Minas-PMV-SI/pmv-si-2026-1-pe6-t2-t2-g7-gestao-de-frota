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

export enum IncidentStatus {
  ABERTO = 'aberto',
  EM_ANALISE = 'em_analise',
  RESOLVIDO = 'resolvido',
  CANCELADO = 'cancelado',
}

export enum IncidentSeverity {
  BAIXA = 'baixa',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica',
}

export class CreateIncidentRequestDto {
  @ApiProperty({ example: 'a0f5a1d3-34a2-4f78-9b1e-7cf426d5fa77' })
  @IsUUID()
  vehicleId: string;

  @ApiProperty({ example: 'sinistro', enum: IncidentType })
  @IsEnum(IncidentType)
  tipo: IncidentType;

  @ApiProperty({ example: 'aberto', enum: IncidentStatus })
  @IsEnum(IncidentStatus)
  status: IncidentStatus;

  @ApiProperty({ example: 'media', enum: IncidentSeverity })
  @IsEnum(IncidentSeverity)
  severidade: IncidentSeverity;

  @ApiProperty({ example: 'Colisão traseira em estacionamento' })
  @IsString()
  @MaxLength(1024)
  descricao: string;

  @ApiProperty({ example: 'A12345', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  codigoInfracao?: string;

  @ApiProperty({ example: 500.0, required: false, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;

  @ApiProperty({ example: 'Av. Cristiano Machado, BH/MG', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  localInfracao?: string;

  @ApiProperty({ example: 'colisão', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  natureza?: string;

  @ApiProperty({ example: 'BR-381 km 420', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  local?: string;

  @ApiProperty({ example: '2026-04-10T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  data?: string;
}
