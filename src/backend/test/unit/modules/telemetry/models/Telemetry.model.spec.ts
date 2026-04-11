import { TelemetryModel } from '../../../../../src/modules/telemetry/models/Telemetry.model';

describe('TelemetryModel', () => {
  it('deve preencher defaults e serializar props', () => {
    const model = new TelemetryModel({
      journeyId: 'j1',
      vehicleId: 'v1',
      kmRodados: 10,
      combustivelGasto: 2,
      nivelCombustivel: 50,
      latitude: -10,
      longitude: -20,
      velocidadeMedia: 70,
    });

    expect(model.id).toEqual(expect.any(String));
    expect(model.toJSON()).toMatchObject({
      journeyId: 'j1',
      vehicleId: 'v1',
      kmRodados: 10,
    });
    expect(model.props).toMatchObject({
      journeyId: 'j1',
      velocidadeMedia: 70,
    });
  });
});
