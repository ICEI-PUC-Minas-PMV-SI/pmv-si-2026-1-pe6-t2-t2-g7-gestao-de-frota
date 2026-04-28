import { Injectable, NotFoundException } from '@nestjs/common';
import { JourneyRepo } from '../repositories/journey/interface';

export type GetJourneyInput = {
  userId: number;
  journeyId: string;
};

@Injectable()
export class GetJourneyService {
  constructor(private readonly journeyRepo: JourneyRepo) {}

  async exec(input: GetJourneyInput) {
    const journey = await this.journeyRepo.findByIdForUser(
      input.journeyId,
      input.userId,
    );
    if (!journey) {
      throw new NotFoundException('Jornada não encontrada.');
    }

    const stops = await this.journeyRepo.findStopsByJourneyId(input.journeyId);

    return {
      id: journey.id,
      userId: journey.userId,
      vehicleId: journey.vehicleId,
      nome: journey.name,
      status: journey.status,
      kmRodados: journey.kmRodados,
      combustivelGasto: journey.combustivelGasto,
      nivelCombustivel: journey.nivelCombustivel,
      iniciadaEm: journey.startedAt.toISOString(),
      paradas: stops.map((s) => ({
        id: s.id,
        ordem: s.stopOrder,
        latitude: s.latitude,
        longitude: s.longitude,
      })),
      criadaEm: journey.createdAt.toISOString(),
      atualizadaEm: journey.updatedAt.toISOString(),
    };
  }
}
