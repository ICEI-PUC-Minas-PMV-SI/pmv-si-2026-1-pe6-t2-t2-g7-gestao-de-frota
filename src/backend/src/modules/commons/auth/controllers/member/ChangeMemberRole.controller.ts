import {
  Controller,
  HttpCode,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MemberGuard } from '../../guards/MemberGuard';
import { Roles } from '../../decorator/roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { GetUserResponseDto } from '../../dtos/user/GetResponse.dto';
import { UpdateUserService } from '../../services/user/UpdateUser.service';
import { ChangeMemberRolesQueryDto } from '../../dtos/member/request/ChangeMemberRoleQuery.dto';
import { TUserRole } from '../../models/User.model';
import { PreventOwners } from '../../decorator/owner.decorator';
import { PreventOwnerGuard } from '../../guards/PreventOwner.guard';
import { AuthTypes } from '../../auth.types';
import { GetMemberQueryDto } from '../../dtos/member/request/GetMemberQuery.dto';

@ApiBearerAuth(AuthTypes.ID_TOKEN)
@Controller('/member')
export class ChangeMemberRoleController {
  constructor(private readonly updateUser: UpdateUserService) {}

  @PreventOwners('id')
  @Roles('admin', 'owner')
  @UseGuards(MemberGuard, PreventOwnerGuard)
  @Patch('/:id')
  @ApiOperation({
    summary: 'Atualizar o cargo de um usuário',
    tags: ['Membros'],
  })
  @ApiParam({ name: 'id', required: true })
  @ApiQuery({
    name: 'role',
    required: true,
    description: "Defini os cargos do usuário, sendo eles: 'admin' ou 'user'",
    example: 'admin',
  })
  @ApiResponse({ status: 200, type: GetUserResponseDto })
  @HttpCode(200)
  @Roles('admin', 'owner')
  async exec(
    @Param() param: GetMemberQueryDto,
    @Query() query: ChangeMemberRolesQueryDto,
  ) {
    const user = await this.updateUser.exec({
      id: param.id,
      role: query.role as TUserRole,
    });
    return user;
  }
}
