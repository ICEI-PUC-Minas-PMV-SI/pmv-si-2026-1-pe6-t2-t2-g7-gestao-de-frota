import { Injectable, NotFoundException } from '@nestjs/common';
import { VehicleModel, VehicleModelUpdateInput } from '../models/Vehicle.model';
import { VehicleRepo } from '../repositories/vehicle/interface';
import {
  validatePlacaMercosul,
  validateAnoQuatroDigitos,
} from './vehicle.validation';

@Injectable()
export class UpdateVehicleService {
  constructor(private readonly vehicleRepo: VehicleRepo) {}

  async exec(vehicle: VehicleModelUpdateInput) {
    if (vehicle.placa !== undefined) {
      validatePlacaMercosul(vehicle.placa);
    }
    if (vehicle.ano !== undefined) {
      validateAnoQuatroDigitos(vehicle.ano);
    }
    const existing = await this.vehicleRepo.findById(vehicle.id);
    if (!existing) {
      throw new NotFoundException('Veículo não encontrado.');
    }
    const merged = { ...existing.toJSON(), ...vehicle };
    return await this.vehicleRepo.update(new VehicleModel(merged));
  }
}
