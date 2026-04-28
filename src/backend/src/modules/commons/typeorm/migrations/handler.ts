import { DataSourceOptions } from 'typeorm';
import { UserModel } from '../../auth/models/User.model';
import { TypeORMService } from '../TypeORM.service';
import fs from 'fs';
import { VehicleModel } from '../../../../modules/vehicle/models/Vehicle.model';
import { JourneyModel } from '../../../../modules/journey/models/Journey.model';
import { JourneyStopModel } from '../../../../modules/journey/models/JourneyStop.model';
import { JourneyPositionModel } from '../../../../modules/journey/models/JourneyPosition.model';
import { IncidentModel } from '../../../../modules/incident/models/Incident.model';
import { TelemetryModel } from '../../../../modules/telemetry/models/Telemetry.model';
import { Default1777378570930 } from './1777378570930-default';
import { Default1777379041197 } from './1777379041197-default';
import { Default1777381505441 } from './1777381505441-default';
import { Default1777384691511 } from './1777384691511-default';

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
    TelemetryModel,
    IncidentModel,
  ],
  migrations: [
    Default1777378570930,
    Default1777379041197,
    Default1777381505441,
    Default1777384691511,
  ],
  synchronize: false,
  migrationsRun: false,
  metadataTableName: 'typeorm_metadata',
  migrationsTableName: 'migration_typeorm',
};

const dataSource = new TypeORMService({ ...config });
export { dataSource };
