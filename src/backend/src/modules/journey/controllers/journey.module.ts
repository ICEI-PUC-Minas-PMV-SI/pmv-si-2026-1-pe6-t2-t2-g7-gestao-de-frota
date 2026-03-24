import { Module } from '@nestjs/common';
import { JourneyRepoModule } from '../repositories/journeyRepo.module';
import { CreateJourneyService } from '../services/CreateJourney.service';
import { RecordJourneyPositionService } from '../services/RecordJourneyPosition.service';
import { GetLatestJourneyPositionService } from '../services/GetLatestJourneyPosition.service';
import { CreateJourneyController } from './journey/CreateJourney.controller';
import { RecordJourneyPositionController } from './journey/RecordJourneyPosition.controller';
import { GetLatestJourneyPositionController } from './journey/GetLatestJourneyPosition.controller';

@Module({
  imports: [JourneyRepoModule],
  controllers: [
    CreateJourneyController,
    RecordJourneyPositionController,
    GetLatestJourneyPositionController,
  ],
  providers: [
    CreateJourneyService,
    RecordJourneyPositionService,
    GetLatestJourneyPositionService,
  ],
})
export class JourneyModule {}
