import { FindIncidentService } from '../../../../../src/modules/incident/services/FindIncident.service';
import {
  IncidentModel,
  IncidentType,
} from '../../../../../src/modules/incident/models/Incident.model';
import { IncidentRepo } from '../../../../../src/modules/incident/repositories/incident/interface';

describe('FindIncidentService', () => {
  it('deve buscar incidente por id', async () => {
    const incident = new IncidentModel({
      id: 'incident-1-id',
      vehicleId: 'vehicle-1-id',
      tipo: IncidentType.SINISTRO,
      descricao: 'Colisao traseira',
      data: new Date('2026-04-10T00:00:00.000Z'),
    });
    const repo: Pick<IncidentRepo, 'findById'> = {
      findById: jest.fn(() => Promise.resolve(incident)),
    };
    const service = new FindIncidentService(repo as IncidentRepo);

    const result = await service.exec('incident-1-id');

    expect(repo.findById).toHaveBeenCalledWith('incident-1-id');
    expect(result).toBe(incident);
  });
});
