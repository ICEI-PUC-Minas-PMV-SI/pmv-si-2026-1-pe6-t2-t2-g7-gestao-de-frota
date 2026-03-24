import { Injectable, NotFoundException } from '@nestjs/common';
import { JourneyRepo } from '../repositories/journey/interface';
import { JourneyPositionRepo } from '../repositories/journeyPosition/interface';

export type GetLatestJourneyPositionInput = {
  userId: number;
  journeyId: string;
};

@Injectable()
export class GetLatestJourneyPositionService {
  constructor(
    private readonly journeyRepo: JourneyRepo,
    private readonly positionRepo: JourneyPositionRepo,
  ) {}

  async exec(input: GetLatestJourneyPositionInput) {
    const journey = await this.journeyRepo.findByIdForUser(
      input.journeyId,
      input.userId,
    );
    if (!journey) {
      throw new NotFoundException('Jornada não encontrada.');
    }

    const latest = await this.positionRepo.findLatestByJourneyId(
      input.journeyId,
    );
    if (!latest) {
      return {
        temPosicao: false as const,
      };
    }

    return {
      temPosicao: true as const,
      latitude: latest.latitude,
      longitude: latest.longitude,
      registradaEm: latest.recordedAt.toISOString(),
    };
  }
}
