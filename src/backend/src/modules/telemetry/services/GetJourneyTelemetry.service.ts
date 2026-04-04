import { Injectable, NotFoundException } from '@nestjs/common';
import { JourneyRepo } from '../../journey/repositories/journey/interface';
import { TelemetryRepo } from '../repositories/telemetry/interface';

export type GetJourneyTelemetryInput = {
  userId: number;
  journeyId: string;
};

@Injectable()
export class GetJourneyTelemetryService {
  constructor(
    private readonly journeyRepo: JourneyRepo,
    private readonly telemetryRepo: TelemetryRepo,
  ) {}

  async exec(input: GetJourneyTelemetryInput) {
    const journey = await this.journeyRepo.findByIdForUser(
      input.journeyId,
      input.userId,
    );
    if (!journey) {
      throw new NotFoundException('Jornada não encontrada.');
    }

    const rows = await this.telemetryRepo.findByJourneyId(input.journeyId);

    return rows.map((row) => ({
      id: row.id,
      journeyId: row.journeyId,
      vehicleId: row.vehicleId,
      kmRodados: row.kmRodados,
      combustivelGasto: row.combustivelGasto,
      nivelCombustivel: row.nivelCombustivel,
      latitude: row.latitude,
      longitude: row.longitude,
      velocidadeMedia: row.velocidadeMedia,
      registradaEm: row.recordedAt.toISOString(),
    }));
  }
}
