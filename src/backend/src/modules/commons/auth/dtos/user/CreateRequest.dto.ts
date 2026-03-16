import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class CreateUserRequestDto {
  @ApiProperty({ example: 'johndoe@email.com' })
  @IsString()
  @IsEmail()
  @MaxLength(320)
  email: string;

  @ApiProperty({ example: 'google' })
  @IsString()
  @MaxLength(12)
  provider: string;
}
