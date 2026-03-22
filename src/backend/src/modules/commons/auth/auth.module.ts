import { Module } from '@nestjs/common';
import { DeleteUserController } from './controllers/user/DeleteUser.controller';
import { UpdateUserController } from './controllers/user/UpdateUser.controller';
import { DeleteUserService } from './services/user/DeleteUser.service';
import { UpdateUserService } from './services/user/UpdateUser.service';
import { AuthRepoModule } from './repositories/authRepo.module';
import { SignupController } from './controllers/user/Signup.controller';
import { GetMemberListService } from './services/member/GetMemberList.service';
import { GetMemberController } from './controllers/member/GetMember.controller';
import { ChangeMemberRoleController } from './controllers/member/ChangeMemberRole.controller';
import { ListMemberController } from './controllers/member/ListMembers.controller';
import { DeleteMemberController } from './controllers/member/DeleteMember.controller';
import { SaveUserService } from './services/user/SaveUser.service';
import { VerifyTokenService } from './services/user/VerifyToken.service';
import { AuthGuard } from './guards/Auth.guard';
import { PreventOwnerGuard } from './guards/PreventOwner.guard';
import { MemberGuard } from './guards/MemberGuard';
import { FindOwnersService } from './services/member/FindOwners.service';
import { FindUserService } from './services/user/FindUser.service';

@Module({
  imports: [AuthRepoModule],
  controllers: [
    DeleteUserController,
    UpdateUserController,
    SignupController,
    GetMemberController,
    ChangeMemberRoleController,
    ListMemberController,
    DeleteMemberController,
  ],
  providers: [
    AuthGuard,
    PreventOwnerGuard,
    MemberGuard,
    DeleteUserService,
    UpdateUserService,
    GetMemberListService,
    SaveUserService,
    FindOwnersService,
    FindUserService,
    VerifyTokenService,
  ],
  exports: [
    PreventOwnerGuard,
    MemberGuard,
    AuthGuard,
    SaveUserService,
    VerifyTokenService,
  ],
})
export class AuthModule {}
