import { adapters } from "../../../adapters/adapters";
import { constants } from "../../../constants";
import { Vehicle } from "../types";

export type UpdateVehicleInput = {
  idToken: string;
  vehicleId: string;
  marca?: string;
  modelo?: string;
  ano?: number;
  placa?: string;
  fotoUrl?: string;
  tamanhoTanque?: number;
  consumoMedio?: number;
};

export class UpdateVehicleGateway {
  async exec(props: UpdateVehicleInput) {
    const url = constants.API_BASE;
    const { idToken, vehicleId, ...body } = props;
    return adapters.http.patch<Vehicle>({
      url: `${url}/vehicle/${vehicleId}`,
      headers: new Headers({
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      }),
      body,
    });
  }
}
