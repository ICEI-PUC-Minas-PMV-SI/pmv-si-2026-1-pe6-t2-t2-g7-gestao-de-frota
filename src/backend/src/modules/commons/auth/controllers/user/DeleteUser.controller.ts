import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { DeleteUserService } from '../../services/DeleteUser.service';

@Controller('user')
export class DeleteUserController {
  constructor(private readonly deleteUser: DeleteUserService) {}

  @Delete('/:id')
  @ApiOperation({ summary: 'Deletar um usuário', tags: ['Auth'] })
  @ApiResponse({ status: 204 })
  @ApiParam({ name: 'id', required: true })
  @HttpCode(204)
  async exec(@Param('id') id: string): Promise<void> {
    await this.deleteUser.exec(id);
  }
}
