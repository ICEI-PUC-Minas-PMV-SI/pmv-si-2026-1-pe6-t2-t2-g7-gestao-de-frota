import { Global, Module } from '@nestjs/common';
import { UserRepo } from './user/interface';
import { UserRepoImpl } from './user/User.repo';

@Global()
@Module({
  providers: [
    {
      provide: UserRepo,
      useClass: UserRepoImpl,
    },
  ],
  exports: [UserRepo],
})
export class AuthRepoModule {}
