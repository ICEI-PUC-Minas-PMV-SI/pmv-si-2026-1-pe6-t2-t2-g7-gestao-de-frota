import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsString,
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

  @ApiProperty({ example: '2025-10-04T21:08:42.332Z' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ example: '2025-10-04T21:08:42.332Z' })
  @IsDateString()
  updatedAt: Date;
}
