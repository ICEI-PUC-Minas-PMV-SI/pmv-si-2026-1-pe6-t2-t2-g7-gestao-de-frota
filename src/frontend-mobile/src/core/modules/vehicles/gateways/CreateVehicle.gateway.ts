import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";
import { Vehicle } from "../types";

export type CreateVehicleInput = {
  idToken: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  fotoUrl: string;
  tamanhoTanque: number;
  consumoMedio: number;
};

export class CreateVehicleGateway {
  async exec(props: CreateVehicleInput) {
    const url = constants.API_BASE;
    return adapters.http.post<Vehicle>({
      url: `${url}/vehicle`,
      headers: new Headers({
        Authorization: `Bearer ${props.idToken}`,
        "Content-Type": "application/json",
      }),
      body: {
        marca: props.marca,
        modelo: props.modelo,
        ano: props.ano,
        placa: props.placa,
        fotoUrl: props.fotoUrl,
        tamanhoTanque: props.tamanhoTanque,
        consumoMedio: props.consumoMedio,
      },
    });
  }
}
