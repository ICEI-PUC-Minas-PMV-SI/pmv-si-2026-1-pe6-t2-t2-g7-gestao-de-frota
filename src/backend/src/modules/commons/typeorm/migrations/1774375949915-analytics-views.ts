import { MigrationInterface, QueryRunner } from 'typeorm';

export class AnalyticsViews1774375949915 implements MigrationInterface {
  name = 'AnalyticsViews1774375949915';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE VIEW "vw_journeys_users" AS
      SELECT
        j.id AS journey_id,
        j.name AS journey_name,
        j.status,
        j.started_at,
        j.created_at,
        j.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email,
        u.role,
        u.provider
      FROM public.journeys j
      LEFT JOIN public.users u ON j.user_id = u.id
    `);

    await queryRunner.query(`
      CREATE VIEW "vw_analytics_users" AS
      SELECT
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        u.created_at AS member_since,
        COUNT(j.id) AS total_journeys,
        COUNT(CASE WHEN j.status = 'in_progress' THEN 1 END) AS active_journeys,
        COUNT(CASE WHEN j.status = 'finished' THEN 1 END) AS completed_journeys,
        MIN(j.started_at) AS first_journey,
        MAX(j.started_at) AS last_journey
      FROM public.users u
      LEFT JOIN public.journeys j ON u.id = j.user_id
      GROUP BY u.id, u.name, u.email, u.role, u.created_at
    `);

    await queryRunner.query(`
      CREATE VIEW "vw_analytics_journey_stops" AS
      SELECT
        j.id AS journey_id,
        j.name AS journey_name,
        j.status,
        j.user_id,
        u.name AS user_name,
        COUNT(js.id) AS total_stops,
        MIN(js.created_at) AS first_stop,
        MAX(js.created_at) AS last_stop
      FROM public.journeys j
      LEFT JOIN public.users u ON j.user_id = u.id
      LEFT JOIN public.journey_stops js ON j.id = js.journey_id
      GROUP BY j.id, j.name, j.status, j.user_id, u.name
    `);

    await queryRunner.query(`
      CREATE VIEW "vw_analytics_journey_positions" AS
      SELECT
        j.id AS journey_id,
        j.name AS journey_name,
        j.status,
        u.name AS user_name,
        COUNT(jp.id) AS total_positions,
        MIN(jp.recorded_at) AS tracking_start,
        MAX(jp.recorded_at) AS tracking_end,
        MIN(jp.latitude) AS lat_min,
        MAX(jp.latitude) AS lat_max,
        MIN(jp.longitude) AS lon_min,
        MAX(jp.longitude) AS lon_max
      FROM public.journeys j
      LEFT JOIN public.users u ON j.user_id = u.id
      LEFT JOIN public.journey_positions jp ON j.id = jp.journey_id
      GROUP BY j.id, j.name, j.status, u.name
    `);

    await queryRunner.query(`
      CREATE VIEW "vw_analytics_dashboard" AS
      SELECT
        COUNT(DISTINCT u.id) AS total_users,
        COUNT(DISTINCT j.id) AS total_journeys,
        COUNT(CASE WHEN j.status = 'in_progress' THEN 1 END) AS active_journeys,
        COUNT(CASE WHEN j.status = 'finished' THEN 1 END) AS completed_journeys,
        COUNT(DISTINCT js.id) AS total_stops,
        COUNT(DISTINCT jp.id) AS total_positions
      FROM public.users u
      LEFT JOIN public.journeys j ON u.id = j.user_id
      LEFT JOIN public.journey_stops js ON j.id = js.journey_id
      LEFT JOIN public.journey_positions jp ON j.id = jp.journey_id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS "vw_analytics_dashboard"`);
    await queryRunner.query(
      `DROP VIEW IF EXISTS "vw_analytics_journey_positions"`,
    );
    await queryRunner.query(`DROP VIEW IF EXISTS "vw_analytics_journey_stops"`);
    await queryRunner.query(`DROP VIEW IF EXISTS "vw_analytics_users"`);
    await queryRunner.query(`DROP VIEW IF EXISTS "vw_journeys_users"`);
  }
}
