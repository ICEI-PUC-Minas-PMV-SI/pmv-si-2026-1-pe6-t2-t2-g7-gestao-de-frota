import { Injectable, NotFoundException } from '@nestjs/common';
import { IncidentRepo } from '../repositories/incident/interface';
import {
  IncidentModel,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from '../models/Incident.model';
import { VehicleRepo } from '../../vehicle/repositories/vehicle/interface';

export type CreateIncidentInput = {
  vehicleId: string;
  tipo: IncidentType;
  status: IncidentStatus;
  severidade: IncidentSeverity;
  descricao: string;
  codigoInfracao?: string;
  valor?: number;
  localInfracao?: string;
  natureza?: string;
  local?: string;
  data?: Date;
};

@Injectable()
export class CreateIncidentService {
  constructor(
    private readonly incidentRepo: IncidentRepo,
    private readonly vehicleRepo: VehicleRepo,
  ) {}

  async exec(input: CreateIncidentInput, userId: number) {
    const vehicle = await this.vehicleRepo.findByIdForUser(
      input.vehicleId,
      userId,
    );
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado.');
    }

    const incident = new IncidentModel({
      vehicleId: input.vehicleId,
      tipo: input.tipo,
      status: input.status,
      severidade: input.severidade,
      descricao: input.descricao,
      codigoInfracao: input.codigoInfracao,
      valor: input.valor,
      localInfracao: input.localInfracao,
      natureza: input.natureza,
      local: input.local,
      data: input.data,
    });

    return this.incidentRepo.create(incident);
  }
}
