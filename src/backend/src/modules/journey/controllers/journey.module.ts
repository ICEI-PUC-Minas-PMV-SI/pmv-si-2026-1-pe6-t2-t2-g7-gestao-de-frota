import { Module } from '@nestjs/common';
import { JourneyRepoModule } from '../repositories/journeyRepo.module';
import { CreateJourneyService } from '../services/CreateJourney.service';
import { RecordJourneyPositionService } from '../services/RecordJourneyPosition.service';
import { GetLatestJourneyPositionService } from '../services/GetLatestJourneyPosition.service';
import { GetJourneyService } from '../services/GetJourney.service';
import { CreateJourneyController } from './journey/CreateJourney.controller';
import { RecordJourneyPositionController } from './journey/RecordJourneyPosition.controller';
import { GetLatestJourneyPositionController } from './journey/GetLatestJourneyPosition.controller';
import { GetJourneyController } from './journey/GetJourney.controller';

@Module({
  imports: [JourneyRepoModule],
  controllers: [
    CreateJourneyController,
    RecordJourneyPositionController,
    GetLatestJourneyPositionController,
    GetJourneyController,
  ],
  providers: [
    CreateJourneyService,
    RecordJourneyPositionService,
    GetLatestJourneyPositionService,
    GetJourneyService,
  ],
})
export class JourneyModule {}
