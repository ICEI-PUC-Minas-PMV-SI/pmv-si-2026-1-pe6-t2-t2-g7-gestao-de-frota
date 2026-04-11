import { Global, Module } from '@nestjs/common';
import { IncidentRepo } from './incident/interface';
import { IncidentRepoImpl } from './incident/Incident.repo';

@Global()
@Module({
  providers: [
    {
      provide: IncidentRepo,
      useClass: IncidentRepoImpl,
    },
  ],
  exports: [IncidentRepo],
})
export class IncidentRepoModule {}
