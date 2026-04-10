import { Injectable } from '@nestjs/common';
import { IncidentRepo } from '../repositories/incident/interface';
import { IncidentModel } from '../models/Incident.model';

@Injectable()
export class FindIncidentsByVehicleService {
  constructor(private readonly incidentRepo: IncidentRepo) {}

  async exec(vehicleId: string): Promise<IncidentModel[]> {
    return this.incidentRepo.findByVehicleId(vehicleId);
  }
}
