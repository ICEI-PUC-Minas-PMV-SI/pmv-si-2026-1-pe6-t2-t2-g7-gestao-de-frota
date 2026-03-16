import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FindAllUsersService } from '../../services/FindAllUsers.service';
import { GetUserResponseDto } from '../../dtos/user/GetResponse.dto';

@Controller('user')
export class FindAllUsersController {
  constructor(private readonly findAllUsers: FindAllUsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários', tags: ['Auth'] })
  @ApiResponse({ status: 200, type: GetUserResponseDto, isArray: true })
  @HttpCode(200)
  async exec(): Promise<GetUserResponseDto[]> {
    const users = await this.findAllUsers.exec();
    return users.map((user) => user.toJSON());
  }
}
