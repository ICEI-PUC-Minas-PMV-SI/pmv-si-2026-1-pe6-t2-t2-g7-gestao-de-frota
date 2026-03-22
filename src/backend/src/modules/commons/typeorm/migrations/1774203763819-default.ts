import { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1774203763819 implements MigrationInterface {
  name = 'Default1774203763819';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE "users_id_seq"`);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" INT DEFAULT nextval('"users_id_seq"') NOT NULL, "email" varchar(320) NOT NULL, "name" varchar(320), "role" varchar(20) NOT NULL, "provider" varchar(12) NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), CONSTRAINT "UQ_users_email" UNIQUE ("email"), CONSTRAINT "PK_users_id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP SEQUENCE "users_id_seq"`);
  }
}
