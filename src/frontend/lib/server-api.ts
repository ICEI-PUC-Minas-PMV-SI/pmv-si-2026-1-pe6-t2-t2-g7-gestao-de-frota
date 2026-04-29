import "server-only";

import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE_NAME } from "@/lib/auth-session";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function serverFetchJson<T>(path: string): Promise<T | null> {
  const token = (await cookies()).get(AUTH_TOKEN_COOKIE_NAME)?.value;

  if (!token || !API_BASE) {
    return null;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}
