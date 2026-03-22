import { Global, Module } from '@nestjs/common';
import { VehicleRepo } from './vehicle/interface';
import { VehicleRepoImpl } from './vehicle/Vehicle.repo';

@Global()
@Module({
  providers: [
    {
      provide: VehicleRepo,
      useClass: VehicleRepoImpl,
    },
  ],
  exports: [VehicleRepo],
})
export class VehicleRepoModule {}
