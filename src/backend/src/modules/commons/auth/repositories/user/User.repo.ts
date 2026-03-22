import { Inject, Injectable } from '@nestjs/common';
import { typeORMConsts } from 'src/modules/commons/typeorm/consts';
import { DataSource, MoreThan, Not } from 'typeorm';
import { TUserRole, UserModel } from '../../models/User.model';
import {
  IFindUserListProps,
  IFindUserListResultProps,
  UserRepo,
} from './interface';

@Injectable()
export class UserRepoImpl implements UserRepo {
  constructor(
    @Inject(typeORMConsts.databaseProviders)
    private readonly dataSource: DataSource,
  ) {}

  async save(user: UserModel) {
    const userRepo = this.dataSource.getRepository(UserModel);
    await userRepo.upsert(user.toJSON(), { conflictPaths: { email: true } });

    return await userRepo.findOneByOrFail({ email: user.email });
  }

  async update(user: UserModel) {
    const userRepo = this.dataSource.getRepository(UserModel);

    const changes = user.props;
    const values = Object.values(changes);
    if (values.every((value) => value === undefined)) return user;

    if (changes['role'] === 'not_provided')
      Reflect.deleteProperty(changes, 'role');

    Reflect.deleteProperty(changes, 'id');
    Reflect.deleteProperty(changes, 'email');
    Reflect.deleteProperty(changes, 'createdAt');

    await userRepo.update({ id: user.id }, changes);

    return user;
  }

  async delete(id: number) {
    await this.dataSource.getRepository(UserModel).delete({ id });
  }

  async findById(id: number) {
    const result = await this.dataSource
      .getRepository(UserModel)
      .findOneBy({ id });
    return result;
  }

  async findByUid(uid: string) {
    const result = await this.dataSource
      .getRepository(UserModel)
      .findOneBy({ uid });
    return result;
  }

  async findOwners() {
    const result = await this.dataSource
      .getRepository(UserModel)
      .findBy({ role: 'owner' });
    return result;
  }

  async findList({
    limit,
    lastItemId,
  }: IFindUserListProps): Promise<IFindUserListResultProps> {
    const userRepo = this.dataSource.getRepository(UserModel);
    const total = await userRepo.countBy({ id: MoreThan(lastItemId) });
    let result: UserModel[] = [];
    if (lastItemId)
      result = await userRepo.find({
        where: { id: MoreThan(lastItemId) },
        take: limit,
      });
    else
      result = await userRepo.find({
        take: limit,
      });
    return { list: result, total };
  }

  async changeRole(id: number, role: TUserRole) {
    await this.dataSource
      .getRepository(UserModel)
      .update({ id, role: Not('owner') }, { role });
  }
}
