import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserRequestDto {
  @ApiProperty({ example: 'johndoe@email.com' })
  @IsString()
  @IsEmail()
  @IsOptional()
  @MaxLength(320)
  email: string;

  @ApiProperty({ example: 'google' })
  @IsString()
  @MaxLength(12)
  @IsOptional()
  provider: string;
}
