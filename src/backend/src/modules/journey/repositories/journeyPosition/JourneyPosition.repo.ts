import { Inject, Injectable } from '@nestjs/common';
import { typeORMConsts } from 'src/modules/commons/typeorm/consts';
import { DataSource } from 'typeorm';
import { JourneyPositionRepo } from './interface';
import { JourneyPositionModel } from '../../models/JourneyPosition.model';

@Injectable()
export class JourneyPositionRepoImpl implements JourneyPositionRepo {
  constructor(
    @Inject(typeORMConsts.databaseProviders)
    private readonly dataSource: DataSource,
  ) {}

  async create(row: JourneyPositionModel) {
    await this.dataSource
      .getRepository(JourneyPositionModel)
      .insert(row.toJSON());
    return row;
  }

  async findLatestByJourneyId(journeyId: string) {
    const rows = await this.dataSource
      .getRepository(JourneyPositionModel)
      .find({
        where: { journeyId },
        order: { recordedAt: 'DESC' },
        take: 1,
      });
    return rows[0] ?? null;
  }
}
