import { adapters } from "@core/adapters/adapters";
import { constants } from "@core/contants";

export type CreateJourneyParadaInput = {
  ordem: number;
  latitude: number;
  longitude: number;
};

export type CreateJourneyInput = {
  idToken: string;
  nome?: string;
  paradas: CreateJourneyParadaInput[];
};

export type CreateJourneyResponseBody = {
  id: string;
  userId: number;
  nome?: string;
  status: string;
  iniciadaEm: string;
  paradas: {
    id: string;
    ordem: number;
    latitude: number;
    longitude: number;
  }[];
  criadaEm: string;
  atualizadaEm: string;
};

export class CreateJourneyGateway {
  async exec(props: CreateJourneyInput) {
    const url = constants.API_BASE;
    return adapters.http.post<CreateJourneyResponseBody>({
      url: `${url}/journey`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
      }),
      body: {
        nome: props.nome,
        paradas: props.paradas,
      },
    });
  }
}
