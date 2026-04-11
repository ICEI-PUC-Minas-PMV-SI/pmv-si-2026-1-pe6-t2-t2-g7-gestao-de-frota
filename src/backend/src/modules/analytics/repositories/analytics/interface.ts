export type DashboardViewRow = {
  total_users: string;
  total_vehicles: string;
  total_journeys: string;
  journeys_in_progress: string;
  journeys_finished: string;
};

export type UsersAnalyticsViewRow = {
  user_id: string;
  name: string;
  email: string;
  role: string;
  total_journeys: string;
  journeys_in_progress: string;
  journeys_finished: string;
};

export type JourneysAnalyticsViewRow = {
  journey_id: string;
  journey_name: string;
  status: string;
  started_at: string;
  user_id: string;
  user_name: string;
  user_email: string;
};

export abstract class AnalyticsRepo {
  abstract getDashboard(): Promise<DashboardViewRow>;
  abstract getUsersAnalytics(): Promise<UsersAnalyticsViewRow[]>;
  abstract getJourneysAnalytics(): Promise<JourneysAnalyticsViewRow[]>;
}
