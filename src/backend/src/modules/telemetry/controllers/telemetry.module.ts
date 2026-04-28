import { Module } from '@nestjs/common';
import { TelemetryRepoModule } from '../repositories/telemetryRepo.module';
import { RecordTelemetryService } from '../services/RecordTelemetry.service';
import { GetJourneyTelemetryService } from '../services/GetJourneyTelemetry.service';
import { GetLatestTelemetryService } from '../services/GetLatestTelemetry.service';
import { RecordTelemetryController } from './telemetry/RecordTelemetry.controller';
import { GetJourneyTelemetryController } from './telemetry/GetJourneyTelemetry.controller';
import { GetLatestTelemetryController } from './telemetry/GetLatestTelemetry.controller';
import { VehicleRepoModule } from '../../vehicle/repositories/vehicleRepo.module';

@Module({
  imports: [TelemetryRepoModule, VehicleRepoModule],
  controllers: [
    RecordTelemetryController,
    GetJourneyTelemetryController,
    GetLatestTelemetryController,
  ],
  providers: [
    RecordTelemetryService,
    GetJourneyTelemetryService,
    GetLatestTelemetryService,
  ],
})
export class TelemetryModule {}
