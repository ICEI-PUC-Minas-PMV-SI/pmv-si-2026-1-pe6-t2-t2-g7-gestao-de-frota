import { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1773678670182 implements MigrationInterface {
  name = 'Default1773678670182';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "name" character varying(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
  }
}
