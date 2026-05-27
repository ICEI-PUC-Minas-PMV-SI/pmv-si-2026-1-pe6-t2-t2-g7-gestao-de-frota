import { CreateVehicleGateway } from "./gateways/CreateVehicle.gateway";
import { DeleteVehicleGateway } from "./gateways/DeleteVehicle.gateway";
import { GetVehicleGateway } from "./gateways/GetVehicle.gateway";
import { ListVehiclesGateway } from "./gateways/ListVehicles.gateway";
import { UpdateVehicleGateway } from "./gateways/UpdateVehicle.gateway";

export const vehicleModule = {
  gateways: {
    list: new ListVehiclesGateway(),
    get: new GetVehicleGateway(),
    create: new CreateVehicleGateway(),
    update: new UpdateVehicleGateway(),
    delete: new DeleteVehicleGateway(),
  },
};

export type { Vehicle } from "./types";
