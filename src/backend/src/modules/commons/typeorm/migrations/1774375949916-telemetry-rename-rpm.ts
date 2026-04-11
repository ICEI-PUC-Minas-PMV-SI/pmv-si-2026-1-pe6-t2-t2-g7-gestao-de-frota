import { MigrationInterface, QueryRunner } from 'typeorm';

export class TelemetryRenameRpm1774375949916 implements MigrationInterface {
  name = 'TelemetryRenameRpm1774375949916';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "telemetry" RENAME COLUMN "rpm" TO "velocidade_media"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "telemetry" RENAME COLUMN "velocidade_media" TO "rpm"`,
    );
  }
}
