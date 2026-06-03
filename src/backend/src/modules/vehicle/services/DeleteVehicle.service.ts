import { Injectable, NotFoundException } from '@nestjs/common';
import { VehicleRepo } from '../repositories/vehicle/interface';

@Injectable()
export class DeleteVehicleService {
  constructor(private readonly vehicleRepo: VehicleRepo) {}

  async exec(id: string, userId: number) {
    const existing = await this.vehicleRepo.findByIdForUser(id, userId);
    if (!existing) {
      throw new NotFoundException('Veículo não encontrado.');
    }
    return await this.vehicleRepo.delete(id);
  }
}
