import { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1774207395022 implements MigrationInterface {
  name = 'Default1774207395022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "external_uid" varchar(64)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "external_uid"`);
  }
}
