import { Body, Controller, HttpCode, Param, Patch } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateUserRequestDto } from '../../dtos/user/CreateRequest.dto';
import { TUserProviderType } from '../../models/User.model';
import { GetUserResponseDto } from '../../dtos/user/GetResponse.dto';
import { UpdateUserService } from '../../services/UpdateUser.service';

@Controller('user')
export class UpdateUserController {
  constructor(private readonly updateUser: UpdateUserService) {}

  @Patch('/:id')
  @ApiOperation({ summary: 'Atualizar um usuário', tags: ['Auth'] })
  @ApiResponse({ status: 201, type: GetUserResponseDto })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ type: CreateUserRequestDto })
  @HttpCode(200)
  async exec(
    @Body() body: CreateUserRequestDto,
    @Param('id') id: string,
  ): Promise<GetUserResponseDto> {
    const user = await this.updateUser.exec({
      id,
      email: body.email,
      provider: body.provider as TUserProviderType,
    });
    return user.toJSON();
  }
}
