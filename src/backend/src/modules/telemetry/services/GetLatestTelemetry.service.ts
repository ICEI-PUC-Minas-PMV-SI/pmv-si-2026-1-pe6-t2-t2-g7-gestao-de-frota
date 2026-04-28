import { Injectable, NotFoundException } from '@nestjs/common';
import { TelemetryRepo } from '../repositories/telemetry/interface';
import { VehicleRepo } from '../../vehicle/repositories/vehicle/interface';

export type GetLatestTelemetryInput = {
  vehicleId: string;
};

@Injectable()
export class GetLatestTelemetryService {
  constructor(
    private readonly vehicleRepo: VehicleRepo,
    private readonly telemetryRepo: TelemetryRepo,
  ) {}

  async exec(input: GetLatestTelemetryInput) {
    const vehicle = await this.vehicleRepo.findById(input.vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado.');
    }

    const latest = await this.telemetryRepo.findLatestByVehicleId(
      input.vehicleId,
    );
    if (!latest) {
      return {
        temTelemetria: false as const,
      };
    }

    return {
      temTelemetria: true as const,
      id: latest.id,
      vehicleId: latest.vehicleId,
      kmRodados: latest.kmRodados,
      combustivelGasto: latest.combustivelGasto,
      nivelCombustivel: latest.nivelCombustivel,
      velocidadeMedia: latest.velocidadeMedia,
      registradaEm: latest.recordedAt.toISOString(),
    };
  }
}
