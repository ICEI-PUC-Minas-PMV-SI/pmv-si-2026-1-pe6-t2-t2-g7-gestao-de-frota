import { Module } from '@nestjs/common';
import { JourneyRepoModule } from '../repositories/journeyRepo.module';
import { CreateJourneyService } from '../services/CreateJourney.service';
import { RecordJourneyPositionService } from '../services/RecordJourneyPosition.service';
import { GetLatestJourneyPositionService } from '../services/GetLatestJourneyPosition.service';
import { GetJourneyService } from '../services/GetJourney.service';
import { CompleteJourneyService } from '../services/CompleteJourney.service';
import { GetVehicleJourneyHistoryService } from '../services/GetVehicleJourneyHistory.service';
import { CreateJourneyController } from './journey/CreateJourney.controller';
import { RecordJourneyPositionController } from './journey/RecordJourneyPosition.controller';
import { GetLatestJourneyPositionController } from './journey/GetLatestJourneyPosition.controller';
import { GetJourneyController } from './journey/GetJourney.controller';
import { CompleteJourneyController } from './journey/CompleteJourney.controller';
import { GetVehicleJourneyHistoryController } from './journey/GetVehicleJourneyHistory.controller';
import { VehicleRepoModule } from '../../vehicle/repositories/vehicleRepo.module';

@Module({
  imports: [JourneyRepoModule, VehicleRepoModule],
  controllers: [
    CreateJourneyController,
    RecordJourneyPositionController,
    GetLatestJourneyPositionController,
    GetJourneyController,
    CompleteJourneyController,
    GetVehicleJourneyHistoryController,
  ],
  providers: [
    CreateJourneyService,
    RecordJourneyPositionService,
    GetLatestJourneyPositionService,
    GetJourneyService,
    CompleteJourneyService,
    GetVehicleJourneyHistoryService,
  ],
})
export class JourneyModule {}
