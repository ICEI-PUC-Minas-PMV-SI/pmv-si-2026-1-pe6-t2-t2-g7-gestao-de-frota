import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { JourneyModel } from '../../../../../src/modules/journey/models/Journey.model';
import { TelemetryModel } from '../../../../../src/modules/telemetry/models/Telemetry.model';
import { GetJourneyTelemetryService } from '../../../../../src/modules/telemetry/services/GetJourneyTelemetry.service';
import { GetLatestTelemetryService } from '../../../../../src/modules/telemetry/services/GetLatestTelemetry.service';
import { RecordTelemetryService } from '../../../../../src/modules/telemetry/services/RecordTelemetry.service';

describe('Telemetry services', () => {
  const journey = new JourneyModel({
    id: 'j1',
    userId: 1,
    name: 'Entrega',
    status: 'in_progress',
    startedAt: new Date('2026-04-10T00:00:00.000Z'),
  });
  const telemetry = new TelemetryModel({
    id: 't1',
    journeyId: 'j1',
    vehicleId: 'v1',
    kmRodados: 10,
    combustivelGasto: 2,
    nivelCombustivel: 50,
    latitude: -10,
    longitude: -20,
    velocidadeMedia: 70,
    recordedAt: new Date('2026-04-10T01:00:00.000Z'),
  });

  it('deve registrar telemetria para jornada em andamento', async () => {
    const createMock = jest.fn(() => Promise.resolve(telemetry));
    const service = new RecordTelemetryService(
      { findByIdForUser: jest.fn(() => Promise.resolve(journey)) } as never,
      { create: createMock } as never,
    );

    await expect(
      service.exec({
        userId: 1,
        journeyId: 'j1',
        vehicleId: 'v1',
        kmRodados: 10,
        combustivelGasto: 2,
        nivelCombustivel: 50,
        latitude: -10,
        longitude: -20,
        velocidadeMedia: 70,
      }),
    ).resolves.toMatchObject({
      journeyId: 'j1',
      registradaEm: expect.any(String),
    });
    expect(createMock).toHaveBeenCalled();
  });

  it('deve validar jornada inexistente e fora de andamento ao registrar', async () => {
    const notFoundService = new RecordTelemetryService(
      { findByIdForUser: jest.fn(() => Promise.resolve(null)) } as never,
      {} as never,
    );
    await expect(
      notFoundService.exec({
        userId: 1,
        journeyId: 'j1',
        vehicleId: 'v1',
        kmRodados: 10,
        combustivelGasto: 2,
        nivelCombustivel: 50,
        latitude: -10,
        longitude: -20,
        velocidadeMedia: 70,
      }),
    ).rejects.toThrow(NotFoundException);

    const forbiddenService = new RecordTelemetryService(
      {
        findByIdForUser: jest.fn(() =>
          Promise.resolve(
            new JourneyModel({
              ...journey.toJSON(),
              status: 'completed',
            }),
          ),
        ),
      } as never,
      {} as never,
    );
    await expect(
      forbiddenService.exec({
        userId: 1,
        journeyId: 'j1',
        vehicleId: 'v1',
        kmRodados: 10,
        combustivelGasto: 2,
        nivelCombustivel: 50,
        latitude: -10,
        longitude: -20,
        velocidadeMedia: 70,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('deve retornar ultima telemetria ou indicar ausencia', async () => {
    const service = new GetLatestTelemetryService(
      { findByIdForUser: jest.fn(() => Promise.resolve(journey)) } as never,
      {
        findLatestByJourneyId: jest
          .fn()
          .mockResolvedValueOnce(telemetry)
          .mockResolvedValueOnce(null),
      } as never,
    );

    await expect(
      service.exec({ userId: 1, journeyId: 'j1' }),
    ).resolves.toMatchObject({
      temTelemetria: true,
      id: 't1',
    });
    await expect(service.exec({ userId: 1, journeyId: 'j1' })).resolves.toEqual(
      {
        temTelemetria: false,
      },
    );
  });

  it('deve listar telemetrias da jornada e validar jornada inexistente', async () => {
    const service = new GetJourneyTelemetryService(
      { findByIdForUser: jest.fn(() => Promise.resolve(journey)) } as never,
      { findByJourneyId: jest.fn(() => Promise.resolve([telemetry])) } as never,
    );

    await expect(service.exec({ userId: 1, journeyId: 'j1' })).resolves.toEqual(
      [expect.objectContaining({ id: 't1', journeyId: 'j1' })],
    );

    const notFound = new GetJourneyTelemetryService(
      { findByIdForUser: jest.fn(() => Promise.resolve(null)) } as never,
      {} as never,
    );
    await expect(notFound.exec({ userId: 1, journeyId: 'j1' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
