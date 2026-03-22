import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthTypes, type IUserContainer } from '../../auth.types';
import { UpdateUserRequestDto } from '../../dtos/user/UpdateRequest.dto';
import { GetUserResponseDto } from '../../dtos/user/GetResponse.dto';
import { UserContainer } from 'src/modules/commons/utils/getUserContainer';
import { UpdateUserService } from '../../services/user/UpdateUser.service';

@ApiBearerAuth(AuthTypes.ID_TOKEN)
@Controller('/account')
export class SignupController {
  constructor(private readonly updateUser: UpdateUserService) {}

  @Post('/sync')
  @ApiOperation({ summary: 'Atualizar usuário', tags: ['Auth'] })
  @ApiResponse({ status: 201, type: GetUserResponseDto })
  @ApiBody({ type: UpdateUserRequestDto })
  async exec(
    @UserContainer() userContainer: IUserContainer,
    @Body() body: UpdateUserRequestDto,
  ) {
    const user = await this.updateUser.exec({
      id: userContainer.user.id,
      uid: userContainer.payload.uid,
      name:
        userContainer.payload.name !== 'Not Provided'
          ? userContainer.payload.name
          : body.name, // Se o nome não tiver sido registrado, deve ser sincronizado agora
    });
    return user.toJSON();
  }
}
