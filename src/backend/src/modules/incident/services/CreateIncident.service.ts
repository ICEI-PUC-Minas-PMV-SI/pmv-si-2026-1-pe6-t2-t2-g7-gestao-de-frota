import { Injectable } from '@nestjs/common';
import { IncidentRepo } from '../repositories/incident/interface';
import { IncidentModel, IncidentType } from '../models/Incident.model';

export type CreateIncidentInput = {
  vehicleId: string;
  tipo: IncidentType;
  descricao: string;
  valor?: number;
  data?: Date;
};

@Injectable()
export class CreateIncidentService {
  constructor(private readonly incidentRepo: IncidentRepo) {}

  async exec(input: CreateIncidentInput) {
    const incident = new IncidentModel({
      vehicleId: input.vehicleId,
      tipo: input.tipo,
      descricao: input.descricao,
      valor: input.valor,
      data: input.data,
    });

    return this.incidentRepo.create(incident);
  }
}
