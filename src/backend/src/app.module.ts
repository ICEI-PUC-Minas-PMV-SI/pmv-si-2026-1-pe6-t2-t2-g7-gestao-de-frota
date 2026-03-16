import { Module } from '@nestjs/common';
import { AuthModule } from './modules/commons/auth/controllers/auth.module';
import { VehicleModule } from './modules/vehicle/controllers/vehicle.module';
import { TypeORModule } from './modules/commons/typeorm/TypORM.module';

@Module({
  imports: [TypeORModule, AuthModule, VehicleModule],
})
export class AppModule {}
