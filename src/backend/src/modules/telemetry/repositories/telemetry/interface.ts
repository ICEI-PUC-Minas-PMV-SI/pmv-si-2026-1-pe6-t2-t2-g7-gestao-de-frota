import { TelemetryModel } from '../../models/Telemetry.model';

export abstract class TelemetryRepo {
  abstract create(row: TelemetryModel): Promise<TelemetryModel>;
  abstract update(row: TelemetryModel): Promise<TelemetryModel>;
  abstract findByVehicleId(vehicleId: string): Promise<TelemetryModel[]>;
  abstract findLatestByVehicleId(
    vehicleId: string,
  ): Promise<TelemetryModel | null>;
}
