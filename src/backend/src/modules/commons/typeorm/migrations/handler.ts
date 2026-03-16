import { DataSourceOptions } from 'typeorm';
import { UserModel } from '../../auth/models/User.model';
import { VehicleModel } from '../../../vehicle/models/Vehicle.model';
import { TypeORMService } from '../TypeORM.service';
import { Default1773629122687 } from './1773629122687-default';
import { Default1773677988686 } from './1773677988686-default';
import { Default1773702520121 } from './1773702520121-default';

const config: DataSourceOptions = {
  type: 'cockroachdb',
  timeTravelQueries: false,
  ssl: true,
  url: process.env.DATABASE_URL as string,
  entities: [UserModel, VehicleModel],
  migrations: [
    Default1773629122687,
    Default1773677988686,
    Default1773702520121,
  ],
  synchronize: false,
  migrationsRun: false,
  metadataTableName: 'typeorm_metadata',
  migrationsTableName: 'migration_typeorm',
};

const dataSource = new TypeORMService({ ...config });
export { dataSource };
