import { Injectable } from '@nestjs/common';
import { IncidentRepo } from '../repositories/incident/interface';
import { IncidentModel } from '../models/Incident.model';

@Injectable()
export class FindAllIncidentsService {
  constructor(private readonly incidentRepo: IncidentRepo) {}

  async exec(): Promise<IncidentModel[]> {
    return this.incidentRepo.findAll();
  }
}
