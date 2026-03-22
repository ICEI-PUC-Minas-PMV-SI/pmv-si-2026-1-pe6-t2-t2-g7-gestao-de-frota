import { VehicleModel } from '../../models/Vehicle.model';

export abstract class VehicleRepo {
  abstract create(vehicle: VehicleModel): Promise<VehicleModel>;
  abstract update(vehicle: VehicleModel): Promise<VehicleModel>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<VehicleModel | null>;
  abstract findAll(): Promise<VehicleModel[]>;
}
