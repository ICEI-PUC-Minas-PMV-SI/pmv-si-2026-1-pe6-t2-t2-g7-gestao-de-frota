import { DataSourceOptions } from 'typeorm';
import { UserModel } from '../auth/models/User.model';
import { TypeORMService } from './TypeORM.service';
import { typeORMConsts } from './consts';
import { Default1773629122687 } from './migrations/1773629122687-default';
import { VehicleModel } from '../../vehicle/models/Vehicle.model';

export const getDataSource = async () => {
  const NODE_ENV = String(process.env.NODE_ENV);
  const DATABASE_URL = String(process.env.DATABASE_URL);

  const defaultOptions: DataSourceOptions = {
    logger: NODE_ENV !== 'production' ? 'simple-console' : 'advanced-console',
    type: 'cockroachdb',
    timeTravelQueries: false,
    url: DATABASE_URL,
    ssl: true,
    entities: [UserModel, VehicleModel],
    migrations: [Default1773629122687],
    cache: {
      type: 'database',
      tableName: 'typeorm_cache',
    },
    synchronize: false,
  };

  return new TypeORMService(defaultOptions).initialize();
};

export const databaseProviders = [
  {
    provide: typeORMConsts.databaseProviders,
    useFactory: () => {
      return getDataSource();
    },
  },
];
