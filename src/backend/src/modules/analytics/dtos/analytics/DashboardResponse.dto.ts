import { ApiProperty } from '@nestjs/swagger';

export class DashboardResponseDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  totalVehicles: number;

  @ApiProperty()
  totalJourneys: number;

  @ApiProperty()
  journeysInProgress: number;

  @ApiProperty()
  journeysFinished: number;
}
