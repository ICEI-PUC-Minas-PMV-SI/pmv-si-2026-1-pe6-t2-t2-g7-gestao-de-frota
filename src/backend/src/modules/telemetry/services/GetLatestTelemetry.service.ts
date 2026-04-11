import { Injectable, NotFoundException } from '@nestjs/common';
import { JourneyRepo } from '../../journey/repositories/journey/interface';
import { TelemetryRepo } from '../repositories/telemetry/interface';

export type GetLatestTelemetryInput = {
  userId: number;
  journeyId: string;
};

@Injectable()
export class GetLatestTelemetryService {
  constructor(
    private readonly journeyRepo: JourneyRepo,
    private readonly telemetryRepo: TelemetryRepo,
  ) {}

  async exec(input: GetLatestTelemetryInput) {
    const journey = await this.journeyRepo.findByIdForUser(
      input.journeyId,
      input.userId,
    );
    if (!journey) {
      throw new NotFoundException('Jornada não encontrada.');
    }

    const latest = await this.telemetryRepo.findLatestByJourneyId(
      input.journeyId,
    );
    if (!latest) {
      return {
        temTelemetria: false as const,
      };
    }

    return {
      temTelemetria: true as const,
      id: latest.id,
      journeyId: latest.journeyId,
      vehicleId: latest.vehicleId,
      kmRodados: latest.kmRodados,
      combustivelGasto: latest.combustivelGasto,
      nivelCombustivel: latest.nivelCombustivel,
      latitude: latest.latitude,
      longitude: latest.longitude,
      velocidadeMedia: latest.velocidadeMedia,
      registradaEm: latest.recordedAt.toISOString(),
    };
  }
}
