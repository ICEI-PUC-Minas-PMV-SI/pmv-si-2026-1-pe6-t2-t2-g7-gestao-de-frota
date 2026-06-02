import { Injectable, NotFoundException } from '@nestjs/common';
import { IncidentRepo } from '../repositories/incident/interface';
import { IncidentModel } from '../models/Incident.model';
import { VehicleRepo } from '../../vehicle/repositories/vehicle/interface';

@Injectable()
export class FindIncidentsByVehicleService {
  constructor(
    private readonly incidentRepo: IncidentRepo,
    private readonly vehicleRepo: VehicleRepo,
  ) {}

  async exec(vehicleId: string, userId: number): Promise<IncidentModel[]> {
    const vehicle = await this.vehicleRepo.findByIdForUser(vehicleId, userId);
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado.');
    }
    return this.incidentRepo.findByVehicleId(vehicleId);
  }
}
