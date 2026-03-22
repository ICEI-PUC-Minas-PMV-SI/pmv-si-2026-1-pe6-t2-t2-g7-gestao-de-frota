import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthTypes } from '../../auth.types';
import { FindUserService } from '../../services/user/FindUser.service';
import { GetUserResponseDto } from '../../dtos/user/GetResponse.dto';
import { GetMemberQueryDto } from '../../dtos/member/request/GetMemberQuery.dto';

@ApiBearerAuth(AuthTypes.ID_TOKEN)
@Controller()
export class GetMemberController {
  constructor(private readonly findUser: FindUserService) {}

  @Get('/member/:id')
  @ApiOperation({
    summary: 'Retorna um membro usando o id',
    tags: ['Membros'],
    description:
      'Retorna um membro usando o número de identificação do usuário',
  })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, type: GetUserResponseDto })
  async exec(@Param() param: GetMemberQueryDto) {
    const result = await this.findUser.findById(param.id);
    return result ?? undefined;
  }
}
