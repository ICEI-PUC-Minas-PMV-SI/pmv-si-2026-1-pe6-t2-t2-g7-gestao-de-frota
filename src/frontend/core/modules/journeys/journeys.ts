import { CreateJourneyGateway } from "./gateways/CreateJourney.gateway";
import { RecordJourneyPositionGateway } from "./gateways/RecordJourneyPosition.gateway";
import { GetLatestJourneyPositionGateway } from "./gateways/GetLatestJourneyPosition.gateway";
import { CompleteJourneyGateway } from "./gateways/CompleteJourney.gateway";

export const journeyModule = {
  gateways: {
    create: new CreateJourneyGateway(),
    recordPosition: new RecordJourneyPositionGateway(),
    getLatestPosition: new GetLatestJourneyPositionGateway(),
    complete: new CompleteJourneyGateway(),
  },
};