import { DataSourceOptions } from 'typeorm';
import { UserModel } from '../../auth/models/User.model';
import { TypeORMService } from '../TypeORM.service';
import { Default1773629122687 } from './1773629122687-default';
import { Default1773678670182 } from './1773678670182-default';

const config: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL as string,
  entities: [UserModel],
  migrations: [Default1773629122687, Default1773678670182],
  synchronize: false,
  migrationsRun: false,
  metadataTableName: 'typeorm_metadata',
  migrationsTableName: 'migration_typeorm',
};

const dataSource = new TypeORMService({ ...config });
export { dataSource };
