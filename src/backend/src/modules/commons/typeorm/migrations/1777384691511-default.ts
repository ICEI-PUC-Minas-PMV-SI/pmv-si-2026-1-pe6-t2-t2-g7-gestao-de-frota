import { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1777384691511 implements MigrationInterface {
  name = 'Default1777384691511';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "incidents" ADD "status" varchar(24) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "incidents" ADD "severidade" varchar(24) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "incidents" ADD "codigo_infracao" varchar(128)`,
    );
    await queryRunner.query(
      `ALTER TABLE "incidents" ADD "local_infracao" varchar(512)`,
    );
    await queryRunner.query(
      `ALTER TABLE "incidents" ADD "natureza" varchar(255)`,
    );
    await queryRunner.query(`ALTER TABLE "incidents" ADD "local" varchar(512)`);
    await queryRunner.query(
      `ALTER TABLE "vehicles" ALTER COLUMN "tamanho_tanque" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ALTER COLUMN "consumo_medio" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "journeys" ALTER COLUMN "km_rodados" SET DEFAULT (0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "journeys" ALTER COLUMN "combustivel_gasto" SET DEFAULT (0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "journeys" ALTER COLUMN "nivel_combustivel" SET DEFAULT (100)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "journeys" ALTER COLUMN "nivel_combustivel" SET DEFAULT (100.0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "journeys" ALTER COLUMN "combustivel_gasto" SET DEFAULT (0.0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "journeys" ALTER COLUMN "km_rodados" SET DEFAULT (0.0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ALTER COLUMN "consumo_medio" SET DEFAULT (10.0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ALTER COLUMN "tamanho_tanque" SET DEFAULT (50.0)`,
    );
    await queryRunner.query(`ALTER TABLE "incidents" DROP COLUMN "local"`);
    await queryRunner.query(`ALTER TABLE "incidents" DROP COLUMN "natureza"`);
    await queryRunner.query(
      `ALTER TABLE "incidents" DROP COLUMN "local_infracao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "incidents" DROP COLUMN "codigo_infracao"`,
    );
    await queryRunner.query(`ALTER TABLE "incidents" DROP COLUMN "severidade"`);
    await queryRunner.query(`ALTER TABLE "incidents" DROP COLUMN "status"`);
  }
}
