import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JourneyRepo } from '../repositories/journey/interface';
import { JourneyPositionRepo } from '../repositories/journeyPosition/interface';
import { JourneyPositionModel } from '../models/JourneyPosition.model';

export type RecordJourneyPositionInput = {
  userId: number;
  journeyId: string;
  latitude: number;
  longitude: number;
};

@Injectable()
export class RecordJourneyPositionService {
  constructor(
    private readonly journeyRepo: JourneyRepo,
    private readonly positionRepo: JourneyPositionRepo,
  ) {}

  async exec(input: RecordJourneyPositionInput) {
    const journey = await this.journeyRepo.findByIdForUser(
      input.journeyId,
      input.userId,
    );
    if (!journey) {
      throw new NotFoundException('Jornada não encontrada.');
    }
    if (journey.status !== 'in_progress') {
      throw new ForbiddenException(
        'Só é possível registar posição em jornadas em curso.',
      );
    }

    const row = new JourneyPositionModel({
      journeyId: input.journeyId,
      latitude: input.latitude,
      longitude: input.longitude,
    });
    await this.positionRepo.create(row);

    return {
      id: row.id,
      latitude: row.latitude,
      longitude: row.longitude,
      registradaEm: row.recordedAt.toISOString(),
    };
  }
}
