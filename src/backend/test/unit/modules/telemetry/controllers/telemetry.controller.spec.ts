import { GetJourneyTelemetryController } from '../../../../../src/modules/telemetry/controllers/telemetry/GetJourneyTelemetry.controller';
import { GetLatestTelemetryController } from '../../../../../src/modules/telemetry/controllers/telemetry/GetLatestTelemetry.controller';
import { RecordTelemetryController } from '../../../../../src/modules/telemetry/controllers/telemetry/RecordTelemetry.controller';

describe('Telemetry controllers', () => {
  it('deve registrar telemetria', async () => {
    const execMock = jest.fn(() => Promise.resolve({ id: 't1' }));
    const controller = new RecordTelemetryController({
      exec: execMock,
    } as never);

    await expect(
      controller.exec('00000000-0000-4000-8000-000000000001', {
        kmRodados: 10,
        combustivelGasto: 2,
        nivelCombustivel: 40,
        velocidadeMedia: 70,
      }),
    ).resolves.toEqual({ id: 't1' });
  });

  it('deve retornar ultima telemetria', async () => {
    const execMock = jest.fn(() => Promise.resolve({ temTelemetria: false }));
    const controller = new GetLatestTelemetryController({
      exec: execMock,
    } as never);

    await expect(
      controller.exec('00000000-0000-4000-8000-000000000001'),
    ).resolves.toEqual({
      temTelemetria: false,
    });
  });

  it('deve listar telemetrias da jornada', async () => {
    const execMock = jest.fn(() => Promise.resolve([{ id: 't1' }]));
    const controller = new GetJourneyTelemetryController({
      exec: execMock,
    } as never);

    await expect(
      controller.exec('00000000-0000-4000-8000-000000000001'),
    ).resolves.toEqual([{ id: 't1' }]);
  });
});
