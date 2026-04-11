import { DeleteIncidentService } from '../../../../../src/modules/incident/services/DeleteIncident.service';
import { IncidentRepo } from '../../../../../src/modules/incident/repositories/incident/interface';

describe('DeleteIncidentService', () => {
  it('deve delegar a remocao para o repositorio', async () => {
    const repo: Pick<IncidentRepo, 'delete'> = {
      delete: jest.fn(() => Promise.resolve(undefined)),
    };
    const service = new DeleteIncidentService(repo as IncidentRepo);

    await service.exec('incident-1-id');

    expect(repo.delete).toHaveBeenCalledWith('incident-1-id');
  });
});
