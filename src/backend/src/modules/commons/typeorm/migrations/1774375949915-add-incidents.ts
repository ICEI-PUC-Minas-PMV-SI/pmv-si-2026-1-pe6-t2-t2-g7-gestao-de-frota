import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIncidents1774375949915 implements MigrationInterface {
  name = 'AddIncidents1774375949915';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "incidents" ("id" UUID DEFAULT gen_random_uuid() NOT NULL, "vehicle_id" uuid NOT NULL, "tipo" varchar(24) NOT NULL, "descricao" varchar(1024) NOT NULL, "valor" numeric, "data" timestamptz NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), CONSTRAINT "PK_incidents_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "incidents" ADD CONSTRAINT "FK_incidents_vehicle_id" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "incidents" DROP CONSTRAINT "FK_incidents_vehicle_id"`,
    );
    await queryRunner.query(`DROP TABLE "incidents"`);
  }
}
