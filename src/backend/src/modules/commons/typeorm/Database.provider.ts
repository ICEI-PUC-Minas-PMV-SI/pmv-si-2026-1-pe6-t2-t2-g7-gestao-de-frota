import { DataSourceOptions } from 'typeorm';
import { UserModel } from '../auth/models/User.model';
import { TypeORMService } from './TypeORM.service';
import { typeORMConsts } from './consts';
import fs from 'fs';
import { VehicleModel } from 'src/modules/vehicle/models/Vehicle.model';
import { JourneyModel } from 'src/modules/journey/models/Journey.model';
import { JourneyStopModel } from 'src/modules/journey/models/JourneyStop.model';
import { JourneyPositionModel } from 'src/modules/journey/models/JourneyPosition.model';

export const getDataSource = async () => {
  const NODE_ENV = String(process.env.NODE_ENV);
  const DATABASE_URL = String(process.env.DATABASE_URL);

  const defaultOptions: DataSourceOptions = {
    logger: NODE_ENV !== 'production' ? 'simple-console' : 'advanced-console',
    type: 'cockroachdb',
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync(process.env.DB_SSL_CERT_PATH as string).toString(),
    },
    timeTravelQueries: false,
    url: DATABASE_URL,
    entities: [
      UserModel,
      VehicleModel,
      JourneyModel,
      JourneyStopModel,
      JourneyPositionModel,
    ],
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
