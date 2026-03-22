import { Type } from 'class-transformer';
import { IsPositive } from 'class-validator';

export class GetMemberQueryDto {
  @Type(() => Number)
  @IsPositive()
  id: number;
}
