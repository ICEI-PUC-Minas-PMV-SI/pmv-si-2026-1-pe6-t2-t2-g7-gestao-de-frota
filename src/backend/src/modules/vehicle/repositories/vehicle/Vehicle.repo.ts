import { Inject, Injectable } from '@nestjs/common';
import { typeORMConsts } from 'src/modules/commons/typeorm/consts';
import { DataSource } from 'typeorm';
import { VehicleRepo } from './interface';
import { VehicleModel } from '../../models/Vehicle.model';

@Injectable()
export class VehicleRepoImpl implements VehicleRepo {
  constructor(
    @Inject(typeORMConsts.databaseProviders)
    private readonly dataSource: DataSource,
  ) {}

  async create(vehicle: VehicleModel) {
    await this.dataSource.getRepository(VehicleModel).insert(vehicle.toJSON());
    return vehicle;
  }

  async update(vehicle: VehicleModel) {
    const changes = vehicle.props;
    const values = Object.values(changes);
    if (values.every((value) => value === undefined)) return vehicle;

    Reflect.deleteProperty(changes, 'id');
    Reflect.deleteProperty(changes, 'createdAt');
    Reflect.deleteProperty(changes, 'updatedAt');

    await this.dataSource
      .getRepository(VehicleModel)
      .update({ id: vehicle.id }, changes);

    return vehicle;
  }

  async delete(id: string) {
    await this.dataSource.getRepository(VehicleModel).delete({ id });
  }

  async findById(id: string) {
    const result = await this.dataSource
      .getRepository(VehicleModel)
      .findOneBy({ id });
    return result;
  }

  async findAll() {
    const result = await this.dataSource.getRepository(VehicleModel).find();
    return result;
  }
}
