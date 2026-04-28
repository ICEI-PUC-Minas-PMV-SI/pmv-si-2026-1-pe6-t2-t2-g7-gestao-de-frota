import { Inject, Injectable } from '@nestjs/common';
import { typeORMConsts } from 'src/modules/commons/typeorm/consts';
import { DataSource } from 'typeorm';
import { JourneyRepo } from './interface';
import { JourneyModel } from '../../models/Journey.model';
import { JourneyStopModel } from '../../models/JourneyStop.model';

@Injectable()
export class JourneyRepoImpl implements JourneyRepo {
  constructor(
    @Inject(typeORMConsts.databaseProviders)
    private readonly dataSource: DataSource,
  ) {}

  async createWithStops(
    journey: JourneyModel,
    stops: JourneyStopModel[],
  ): Promise<{ journey: JourneyModel; stops: JourneyStopModel[] }> {
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(JourneyModel).insert(journey.toJSON());
      for (const stop of stops) {
        await manager.getRepository(JourneyStopModel).insert(stop.toJSON());
      }
    });
    return { journey, stops };
  }

  async findByIdForUser(id: string, userId: number) {
    return await this.dataSource.getRepository(JourneyModel).findOneBy({
      id,
      userId,
    });
  }

  async update(journey: JourneyModel) {
    const changes = journey.toJSON();
    Reflect.deleteProperty(changes, 'id');
    Reflect.deleteProperty(changes, 'createdAt');
    Reflect.deleteProperty(changes, 'updatedAt');

    await this.dataSource
      .getRepository(JourneyModel)
      .update({ id: journey.id }, changes);

    return journey;
  }

  async findByVehicleId(vehicleId: string) {
    return await this.dataSource.getRepository(JourneyModel).find({
      where: { vehicleId },
      order: { startedAt: 'DESC' },
    });
  }

  async findStopsByJourneyId(journeyId: string) {
    return await this.dataSource.getRepository(JourneyStopModel).find({
      where: { journeyId },
      order: { stopOrder: 'ASC' },
    });
  }
}
