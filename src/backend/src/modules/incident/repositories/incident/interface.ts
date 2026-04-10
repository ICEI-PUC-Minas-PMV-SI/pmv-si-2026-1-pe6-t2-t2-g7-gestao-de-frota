import { IncidentModel } from '../../models/Incident.model';

export abstract class IncidentRepo {
  abstract create(incident: IncidentModel): Promise<IncidentModel>;
  abstract update(incident: IncidentModel): Promise<IncidentModel>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<IncidentModel | null>;
  abstract findAll(): Promise<IncidentModel[]>;
  abstract findByVehicleId(vehicleId: string): Promise<IncidentModel[]>;
}
