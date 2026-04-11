import { Global, Module } from '@nestjs/common';
import { TelemetryRepo } from './telemetry/interface';
import { TelemetryRepoImpl } from './telemetry/Telemetry.repo';

@Global()
@Module({
  providers: [
    {
      provide: TelemetryRepo,
      useClass: TelemetryRepoImpl,
    },
  ],
  exports: [TelemetryRepo],
})
export class TelemetryRepoModule {}
