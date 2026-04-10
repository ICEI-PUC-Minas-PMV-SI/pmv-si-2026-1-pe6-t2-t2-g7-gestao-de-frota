import { Injectable } from '@nestjs/common';
import { IncidentRepo } from '../repositories/incident/interface';

@Injectable()
export class DeleteIncidentService {
  constructor(private readonly incidentRepo: IncidentRepo) {}

  async exec(id: string) {
    return this.incidentRepo.delete(id);
  }
}
