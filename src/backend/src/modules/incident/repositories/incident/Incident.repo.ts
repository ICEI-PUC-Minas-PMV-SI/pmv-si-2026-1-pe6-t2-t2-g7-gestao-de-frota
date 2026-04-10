import { Inject, Injectable } from '@nestjs/common';
import { typeORMConsts } from 'src/modules/commons/typeorm/consts';
import { DataSource } from 'typeorm';
import { IncidentRepo } from './interface';
import { IncidentModel } from '../../models/Incident.model';

@Injectable()
export class IncidentRepoImpl implements IncidentRepo {
  constructor(
    @Inject(typeORMConsts.databaseProviders)
    private readonly dataSource: DataSource,
  ) {}

  async create(incident: IncidentModel) {
    await this.dataSource
      .getRepository(IncidentModel)
      .insert(incident.toJSON());
    return incident;
  }

  async update(incident: IncidentModel) {
    const changes = incident.props;
    const values = Object.values(changes);
    if (values.every((value) => value === undefined)) return incident;

    Reflect.deleteProperty(changes, 'id');
    Reflect.deleteProperty(changes, 'createdAt');
    Reflect.deleteProperty(changes, 'updatedAt');

    await this.dataSource
      .getRepository(IncidentModel)
      .update({ id: incident.id }, changes);

    return incident;
  }

  async delete(id: string) {
    await this.dataSource.getRepository(IncidentModel).delete({ id });
  }

  async findById(id: string) {
    const result = await this.dataSource
      .getRepository(IncidentModel)
      .findOneBy({ id });
    return result;
  }

  async findAll() {
    const result = await this.dataSource.getRepository(IncidentModel).find();
    return result;
  }

  async findByVehicleId(vehicleId: string) {
    const result = await this.dataSource
      .getRepository(IncidentModel)
      .findBy({ vehicleId });
    return result;
  }
}
