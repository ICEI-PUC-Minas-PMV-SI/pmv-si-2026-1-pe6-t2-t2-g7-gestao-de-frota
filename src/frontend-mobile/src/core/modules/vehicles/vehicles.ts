import { GetVehicleGateway } from "./gateways/GetVehicle.gateway";
import { ListVehiclesGateway } from "./gateways/ListVehicles.gateway";

export const vehicleModule = {
  gateways: {
    list: new ListVehiclesGateway(),
    get: new GetVehicleGateway(),
  },
};

export type { Vehicle } from "./types";
