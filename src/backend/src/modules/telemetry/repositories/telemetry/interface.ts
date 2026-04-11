import { TelemetryModel } from '../../models/Telemetry.model';

export abstract class TelemetryRepo {
  abstract create(row: TelemetryModel): Promise<TelemetryModel>;
  abstract findByJourneyId(journeyId: string): Promise<TelemetryModel[]>;
  abstract findLatestByJourneyId(
    journeyId: string,
  ): Promise<TelemetryModel | null>;
}
