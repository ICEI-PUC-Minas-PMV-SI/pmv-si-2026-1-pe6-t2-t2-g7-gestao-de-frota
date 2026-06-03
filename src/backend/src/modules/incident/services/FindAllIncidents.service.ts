import { Injectable } from '@nestjs/common';
import { IncidentRepo } from '../repositories/incident/interface';
import { IncidentModel } from '../models/Incident.model';
import { VehicleRepo } from '../../vehicle/repositories/vehicle/interface';

@Injectable()
export class FindAllIncidentsService {
  constructor(
    private readonly incidentRepo: IncidentRepo,
    private readonly vehicleRepo: VehicleRepo,
  ) {}

  async exec(userId: number): Promise<IncidentModel[]> {
    const vehicles = await this.vehicleRepo.findAllByUserId(userId);
    if (vehicles.length === 0) return [];
    const incidents = await Promise.all(
      vehicles.map((vehicle) => this.incidentRepo.findByVehicleId(vehicle.id)),
    );
    return incidents.flat();
  }
}
