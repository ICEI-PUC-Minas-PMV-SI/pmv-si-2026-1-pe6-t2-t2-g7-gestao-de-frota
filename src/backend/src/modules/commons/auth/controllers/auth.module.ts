import { Module } from '@nestjs/common';
import { FindUserController } from './user/FindUser.controller';
import { DeleteUserController } from './user/DeleteUser.controller';
import { UpdateUserController } from './user/UpdateUser.controller';
import { CreateUserController } from './user/CreateUser.controller';
import { FindUserService } from '../services/FindUser.service';
import { DeleteUserService } from '../services/DeleteUser.service';
import { UpdateUserService } from '../services/UpdateUser.service';
import { CreateUserService } from '../services/CreateUser.service';
import { AuthRepoModule } from '../repositories/authRepo.module';
import { FindAllUsersController } from './user/FindAllUsers.controller';
import { FindAllUsersService } from '../services/FindAllUsers.service';

@Module({
  imports: [AuthRepoModule],
  controllers: [
    FindUserController,
    DeleteUserController,
    UpdateUserController,
    CreateUserController,
    FindAllUsersController,
  ],
  providers: [
    FindUserService,
    DeleteUserService,
    UpdateUserService,
    CreateUserService,
    FindAllUsersService,
  ],
})
export class AuthModule {}
