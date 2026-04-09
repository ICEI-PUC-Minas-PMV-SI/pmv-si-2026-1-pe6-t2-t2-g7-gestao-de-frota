import { MigrationInterface, QueryRunner } from 'typeorm';

export class Telemetry1774375949915 implements MigrationInterface {
  name = 'Telemetry1774375949915';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "telemetry" ("id" UUID DEFAULT gen_random_uuid() NOT NULL, "journey_id" uuid NOT NULL, "vehicle_id" uuid NOT NULL, "km_rodados" float8 NOT NULL, "combustivel_gasto" float8 NOT NULL, "nivel_combustivel" float8 NOT NULL, "latitude" float8 NOT NULL, "longitude" float8 NOT NULL, "rpm" float8 NOT NULL, "recorded_at" timestamptz NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), CONSTRAINT "PK_telemetry_id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "telemetry"`);
  }
}
