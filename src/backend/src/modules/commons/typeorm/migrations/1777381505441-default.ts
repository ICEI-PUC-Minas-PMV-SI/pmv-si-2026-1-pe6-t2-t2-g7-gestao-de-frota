import { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1777381505441 implements MigrationInterface {
  name = 'Default1777381505441';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "telemetry" DROP COLUMN IF EXISTS "journey_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" DROP COLUMN IF EXISTS "latitude"`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" DROP COLUMN IF EXISTS "longitude"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "tamanho_tanque" float8 NOT NULL DEFAULT (50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "consumo_medio" float8 NOT NULL DEFAULT (10)`,
    );
    await queryRunner.query(
      `ALTER TABLE "journeys" ADD COLUMN IF NOT EXISTS "km_rodados" float8 NOT NULL DEFAULT (0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "journeys" ADD COLUMN IF NOT EXISTS "combustivel_gasto" float8 NOT NULL DEFAULT (0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "journeys" ADD COLUMN IF NOT EXISTS "nivel_combustivel" float8 NOT NULL DEFAULT (100)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "journeys" DROP COLUMN IF EXISTS "nivel_combustivel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "journeys" DROP COLUMN IF EXISTS "combustivel_gasto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "journeys" DROP COLUMN IF EXISTS "km_rodados"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "consumo_medio"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "tamanho_tanque"`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ADD COLUMN IF NOT EXISTS "longitude" float8 NOT NULL DEFAULT (0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ADD COLUMN IF NOT EXISTS "latitude" float8 NOT NULL DEFAULT (0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "telemetry" ADD COLUMN IF NOT EXISTS "journey_id" uuid NOT NULL DEFAULT gen_random_uuid()`,
    );
  }
}
