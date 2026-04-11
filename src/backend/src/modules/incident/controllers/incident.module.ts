import { Module } from '@nestjs/common';
import { IncidentRepoModule } from '../repositories/incidentRepo.module';
import { CreateIncidentService } from '../services/CreateIncident.service';
import { FindIncidentService } from '../services/FindIncident.service';
import { FindAllIncidentsService } from '../services/FindAllIncidents.service';
import { FindIncidentsByVehicleService } from '../services/FindIncidentsByVehicle.service';
import { UpdateIncidentService } from '../services/UpdateIncident.service';
import { DeleteIncidentService } from '../services/DeleteIncident.service';
import { CreateIncidentController } from './incident/CreateIncident.controller';
import { FindIncidentController } from './incident/FindIncident.controller';
import { FindAllIncidentsController } from './incident/FindAllIncidents.controller';
import { FindIncidentsByVehicleController } from './incident/FindIncidentsByVehicle.controller';
import { UpdateIncidentController } from './incident/UpdateIncident.controller';
import { DeleteIncidentController } from './incident/DeleteIncident.controller';

@Module({
  imports: [IncidentRepoModule],
  controllers: [
    CreateIncidentController,
    FindIncidentController,
    FindAllIncidentsController,
    FindIncidentsByVehicleController,
    UpdateIncidentController,
    DeleteIncidentController,
  ],
  providers: [
    CreateIncidentService,
    FindIncidentService,
    FindAllIncidentsService,
    FindIncidentsByVehicleService,
    UpdateIncidentService,
    DeleteIncidentService,
  ],
})
export class IncidentModule {}
