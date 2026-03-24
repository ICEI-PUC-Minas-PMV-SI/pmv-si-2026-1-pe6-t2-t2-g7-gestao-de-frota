import { adapters } from "@core/adapters/adapters";
import { constants } from "@core/contants";

export type RecordJourneyPositionInput = {
  idToken: string;
  journeyId: string;
  latitude: number;
  longitude: number;
};

export type RecordJourneyPositionResponseBody = {
  id: string;
  latitude: number;
  longitude: number;
  registradaEm: string;
};

export class RecordJourneyPositionGateway {
  async exec(props: RecordJourneyPositionInput) {
    const url = constants.API_BASE;
    return adapters.http.post<RecordJourneyPositionResponseBody>({
      url: `${url}/journey/${props.journeyId}/positions`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
      }),
      body: {
        latitude: props.latitude,
        longitude: props.longitude,
      },
    });
  }
}
