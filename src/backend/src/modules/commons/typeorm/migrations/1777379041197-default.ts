import { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1777379041197 implements MigrationInterface {
  name = 'Default1777379041197';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD "foto_url" varchar(2048) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "foto_url"`);
  }
}
