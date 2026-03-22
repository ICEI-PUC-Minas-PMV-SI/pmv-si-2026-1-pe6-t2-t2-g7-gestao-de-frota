import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  IUserJsonProps,
  type TUserRole,
  userRoleList,
} from '../../models/User.model';

export interface IGetUserResponseDto extends IUserJsonProps {}

export class GetUserResponseDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  @MaxLength(64)
  @IsOptional()
  uid?: string;

  @ApiProperty({ example: 'johndoe@email.com' })
  @IsString()
  @IsEmail()
  @MaxLength(320)
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  @MaxLength(320)
  name?: string;

  @ApiProperty({ example: 'google' })
  @IsString()
  @MaxLength(12)
  provider: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsIn(userRoleList)
  role: TUserRole;

  @ApiProperty({ example: '2025-10-04T21:08:42.332Z' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ example: '2025-10-04T21:08:42.332Z' })
  @IsDateString()
  updatedAt: Date;
}
