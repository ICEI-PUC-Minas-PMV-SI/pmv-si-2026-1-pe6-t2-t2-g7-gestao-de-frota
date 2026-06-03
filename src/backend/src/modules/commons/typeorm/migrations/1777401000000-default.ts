import { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1777401000000 implements MigrationInterface {
  name = 'Default1777401000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "user_id" int8`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "user_id"`,
    );
  }
}
