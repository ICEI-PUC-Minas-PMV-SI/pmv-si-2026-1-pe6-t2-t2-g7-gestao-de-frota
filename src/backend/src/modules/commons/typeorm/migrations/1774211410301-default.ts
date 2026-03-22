import { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1774211410301 implements MigrationInterface {
  name = 'Default1774211410301';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE "users_id_seq"`);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" INT DEFAULT nextval('"users_id_seq"') NOT NULL, "external_uid" varchar(64), "email" varchar(320) NOT NULL, "name" varchar(320), "role" varchar(20) NOT NULL, "provider" varchar(12) NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), CONSTRAINT "UQ_users_email" UNIQUE ("email"), CONSTRAINT "PK_users_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "vehicles" ("id" UUID DEFAULT gen_random_uuid() NOT NULL, "marca" varchar(255) NOT NULL, "modelo" varchar(255) NOT NULL, "ano" int8 NOT NULL, "placa" varchar(10) NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), CONSTRAINT "UQ_vehicles_placa" UNIQUE ("placa"), CONSTRAINT "PK_vehicles_id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "vehicles"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP SEQUENCE "users_id_seq"`);
  }
}
