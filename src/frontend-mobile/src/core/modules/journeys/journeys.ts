import { CompleteJourneyGateway } from "./gateways/CompleteJourney.gateway";
import { CreateJourneyGateway } from "./gateways/CreateJourney.gateway";
import { ListVehicleJourneysGateway } from "./gateways/ListVehicleJourneys.gateway";
import { RecordJourneyPositionGateway } from "./gateways/RecordJourneyPosition.gateway";

export const journeyModule = {
  gateways: {
    create: new CreateJourneyGateway(),
    recordPosition: new RecordJourneyPositionGateway(),
    complete: new CompleteJourneyGateway(),
    listVehicleJourneys: new ListVehicleJourneysGateway(),
  },
};

export type {
  JourneyHistory,
  JourneyHistoryStatus,
  JourneyStats,
} from "./types";
