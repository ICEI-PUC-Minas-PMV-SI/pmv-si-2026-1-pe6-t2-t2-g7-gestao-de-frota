import { adapters } from "@core/adapters/adapters";
import { constants } from "@core/contants";

export type LatestJourneyPositionBody = {
  temPosicao: boolean;
  latitude?: number;
  longitude?: number;
  registradaEm?: string;
};

export class GetLatestJourneyPositionGateway {
  async exec(props: { idToken: string; journeyId: string }) {
    const url = constants.API_BASE;
    return adapters.http.get<LatestJourneyPositionBody>({
      url: `${url}/journey/${props.journeyId}/positions/latest`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
      }),
    });
  }
}
