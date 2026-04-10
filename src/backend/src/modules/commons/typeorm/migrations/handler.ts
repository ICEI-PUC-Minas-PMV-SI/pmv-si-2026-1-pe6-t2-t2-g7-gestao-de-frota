import { DataSourceOptions } from 'typeorm';
import { UserModel } from '../../auth/models/User.model';
import { TypeORMService } from '../TypeORM.service';
import fs from 'fs';
import { VehicleModel } from '../../../../modules/vehicle/models/Vehicle.model';
import { JourneyModel } from '../../../../modules/journey/models/Journey.model';
import { JourneyStopModel } from '../../../../modules/journey/models/JourneyStop.model';
import { JourneyPositionModel } from '../../../../modules/journey/models/JourneyPosition.model';
import { IncidentModel } from '../../../../modules/incident/models/Incident.model';
import { Default1774375949914 } from './1774375949914-default';
import { AddIncidents1774375949915 } from './1774375949915-add-incidents';

const config: DataSourceOptions = {
  type: 'cockroachdb',
  timeTravelQueries: false,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(process.env.DB_SSL_CERT_PATH as string).toString(),
  },
  url: process.env.DATABASE_URL as string,
  entities: [
    UserModel,
    VehicleModel,
    JourneyModel,
    JourneyStopModel,
    JourneyPositionModel,
    IncidentModel,
  ],
  migrations: [Default1774375949914, AddIncidents1774375949915],
  synchronize: false,
  migrationsRun: false,
  metadataTableName: 'typeorm_metadata',
  migrationsTableName: 'migration_typeorm',
};

const dataSource = new TypeORMService({ ...config });
export { dataSource };
