import { NotFoundException } from '@nestjs/common';
import { TelemetryModel } from '../../../../../src/modules/telemetry/models/Telemetry.model';
import { GetJourneyTelemetryService } from '../../../../../src/modules/telemetry/services/GetJourneyTelemetry.service';
import { GetLatestTelemetryService } from '../../../../../src/modules/telemetry/services/GetLatestTelemetry.service';
import { RecordTelemetryService } from '../../../../../src/modules/telemetry/services/RecordTelemetry.service';

describe('Telemetry services', () => {
  const telemetry = new TelemetryModel({
    id: 't1',
    vehicleId: 'v1',
    kmRodados: 10,
    combustivelGasto: 2,
    nivelCombustivel: 50,
    velocidadeMedia: 70,
    recordedAt: new Date('2026-04-10T01:00:00.000Z'),
  });

  it('deve registrar telemetria para veículo existente', async () => {
    const createMock = jest.fn(() => Promise.resolve(telemetry));
    const service = new RecordTelemetryService(
      { findById: jest.fn(() => Promise.resolve({ id: 'v1' })) } as never,
      { create: createMock } as never,
    );

    await expect(
      service.exec({
        vehicleId: 'v1',
        kmRodados: 10,
        combustivelGasto: 2,
        nivelCombustivel: 50,
        velocidadeMedia: 70,
      }),
    ).resolves.toMatchObject({
      vehicleId: 'v1',
      registradaEm: expect.any(String),
    });
    expect(createMock).toHaveBeenCalled();
  });

  it('deve validar veículo inexistente ao registrar', async () => {
    const notFoundService = new RecordTelemetryService(
      { findById: jest.fn(() => Promise.resolve(null)) } as never,
      {} as never,
    );
    await expect(
      notFoundService.exec({
        vehicleId: 'v1',
        kmRodados: 10,
        combustivelGasto: 2,
        nivelCombustivel: 50,
        velocidadeMedia: 70,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve retornar ultima telemetria ou indicar ausencia', async () => {
    const service = new GetLatestTelemetryService(
      { findById: jest.fn(() => Promise.resolve({ id: 'v1' })) } as never,
      {
        findLatestByVehicleId: jest
          .fn()
          .mockResolvedValueOnce(telemetry)
          .mockResolvedValueOnce(null),
      } as never,
    );

    await expect(service.exec({ vehicleId: 'v1' })).resolves.toMatchObject({
      temTelemetria: true,
      id: 't1',
    });
    await expect(service.exec({ vehicleId: 'v1' })).resolves.toEqual({
      temTelemetria: false,
    });
  });

  it('deve listar telemetrias por veículo e validar veículo inexistente', async () => {
    const service = new GetJourneyTelemetryService(
      { findById: jest.fn(() => Promise.resolve({ id: 'v1' })) } as never,
      { findByVehicleId: jest.fn(() => Promise.resolve([telemetry])) } as never,
    );

    await expect(service.exec({ vehicleId: 'v1' })).resolves.toEqual([
      expect.objectContaining({ id: 't1', vehicleId: 'v1' }),
    ]);

    const notFound = new GetJourneyTelemetryService(
      { findById: jest.fn(() => Promise.resolve(null)) } as never,
      {} as never,
    );
    await expect(notFound.exec({ vehicleId: 'v1' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
