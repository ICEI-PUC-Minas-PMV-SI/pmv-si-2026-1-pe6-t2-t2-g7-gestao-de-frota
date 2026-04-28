import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { VehicleJsonProps } from '../../models/Vehicle.model';

export interface IGetVehicleResponseDto extends VehicleJsonProps {}

export class GetVehicleResponseDto {
  @ApiProperty()
  @IsUUID()
  id: string;

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

  @ApiProperty({ example: 'ABC1D23' })
  @IsString()
  @MaxLength(10)
  placa: string;

  @ApiProperty({
    example: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8',
  })
  @IsString()
  @IsUrl()
  @MaxLength(2048)
  fotoUrl: string;

  @ApiProperty({ example: 55 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(1)
  tamanhoTanque: number;

  @ApiProperty({ example: 12.5 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0.1)
  consumoMedio: number;

  @ApiProperty({ example: '2025-10-04T21:08:42.332Z' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ example: '2025-10-04T21:08:42.332Z' })
  @IsDateString()
  updatedAt: Date;
}
