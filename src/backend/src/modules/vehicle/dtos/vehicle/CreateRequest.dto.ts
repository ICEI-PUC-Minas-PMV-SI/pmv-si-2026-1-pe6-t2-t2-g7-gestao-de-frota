import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

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
}
