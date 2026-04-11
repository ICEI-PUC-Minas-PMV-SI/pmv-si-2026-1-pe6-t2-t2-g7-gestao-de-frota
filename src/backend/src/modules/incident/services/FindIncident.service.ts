import { Injectable } from '@nestjs/common';
import { IncidentRepo } from '../repositories/incident/interface';
import { IncidentModel } from '../models/Incident.model';

@Injectable()
export class FindIncidentService {
  constructor(private readonly incidentRepo: IncidentRepo) {}

  async exec(id: string): Promise<IncidentModel | null> {
    return this.incidentRepo.findById(id);
  }
}
