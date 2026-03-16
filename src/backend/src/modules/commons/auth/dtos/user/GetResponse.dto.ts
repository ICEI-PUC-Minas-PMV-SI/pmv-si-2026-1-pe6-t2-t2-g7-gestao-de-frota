import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { IUserJsonProps } from '../../models/User.model';

export interface IGetUserResponseDto extends IUserJsonProps {}

export class GetUserResponseDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'johndoe@email.com' })
  @IsString()
  @IsEmail()
  @MaxLength(320)
  email: string;

  @ApiProperty({ example: 'google' })
  @IsString()
  @MaxLength(12)
  provider: string;

  @ApiProperty({ example: '2025-10-04T21:08:42.332Z' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ example: '2025-10-04T21:08:42.332Z' })
  @IsDateString()
  updatedAt: Date;
}
