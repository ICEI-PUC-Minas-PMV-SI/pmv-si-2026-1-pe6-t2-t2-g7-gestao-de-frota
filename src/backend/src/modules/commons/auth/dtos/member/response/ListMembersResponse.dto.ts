import { ApiProperty } from '@nestjs/swagger';
import {
  GetUserResponseDto,
  IGetUserResponseDto,
} from '../../user/GetResponse.dto';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export interface IGetMemberListResponseDto {
  list: IGetUserResponseDto;
  total: number;
}

export class ListMembersResponseDto {
  @ApiProperty({ type: GetUserResponseDto })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetUserResponseDto)
  list: GetUserResponseDto[];

  @ApiProperty()
  @IsNumber()
  total: number;
}
