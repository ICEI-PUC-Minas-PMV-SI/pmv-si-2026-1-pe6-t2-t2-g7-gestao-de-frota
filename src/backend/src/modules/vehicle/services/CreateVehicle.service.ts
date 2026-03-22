import { Injectable } from '@nestjs/common';
import { VehicleRepo } from '../repositories/vehicle/interface';
import { VehicleModel, VehicleModelPropsInput } from '../models/Vehicle.model';
import {
  validatePlacaMercosul,
  validateAnoQuatroDigitos,
} from './vehicle.validation';

@Injectable()
export class CreateVehicleService {
  constructor(private readonly vehicleRepo: VehicleRepo) {}

  async exec(vehicle: VehicleModelPropsInput) {
    validatePlacaMercosul(vehicle.placa);
    validateAnoQuatroDigitos(vehicle.ano);
    return await this.vehicleRepo.create(new VehicleModel(vehicle));
  }
}
