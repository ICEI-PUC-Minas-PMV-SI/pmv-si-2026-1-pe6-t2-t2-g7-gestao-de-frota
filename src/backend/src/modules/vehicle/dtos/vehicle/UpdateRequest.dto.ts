import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateVehicleRequestDto {
  @ApiProperty({ example: 'Fiat' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  marca?: string;

  @ApiProperty({ example: 'Uno' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  modelo?: string;

  @ApiProperty({ example: 2020 })
  @IsInt()
  @IsOptional()
  @Min(1900)
  @Max(2100)
  ano?: number;

  @ApiProperty({ example: 'ABC1D23', description: 'Placa no padrão Mercosul' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  placa?: string;
}
