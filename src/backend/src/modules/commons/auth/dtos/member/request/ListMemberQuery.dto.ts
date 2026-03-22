import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Max } from 'class-validator';

export class ListMemberQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(20)
  limit: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  'last-item-id': number;
}
