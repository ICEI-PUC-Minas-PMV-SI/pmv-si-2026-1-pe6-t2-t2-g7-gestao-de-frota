import { Global, Module } from '@nestjs/common';
import { databaseProviders } from './Database.provider';
import { typeORMEntitiesProviders } from './Entities.provider';

@Global()
@Module({
  providers: [...databaseProviders, ...typeORMEntitiesProviders],
  exports: [...databaseProviders, ...typeORMEntitiesProviders],
})
export class TypeORModule {}
