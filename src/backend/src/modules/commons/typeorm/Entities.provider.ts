import { UserModel } from '../auth/models/User.model';
import { typeORMConsts } from './consts';
import { TypeORMService } from './TypeORM.service';

export const typeORMEntitiesProviders = [
  {
    provide: typeORMConsts.entity.user,
    useFactory: (dataSource: TypeORMService) =>
      dataSource.getRepository(UserModel),
    inject: [typeORMConsts.databaseProviders],
  },
];
