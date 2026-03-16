import { DataSourceOptions } from 'typeorm';
import { UserModel } from '../../auth/models/User.model';
import { TypeORMService } from '../TypeORM.service';
import { Default1773629122687 } from './1773629122687-default';

const config: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL as string,
  entities: [UserModel],
  migrations: [Default1773629122687],
  synchronize: false,
  migrationsRun: false,
  metadataTableName: 'typeorm_metadata',
  migrationsTableName: 'migration_typeorm',
};

const dataSource = new TypeORMService({ ...config });
export { dataSource };
