import { CreateVehicleGateway } from "./gateways/CreateVehicle.gateway";
import { GetVehicleGateway } from "./gateways/GetVehicle.gateway";
import { ListVehiclesGateway } from "./gateways/ListVehicles.gateway";

export const vehicleModule = {
  gateways: {
    create: new CreateVehicleGateway(),
    list: new ListVehiclesGateway(),
    get: new GetVehicleGateway(),
  },
};

export type { Vehicle } from "./types";
