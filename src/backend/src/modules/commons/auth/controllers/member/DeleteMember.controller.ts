import {
  Controller,
  Delete,
  HttpCode,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { DeleteUserService } from '../../services/user/DeleteUser.service';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { GetMemberQueryDto } from '../../dtos/member/request/GetMemberQuery.dto';
import { Roles } from '../../decorator/roles.decorator';
import { PreventOwners } from '../../decorator/owner.decorator';
import { MemberGuard } from '../../guards/MemberGuard';
import { PreventOwnerGuard } from '../../guards/PreventOwner.guard';
import { AuthTypes } from '../../auth.types';
import { FindUserService } from '../../services/user/FindUser.service';
import type { Response } from 'express';

@ApiBearerAuth(AuthTypes.ID_TOKEN)
@Controller()
export class DeleteMemberController {
  constructor(
    private readonly deleteUser: DeleteUserService,
    private readonly findUser: FindUserService,
  ) {}

  @Roles('admin', 'owner')
  @PreventOwners('id')
  @UseGuards(MemberGuard, PreventOwnerGuard)
  @Delete('/member/:id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Remove um membro usando o id',
    tags: ['Membros'],
    description: 'Remove um membro usando o número de identificação do usuário',
  })
  @ApiParam({ name: 'id', required: true })
  async exec(
    @Res({ passthrough: true }) res: Response,
    @Param() param: GetMemberQueryDto,
  ) {
    const member = await this.findUser.findById(param.id);
    if (!member) return res.status(404).end();

    await this.deleteUser.exec({
      id: param.id,
      externalUid: member.uid,
    });
  }
}
