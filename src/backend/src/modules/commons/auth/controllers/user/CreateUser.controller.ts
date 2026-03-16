import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateUserService } from '../../services/CreateUser.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserRequestDto } from '../../dtos/user/CreateRequest.dto';
import { TUserProviderType } from '../../models/User.model';
import { GetUserResponseDto } from '../../dtos/user/GetResponse.dto';

@Controller()
export class CreateUserController {
  constructor(private readonly createUser: CreateUserService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um usuário', tags: ['Auth'] })
  @ApiResponse({ status: 201, type: GetUserResponseDto })
  @ApiBody({ type: CreateUserRequestDto })
  @HttpCode(201)
  async exec(@Body() body: CreateUserRequestDto): Promise<GetUserResponseDto> {
    const user = await this.createUser.exec({
      email: body.email,
      provider: body.provider as TUserProviderType,
    });
    return user.toJSON();
  }
}
