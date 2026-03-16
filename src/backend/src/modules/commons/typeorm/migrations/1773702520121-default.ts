import { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1773702520121 implements MigrationInterface {
  name = 'Default1773702520121';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "created_at" timestamptz NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" timestamptz NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD CONSTRAINT "UQ_00f176cfec58c116bac5a4a27ed" UNIQUE ("placa")`,
    );
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD "created_at" timestamptz NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD "updated_at" timestamptz NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD "updated_at" timestamp NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD "created_at" timestamp NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `DROP INDEX "vehicles"@"UQ_00f176cfec58c116bac5a4a27ed" CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" timestamp NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "created_at" timestamp NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
  }
}
