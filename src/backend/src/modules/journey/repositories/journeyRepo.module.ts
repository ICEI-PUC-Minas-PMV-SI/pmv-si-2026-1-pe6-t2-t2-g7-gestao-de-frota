import { Global, Module } from '@nestjs/common';
import { JourneyRepo } from './journey/interface';
import { JourneyRepoImpl } from './journey/Journey.repo';
import { JourneyPositionRepo } from './journeyPosition/interface';
import { JourneyPositionRepoImpl } from './journeyPosition/JourneyPosition.repo';

@Global()
@Module({
  providers: [
    {
      provide: JourneyRepo,
      useClass: JourneyRepoImpl,
    },
    {
      provide: JourneyPositionRepo,
      useClass: JourneyPositionRepoImpl,
    },
  ],
  exports: [JourneyRepo, JourneyPositionRepo],
})
export class JourneyRepoModule {}
