import { NotFoundException } from '@nestjs/common';
import { UpdateIncidentService } from '../../../../../src/modules/incident/services/UpdateIncident.service';
import {
  IncidentModel,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from '../../../../../src/modules/incident/models/Incident.model';
import { IncidentRepo } from '../../../../../src/modules/incident/repositories/incident/interface';

describe('UpdateIncidentService', () => {
  it('deve atualizar o incidente existente preservando campos nao enviados', async () => {
    const existing = new IncidentModel({
      id: 'incident-1-id',
      vehicleId: 'vehicle-1-id',
      tipo: IncidentType.SINISTRO,
      status: IncidentStatus.ABERTO,
      severidade: IncidentSeverity.MEDIA,
      descricao: 'Descricao original',
      valor: 500,
      data: new Date('2026-04-10T00:00:00.000Z'),
      createdAt: new Date('2026-04-10T00:00:00.000Z'),
      updatedAt: new Date('2026-04-10T00:00:00.000Z'),
    });
    const repo: Pick<IncidentRepo, 'findById' | 'update'> = {
      findById: jest.fn(() => Promise.resolve(existing)),
      update: jest.fn((incident: IncidentModel) => Promise.resolve(incident)),
    };
    const service = new UpdateIncidentService(repo as IncidentRepo);

    const result = await service.exec({
      id: 'incident-1-id',
      descricao: 'Descricao atualizada',
      valor: 650,
    });

    expect(repo.findById).toHaveBeenCalledWith('incident-1-id');
    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(result.toJSON()).toMatchObject({
      id: 'incident-1-id',
      vehicleId: 'vehicle-1-id',
      tipo: IncidentType.SINISTRO,
      descricao: 'Descricao atualizada',
      valor: 650,
    });
  });

  it('deve retornar 404 quando o incidente nao existir', async () => {
    const repo: Pick<IncidentRepo, 'findById'> = {
      findById: jest.fn(() => Promise.resolve(null)),
    };
    const service = new UpdateIncidentService(repo as IncidentRepo);

    await expect(
      service.exec({
        id: 'incident-inexistente',
        descricao: 'Nao Existe',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
