import { NotFoundException } from '@nestjs/common';
import { GetLatestJourneyPositionService } from '../../../../../src/modules/journey/services/GetLatestJourneyPosition.service';
import { JourneyRepo } from '../../../../../src/modules/journey/repositories/journey/interface';
import { JourneyPositionRepo } from '../../../../../src/modules/journey/repositories/journeyPosition/interface';
import { JourneyModel } from '../../../../../src/modules/journey/models/Journey.model';
import { JourneyPositionModel } from '../../../../../src/modules/journey/models/JourneyPosition.model';

describe('GetLatestJourneyPositionService', () => {
  const input = {
    userId: 10,
    journeyId: 'journey-1',
  };

  it('deve lançar NotFoundException quando jornada não existe', async () => {
    const journeyRepo: Pick<JourneyRepo, 'findByIdForUser'> = {
      findByIdForUser: jest.fn(() => Promise.resolve(null)),
    };
    const positionRepo: Pick<JourneyPositionRepo, 'findLatestByJourneyId'> = {
      findLatestByJourneyId: jest.fn(),
    };

    const service = new GetLatestJourneyPositionService(
      journeyRepo as JourneyRepo,
      positionRepo as JourneyPositionRepo,
    );

    await expect(service.exec(input)).rejects.toBeInstanceOf(NotFoundException);
    expect(positionRepo.findLatestByJourneyId).not.toHaveBeenCalled();
  });

  it('deve retornar temPosicao false quando não há posição registrada', async () => {
    const journeyRepo: Pick<JourneyRepo, 'findByIdForUser'> = {
      findByIdForUser: jest.fn(() =>
        Promise.resolve(
          new JourneyModel({
            id: 'journey-1',
            userId: 10,
            vehicleId: 'vehicle-1-id',
            status: 'in_progress',
          }),
        ),
      ),
    };
    const positionRepo: Pick<JourneyPositionRepo, 'findLatestByJourneyId'> = {
      findLatestByJourneyId: jest.fn(() => Promise.resolve(null)),
    };

    const service = new GetLatestJourneyPositionService(
      journeyRepo as JourneyRepo,
      positionRepo as JourneyPositionRepo,
    );

    await expect(service.exec(input)).resolves.toEqual({ temPosicao: false });
  });

  it('deve retornar última posição quando existir registro', async () => {
    const recordedAt = new Date('2026-04-07T10:05:00.000Z');
    const journeyRepo: Pick<JourneyRepo, 'findByIdForUser'> = {
      findByIdForUser: jest.fn(() =>
        Promise.resolve(
          new JourneyModel({
            id: 'journey-1',
            userId: 10,
            vehicleId: 'vehicle-1-id',
            status: 'in_progress',
          }),
        ),
      ),
    };
    const positionRepo: Pick<JourneyPositionRepo, 'findLatestByJourneyId'> = {
      findLatestByJourneyId: jest.fn(() =>
        Promise.resolve(
          new JourneyPositionModel({
            id: 'pos-1',
            journeyId: 'journey-1',
            latitude: -19.8,
            longitude: -43.9,
            recordedAt,
          }),
        ),
      ),
    };

    const service = new GetLatestJourneyPositionService(
      journeyRepo as JourneyRepo,
      positionRepo as JourneyPositionRepo,
    );

    await expect(service.exec(input)).resolves.toEqual({
      temPosicao: true,
      latitude: -19.8,
      longitude: -43.9,
      registradaEm: recordedAt.toISOString(),
    });
  });
});
