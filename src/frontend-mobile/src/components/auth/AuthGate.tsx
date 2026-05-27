import { Redirect } from "expo-router";
import { ReactNode } from "react";

import { useAuth } from "../../context/auth.context";
import { ScreenLoader } from "../ui/ScreenLoader";

type Mode = "guest" | "auth";

/** guest: só visitantes (login/signup). auth: só logados (área app). */
export function AuthGate({
  mode,
  children,
}: {
  mode: Mode;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <ScreenLoader message="Carregando sessão..." />;
  }

  if (mode === "guest" && user) {
    return <Redirect href="/(app)/homepage" />;
  }

  if (mode === "auth" && !user) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}
