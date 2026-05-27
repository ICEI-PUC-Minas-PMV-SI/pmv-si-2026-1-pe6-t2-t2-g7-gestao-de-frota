export type ApiUser = {
  id: number;
  uid: string;
  email: string;
  name: string;
  provider: string;
  role: "owner" | "admin" | "user" | "not_provided";
  createdAt: string;
  updatedAt: string;
};
