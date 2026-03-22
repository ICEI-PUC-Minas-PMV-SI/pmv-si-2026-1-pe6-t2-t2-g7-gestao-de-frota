import { Controller, Delete, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeleteUserService } from '../../services/user/DeleteUser.service';
import { UserContainer } from '../../../utils/getUserContainer';
import { AuthTypes, type IUserContainer } from '../../auth.types';

@ApiBearerAuth(AuthTypes.ID_TOKEN)
@Controller('/account')
export class DeleteUserController {
  constructor(private readonly deleteUser: DeleteUserService) {}

  @Delete('/:id')
  @ApiOperation({ summary: 'Deletar usuário', tags: ['Auth'] })
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  async exec(@UserContainer() container: IUserContainer): Promise<void> {
    await this.deleteUser.exec({
      id: container.user.id,
      externalUid: container.payload.uid,
    });
  }
}
