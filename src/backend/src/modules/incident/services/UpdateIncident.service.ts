import { Injectable, NotFoundException } from '@nestjs/common';
import { IncidentRepo } from '../repositories/incident/interface';
import {
  IncidentModel,
  IncidentModelUpdateInput,
} from '../models/Incident.model';

@Injectable()
export class UpdateIncidentService {
  constructor(private readonly incidentRepo: IncidentRepo) {}

  async exec(input: IncidentModelUpdateInput) {
    const existing = await this.incidentRepo.findById(input.id);
    if (!existing) {
      throw new NotFoundException('Incidente não encontrado.');
    }

    const merged = {
      ...existing.toJSON(),
      ...input,
      data: input.data ?? existing.data,
    };

    return this.incidentRepo.update(new IncidentModel(merged));
  }
}
