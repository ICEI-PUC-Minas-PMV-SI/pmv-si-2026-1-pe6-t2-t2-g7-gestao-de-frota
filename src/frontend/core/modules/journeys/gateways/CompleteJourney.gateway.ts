import { adapters } from "@core/adapters/adapters";
import { constants } from "@core/contants";

export type CompleteJourneyInput = {
  idToken: string;
  journeyId: string;
};

export type CompleteJourneyResponseBody = {
  id: string;
  userId: number;
  vehicleId: string;
  nome?: string;
  status: string;
  kmRodados: number;
  combustivelGasto: number;
  nivelCombustivel: number;
  iniciadaEm: string;
  criadaEm: string;
  atualizadaEm: string;
};

export class CompleteJourneyGateway {
  async exec(props: CompleteJourneyInput) {
    const url = constants.API_BASE;
    return adapters.http.patch<CompleteJourneyResponseBody>({
      url: `${url}/journey/${props.journeyId}/complete`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
      }),
      body: {},
    });
  }
}
