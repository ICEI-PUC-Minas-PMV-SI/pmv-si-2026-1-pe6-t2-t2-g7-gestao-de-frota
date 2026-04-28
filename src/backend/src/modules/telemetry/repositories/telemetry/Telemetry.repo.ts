import { Inject, Injectable } from '@nestjs/common';
import { typeORMConsts } from 'src/modules/commons/typeorm/consts';
import { DataSource } from 'typeorm';
import { TelemetryRepo } from './interface';
import { TelemetryModel } from '../../models/Telemetry.model';

@Injectable()
export class TelemetryRepoImpl implements TelemetryRepo {
  constructor(
    @Inject(typeORMConsts.databaseProviders)
    private readonly dataSource: DataSource,
  ) {}

  async create(row: TelemetryModel) {
    await this.dataSource.getRepository(TelemetryModel).insert(row.toJSON());
    return row;
  }

  async update(row: TelemetryModel) {
    const changes = row.toJSON();
    Reflect.deleteProperty(changes, 'id');
    Reflect.deleteProperty(changes, 'createdAt');

    await this.dataSource
      .getRepository(TelemetryModel)
      .update({ id: row.id }, changes);

    return row;
  }

  async findByVehicleId(vehicleId: string) {
    return await this.dataSource.getRepository(TelemetryModel).find({
      where: { vehicleId },
      order: { recordedAt: 'ASC' },
    });
  }

  async findLatestByVehicleId(vehicleId: string) {
    const rows = await this.dataSource.getRepository(TelemetryModel).find({
      where: { vehicleId },
      order: { recordedAt: 'DESC' },
      take: 1,
    });
    return rows[0] ?? null;
  }
}
