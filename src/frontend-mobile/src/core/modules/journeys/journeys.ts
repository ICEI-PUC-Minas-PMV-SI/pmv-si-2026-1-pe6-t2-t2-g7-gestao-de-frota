import { CompleteJourneyGateway } from "./gateways/CompleteJourney.gateway";
import { CreateJourneyGateway } from "./gateways/CreateJourney.gateway";
import { RecordJourneyPositionGateway } from "./gateways/RecordJourneyPosition.gateway";

export const journeyModule = {
  gateways: {
    create: new CreateJourneyGateway(),
    recordPosition: new RecordJourneyPositionGateway(),
    complete: new CompleteJourneyGateway(),
  },
};
