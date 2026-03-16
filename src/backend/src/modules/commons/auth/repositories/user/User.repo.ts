import { Inject, Injectable } from '@nestjs/common';
import { typeORMConsts } from 'src/modules/commons/typeorm/consts';
import { DataSource } from 'typeorm';
import { UserModel } from '../../models/User.model';
import { UserRepo } from './interface';

@Injectable()
export class UserRepoImpl implements UserRepo {
  constructor(
    @Inject(typeORMConsts.databaseProviders)
    private readonly dataSource: DataSource,
  ) {}

  async create(user: UserModel) {
    await this.dataSource.getRepository(UserModel).insert(user.toJSON());
    return user;
  }

  async update(user: UserModel) {
    const userRepo = this.dataSource.getRepository(UserModel);

    const changes = user.props;
    const values = Object.values(changes);
    if (values.every((value) => value === undefined)) return user;

    Reflect.deleteProperty(changes, 'id');
    Reflect.deleteProperty(changes, 'email');
    Reflect.deleteProperty(changes, 'createdAt');

    await userRepo.update({ id: user.id }, changes);

    return user;
  }

  async delete(id: string) {
    await this.dataSource.getRepository(UserModel).delete({ id });
  }

  async findById(id: string) {
    const result = await this.dataSource
      .getRepository(UserModel)
      .findOneBy({ id });
    return result;
  }

  async findAll() {
    const result = await this.dataSource.getRepository(UserModel).find();
    return result;
  }
}
