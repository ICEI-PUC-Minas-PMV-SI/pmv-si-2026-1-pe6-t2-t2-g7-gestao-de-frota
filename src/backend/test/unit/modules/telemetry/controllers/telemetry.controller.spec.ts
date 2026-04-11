import { GetJourneyTelemetryController } from '../../../../../src/modules/telemetry/controllers/telemetry/GetJourneyTelemetry.controller';
import { GetLatestTelemetryController } from '../../../../../src/modules/telemetry/controllers/telemetry/GetLatestTelemetry.controller';
import { RecordTelemetryController } from '../../../../../src/modules/telemetry/controllers/telemetry/RecordTelemetry.controller';

describe('Telemetry controllers', () => {
  const container = { user: { id: 1 } } as never;

  it('deve registrar telemetria', async () => {
    const execMock = jest.fn(() => Promise.resolve({ id: 't1' }));
    const controller = new RecordTelemetryController({
      exec: execMock,
    } as never);

    await expect(
      controller.exec(
        'j1',
        {
          vehicleId: 'v1',
          kmRodados: 10,
          combustivelGasto: 2,
          nivelCombustivel: 40,
          latitude: -10,
          longitude: -20,
          velocidadeMedia: 70,
        },
        container,
      ),
    ).resolves.toEqual({ id: 't1' });
  });

  it('deve retornar ultima telemetria', async () => {
    const execMock = jest.fn(() => Promise.resolve({ temTelemetria: false }));
    const controller = new GetLatestTelemetryController({
      exec: execMock,
    } as never);

    await expect(controller.exec('j1', container)).resolves.toEqual({
      temTelemetria: false,
    });
  });

  it('deve listar telemetrias da jornada', async () => {
    const execMock = jest.fn(() => Promise.resolve([{ id: 't1' }]));
    const controller = new GetJourneyTelemetryController({
      exec: execMock,
    } as never);

    await expect(controller.exec('j1', container)).resolves.toEqual([
      { id: 't1' },
    ]);
  });
});
