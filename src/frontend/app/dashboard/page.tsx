"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@context/auth.context";
import { DashboardHeader } from "@components/dashboard/DashboardHeader";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [token, setToken] = useState<string>()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
    user?.getIdToken().then(idToken => setToken(idToken))
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <DashboardHeader />

      <main className="mx-auto max-w-4xl px-6 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Bem-vindo de volta,{" "}
            <span className="text-indigo-400">
              {user.displayName ?? user.email}
            </span>
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1">
          {[
            { label: "ID Token", value: token },
            { label: "UID", value: user.uid },
            { label: "Provedor", value: user.providerData[0]?.providerId ?? "—" },
            { label: "E-mail verificado", value: user.emailVerified ? "Sim" : "Não" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4"
            >
              <p className="text-xs text-zinc-500 uppercase tracking-widest">{label}</p>
              <p className="mt-1 text-sm font-medium text-white truncate">{value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
