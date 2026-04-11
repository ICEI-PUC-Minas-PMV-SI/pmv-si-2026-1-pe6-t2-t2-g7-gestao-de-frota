import { Global, Module } from '@nestjs/common';
import { AnalyticsRepo } from './analytics/interface';
import { AnalyticsRepoImpl } from './analytics/Analytics.repo';

@Global()
@Module({
  providers: [
    {
      provide: AnalyticsRepo,
      useClass: AnalyticsRepoImpl,
    },
  ],
  exports: [AnalyticsRepo],
})
export class AnalyticsRepoModule {}
