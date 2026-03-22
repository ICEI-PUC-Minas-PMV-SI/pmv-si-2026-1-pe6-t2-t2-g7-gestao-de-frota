import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ListMembersResponseDto } from '../../dtos/member/response/ListMembersResponse.dto';
import { ListMemberQueryDto } from '../../dtos/member/request/ListMemberQuery.dto';
import { GetMemberListService } from '../../services/member/GetMemberList.service';
import { AuthTypes } from '../../auth.types';

@ApiBearerAuth(AuthTypes.ID_TOKEN)
@Controller()
export class ListMemberController {
  constructor(private readonly getMemberList: GetMemberListService) {}

  @Get('/members')
  @ApiOperation({
    summary: 'Lista todos os membros registrados',
    tags: ['Membros'],
  })
  @ApiQuery({
    name: 'limit',
    required: true,
    description: 'Indica a largura da lista a ser retornada',
    example: 10,
  })
  @ApiQuery({
    name: 'last-item-id',
    required: false,
    description:
      'Referência o último id retornado da lista (usado para paginação)',
  })
  @ApiResponse({ status: 200, type: ListMembersResponseDto })
  async exec(@Query() query: ListMemberQueryDto) {
    const result = await this.getMemberList.exec({
      limit: query.limit,
      lastItemId: query?.['last-item-id'],
    });
    return result;
  }
}
