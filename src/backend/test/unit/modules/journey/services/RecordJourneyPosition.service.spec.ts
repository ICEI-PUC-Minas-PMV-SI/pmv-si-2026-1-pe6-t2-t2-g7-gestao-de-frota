import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RecordJourneyPositionService } from '../../../../../src/modules/journey/services/RecordJourneyPosition.service';
import { JourneyRepo } from '../../../../../src/modules/journey/repositories/journey/interface';
import { JourneyPositionRepo } from '../../../../../src/modules/journey/repositories/journeyPosition/interface';
import { JourneyModel } from '../../../../../src/modules/journey/models/Journey.model';
import { JourneyPositionModel } from '../../../../../src/modules/journey/models/JourneyPosition.model';

describe('RecordJourneyPositionService', () => {
  const input = {
    userId: 10,
    journeyId: 'journey-1',
    latitude: -19.8,
    longitude: -43.9,
  };

  it('deve lançar NotFoundException quando jornada não existe', async () => {
    const journeyRepo: Pick<JourneyRepo, 'findByIdForUser'> = {
      findByIdForUser: jest.fn(() => Promise.resolve(null)),
    };
    const positionRepo: Pick<JourneyPositionRepo, 'create'> = {
      create: jest.fn(),
    };

    const service = new RecordJourneyPositionService(
      journeyRepo as JourneyRepo,
      positionRepo as JourneyPositionRepo,
    );

    await expect(service.exec(input)).rejects.toBeInstanceOf(NotFoundException);
    expect(positionRepo.create).not.toHaveBeenCalled();
  });

  it('deve lançar ForbiddenException quando jornada não está em andamento', async () => {
    const journeyRepo: Pick<JourneyRepo, 'findByIdForUser'> = {
      findByIdForUser: jest.fn(() =>
        Promise.resolve(
          new JourneyModel({
            id: 'journey-1',
            userId: 10,
            status: 'completed',
          }),
        ),
      ),
    };
    const positionRepo: Pick<JourneyPositionRepo, 'create'> = {
      create: jest.fn(),
    };

    const service = new RecordJourneyPositionService(
      journeyRepo as JourneyRepo,
      positionRepo as JourneyPositionRepo,
    );

    await expect(service.exec(input)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(positionRepo.create).not.toHaveBeenCalled();
  });

  it('deve registrar posição quando jornada está em andamento', async () => {
    const recordedAt = new Date('2026-04-07T10:03:00.000Z');
    const journeyRepo: Pick<JourneyRepo, 'findByIdForUser'> = {
      findByIdForUser: jest.fn(() =>
        Promise.resolve(
          new JourneyModel({
            id: 'journey-1',
            userId: 10,
            status: 'in_progress',
          }),
        ),
      ),
    };
    const positionRepo: Pick<JourneyPositionRepo, 'create'> = {
      create: jest.fn((row) =>
        Promise.resolve(
          new JourneyPositionModel({
            id: 'pos-1',
            journeyId: row.journeyId,
            latitude: row.latitude,
            longitude: row.longitude,
            recordedAt,
          }),
        ),
      ),
    };

    const service = new RecordJourneyPositionService(
      journeyRepo as JourneyRepo,
      positionRepo as JourneyPositionRepo,
    );

    const result = await service.exec(input);

    expect(positionRepo.create).toHaveBeenCalledTimes(1);
    expect(result.latitude).toBe(input.latitude);
    expect(result.longitude).toBe(input.longitude);
    expect(result.registradaEm).toEqual(expect.any(String));
  });
});
