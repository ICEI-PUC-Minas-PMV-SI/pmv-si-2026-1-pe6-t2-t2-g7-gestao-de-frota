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

  async findByJourneyId(journeyId: string) {
    return await this.dataSource.getRepository(TelemetryModel).find({
      where: { journeyId },
      order: { recordedAt: 'ASC' },
    });
  }

  async findLatestByJourneyId(journeyId: string) {
    const rows = await this.dataSource.getRepository(TelemetryModel).find({
      where: { journeyId },
      order: { recordedAt: 'DESC' },
      take: 1,
    });
    return rows[0] ?? null;
  }
}
