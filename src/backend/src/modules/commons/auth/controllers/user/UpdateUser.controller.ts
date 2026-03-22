import { Body, Controller, HttpCode, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateUserRequestDto } from '../../dtos/user/UpdateRequest.dto';
import { GetUserResponseDto } from '../../dtos/user/GetResponse.dto';
import { UpdateUserService } from '../../services/user/UpdateUser.service';
import { AuthTypes, type IUserContainer } from '../../auth.types';
import { UserContainer } from '../../../utils/getUserContainer';

@ApiBearerAuth(AuthTypes.ID_TOKEN)
@Controller('/account')
export class UpdateUserController {
  constructor(private readonly updateUser: UpdateUserService) {}

  @Patch('/:id')
  @ApiOperation({ summary: 'Atualizar usuário', tags: ['Auth'] })
  @ApiResponse({ status: 201, type: GetUserResponseDto })
  @ApiBody({ type: UpdateUserRequestDto })
  @HttpCode(200)
  async exec(
    @UserContainer() userContainer: IUserContainer,
    @Body() body: UpdateUserRequestDto,
  ): Promise<GetUserResponseDto> {
    const user = await this.updateUser.exec({
      id: userContainer.user.id,
      name: body.name,
    });
    return user.toJSON();
  }
}
