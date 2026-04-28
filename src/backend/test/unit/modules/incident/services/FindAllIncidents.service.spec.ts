import { FindAllIncidentsService } from '../../../../../src/modules/incident/services/FindAllIncidents.service';
import {
  IncidentModel,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from '../../../../../src/modules/incident/models/Incident.model';
import { IncidentRepo } from '../../../../../src/modules/incident/repositories/incident/interface';

describe('FindAllIncidentsService', () => {
  it('deve retornar a lista de incidentes', async () => {
    const repo: Pick<IncidentRepo, 'findAll'> = {
      findAll: jest.fn(() =>
        Promise.resolve([
          new IncidentModel({
            id: 'incident-1-id',
            vehicleId: 'vehicle-1-id',
            tipo: IncidentType.SINISTRO,
            status: IncidentStatus.ABERTO,
            severidade: IncidentSeverity.MEDIA,
            descricao: 'Colisao traseira',
            data: new Date('2026-04-10T00:00:00.000Z'),
          }),
        ]),
      ),
    };
    const service = new FindAllIncidentsService(repo as IncidentRepo);

    const result = await service.exec();

    expect(repo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('incident-1-id');
  });
});
