export type MemberRole = "owner" | "admin" | "user";

export type Member = {
  id: number;
  uid?: string;
  email: string;
  name?: string;
  provider: string;
  role: MemberRole;
  createdAt: string;
  updatedAt: string;
};

export type MembersResponse = {
  list: Member[];
  total: number;
};
