import { ApiProperty } from '@nestjs/swagger';

export class UsersAnalyticsResponseDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  totalJourneys: number;

  @ApiProperty()
  journeysInProgress: number;

  @ApiProperty()
  journeysFinished: number;
}
