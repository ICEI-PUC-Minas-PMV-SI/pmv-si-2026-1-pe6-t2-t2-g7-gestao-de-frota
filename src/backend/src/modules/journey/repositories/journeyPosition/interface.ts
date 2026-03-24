import { JourneyPositionModel } from '../../models/JourneyPosition.model';

export abstract class JourneyPositionRepo {
  abstract create(row: JourneyPositionModel): Promise<JourneyPositionModel>;
  abstract findLatestByJourneyId(
    journeyId: string,
  ): Promise<JourneyPositionModel | null>;
}
