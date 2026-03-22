import { Module } from '@nestjs/common';
import { AuthModule } from './modules/commons/auth/auth.module';
import { VehicleModule } from './modules/vehicle/controllers/vehicle.module';
import { TypeORModule } from './modules/commons/typeorm/TypORM.module';
import { VerifyTokenService } from './modules/commons/auth/services/user/VerifyToken.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/commons/auth/guards/Auth.guard';
import { FirebaseModule } from './modules/commons/firebase/firebase.module';
import { FindUserService } from './modules/commons/auth/services/user/FindUser.service';

@Module({
  imports: [FirebaseModule, TypeORModule, AuthModule, VehicleModule],
  providers: [
    VerifyTokenService,
    FindUserService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
