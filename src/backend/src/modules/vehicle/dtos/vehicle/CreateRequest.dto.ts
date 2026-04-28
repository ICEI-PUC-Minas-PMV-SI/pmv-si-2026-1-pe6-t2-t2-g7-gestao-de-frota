import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateVehicleRequestDto {
  @ApiProperty({ example: 'Fiat' })
  @IsString()
  @MaxLength(255)
  marca: string;

  @ApiProperty({ example: 'Uno' })
  @IsString()
  @MaxLength(255)
  modelo: string;

  @ApiProperty({ example: 2020 })
  @IsInt()
  @Min(1900)
  @Max(2100)
  ano: number;

  @ApiProperty({ example: 'ABC1D23', description: 'Placa no padrão Mercosul' })
  @IsString()
  @MaxLength(10)
  placa: string;

  @ApiProperty({
    example: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8',
    description: 'URL pública da foto do veículo',
  })
  @IsString()
  @IsUrl()
  @MaxLength(2048)
  fotoUrl: string;

  @ApiProperty({ example: 55, description: 'Capacidade do tanque em litros' })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(1)
  tamanhoTanque: number;

  @ApiProperty({
    example: 12.5,
    description: 'Consumo médio em km por litro',
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0.1)
  consumoMedio: number;
}
