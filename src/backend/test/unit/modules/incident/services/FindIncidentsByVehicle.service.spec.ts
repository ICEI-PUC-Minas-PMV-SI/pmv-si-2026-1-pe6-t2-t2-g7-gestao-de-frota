import { FindIncidentsByVehicleService } from '../../../../../src/modules/incident/services/FindIncidentsByVehicle.service';
import {
  IncidentModel,
  IncidentType,
} from '../../../../../src/modules/incident/models/Incident.model';
import { IncidentRepo } from '../../../../../src/modules/incident/repositories/incident/interface';

describe('FindIncidentsByVehicleService', () => {
  it('deve retornar incidentes filtrados por veiculo', async () => {
    const repo: Pick<IncidentRepo, 'findByVehicleId'> = {
      findByVehicleId: jest.fn(() =>
        Promise.resolve([
          new IncidentModel({
            id: 'incident-1-id',
            vehicleId: 'vehicle-1-id',
            tipo: IncidentType.MULTA,
            descricao: 'Radar',
            data: new Date('2026-04-10T00:00:00.000Z'),
          }),
        ]),
      ),
    };
    const service = new FindIncidentsByVehicleService(repo as IncidentRepo);

    const result = await service.exec('vehicle-1-id');

    expect(repo.findByVehicleId).toHaveBeenCalledWith('vehicle-1-id');
    expect(result).toHaveLength(1);
    expect(result[0].vehicleId).toBe('vehicle-1-id');
  });
});
