import { Module } from '@nestjs/common';
import { AuthModule } from './modules/commons/auth/controllers/auth.module';
import { TypeORModule } from './modules/commons/typeorm/TypORM.module';

@Module({
  imports: [TypeORModule, AuthModule],
})
export class AppModule {}
