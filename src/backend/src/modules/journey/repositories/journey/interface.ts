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
}
