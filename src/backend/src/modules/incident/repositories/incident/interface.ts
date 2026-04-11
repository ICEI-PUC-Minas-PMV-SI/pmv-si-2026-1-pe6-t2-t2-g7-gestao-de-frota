import { IncidentModel } from '../../models/Incident.model';

export abstract class IncidentRepo {
  abstract create(this: void, incident: IncidentModel): Promise<IncidentModel>;
  abstract update(this: void, incident: IncidentModel): Promise<IncidentModel>;
  abstract delete(this: void, id: string): Promise<void>;
  abstract findById(this: void, id: string): Promise<IncidentModel | null>;
  abstract findAll(this: void): Promise<IncidentModel[]>;
  abstract findByVehicleId(
    this: void,
    vehicleId: string,
  ): Promise<IncidentModel[]>;
}
