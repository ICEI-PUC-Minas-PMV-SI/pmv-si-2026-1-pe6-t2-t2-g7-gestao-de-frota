import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
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

  @ApiProperty({
    example: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8',
    description: 'URL pública da foto do veículo',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  fotoUrl?: string;

  @ApiProperty({
    example: 55,
    description: 'Capacidade do tanque em litros',
    required: false,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsOptional()
  @Min(1)
  tamanhoTanque?: number;

  @ApiProperty({
    example: 12.5,
    description: 'Consumo médio em km por litro',
    required: false,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsOptional()
  @Min(0.1)
  consumoMedio?: number;
}
