import { CreateIncidentService } from '../../../../../src/modules/incident/services/CreateIncident.service';
import {
  IncidentModel,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from '../../../../../src/modules/incident/models/Incident.model';
import { IncidentRepo } from '../../../../../src/modules/incident/repositories/incident/interface';

describe('CreateIncidentService', () => {
  it('deve criar incidente com os dados recebidos', async () => {
    const repo: Pick<IncidentRepo, 'create'> = {
      create: jest.fn((incident: IncidentModel) => Promise.resolve(incident)),
    };
    const service = new CreateIncidentService(repo as IncidentRepo);

    const result = await service.exec({
      vehicleId: 'vehicle-1-id',
      tipo: IncidentType.SINISTRO,
      status: IncidentStatus.ABERTO,
      severidade: IncidentSeverity.MEDIA,
      descricao: 'Colisao traseira',
      valor: 500,
      natureza: 'colisao',
      local: 'Av. Brasil, 500',
      data: new Date('2026-04-10T00:00:00.000Z'),
    });

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(result.toJSON()).toMatchObject({
      vehicleId: 'vehicle-1-id',
      tipo: IncidentType.SINISTRO,
      status: IncidentStatus.ABERTO,
      severidade: IncidentSeverity.MEDIA,
      descricao: 'Colisao traseira',
      valor: 500,
      natureza: 'colisao',
      local: 'Av. Brasil, 500',
      data: new Date('2026-04-10T00:00:00.000Z'),
    });
  });

  it('deve usar a data atual quando nenhuma data for informada', async () => {
    const repo: Pick<IncidentRepo, 'create'> = {
      create: jest.fn((incident: IncidentModel) => Promise.resolve(incident)),
    };
    const service = new CreateIncidentService(repo as IncidentRepo);

    const before = Date.now();
    const result = await service.exec({
      vehicleId: 'vehicle-2-id',
      tipo: IncidentType.MULTA,
      status: IncidentStatus.ABERTO,
      severidade: IncidentSeverity.BAIXA,
      descricao: 'Excesso de velocidade',
      codigoInfracao: 'M123',
      localInfracao: 'Av. Amazonas, 20',
    });
    const after = Date.now();

    expect(result.data.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.data.getTime()).toBeLessThanOrEqual(after);
  });
});
