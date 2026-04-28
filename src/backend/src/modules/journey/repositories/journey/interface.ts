import { JourneyModel } from '../../models/Journey.model';
import { JourneyStopModel } from '../../models/JourneyStop.model';

export abstract class JourneyRepo {
  abstract createWithStops(
    journey: JourneyModel,
    stops: JourneyStopModel[],
  ): Promise<{ journey: JourneyModel; stops: JourneyStopModel[] }>;

  abstract findByIdForUser(
    id: string,
    userId: number,
  ): Promise<JourneyModel | null>;

  abstract update(journey: JourneyModel): Promise<JourneyModel>;

  abstract findByVehicleId(vehicleId: string): Promise<JourneyModel[]>;

  abstract findStopsByJourneyId(journeyId: string): Promise<JourneyStopModel[]>;
}
