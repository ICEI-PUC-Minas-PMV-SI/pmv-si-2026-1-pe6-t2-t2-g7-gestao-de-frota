import { Injectable } from '@nestjs/common';
import { VehicleRepo } from '../repositories/vehicle/interface';

@Injectable()
export class DeleteVehicleService {
  constructor(private readonly vehicleRepo: VehicleRepo) {}

  async exec(id: string) {
    return await this.vehicleRepo.delete(id);
  }
}
