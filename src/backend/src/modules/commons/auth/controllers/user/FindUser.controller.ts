import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { FindUserService } from '../../services/FindUser.service';
import { GetUserResponseDto } from '../../dtos/user/GetResponse.dto';

@Controller()
export class FindUserController {
  constructor(private readonly findUser: FindUserService) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Pesquisar um usuário', tags: ['Auth'] })
  @ApiResponse({ status: 204 })
  @ApiParam({ name: 'id', required: true })
  @HttpCode(200)
  async exec(@Param('id') id: string): Promise<GetUserResponseDto | undefined> {
    const user = await this.findUser.exec(id);
    return user?.toJSON();
  }
}
