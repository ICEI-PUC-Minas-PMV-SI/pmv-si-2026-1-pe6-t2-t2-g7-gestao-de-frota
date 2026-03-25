"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@context/auth.context";

export default function DashboardPage() {
  const { user } = useAuth();
  const [token, setToken] = useState<string>();

  useEffect(() => {
    user?.getIdToken().then((idToken) => setToken(idToken));
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <header className="shrink-0 border-b border-zinc-800 px-8 py-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Bem-vindo de volta,{" "}
          <span className="text-indigo-400">
            {user.displayName ?? user.email}
          </span>
        </p>
      </header>

      <main className="flex-1 space-y-6 px-8 py-8">
        <div className="mx-auto grid max-w-4xl gap-4 grid-cols-1">
          {[
            { label: "ID Token", value: token },
            { label: "UID", value: user.uid },
            {
              label: "Provedor",
              value: user.providerData[0]?.providerId ?? "—",
            },
            {
              label: "E-mail verificado",
              value: user.emailVerified ? "Sim" : "Não",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4"
            >
              <p className="text-xs text-zinc-500 uppercase tracking-widest">
                {label}
              </p>
              <p className="mt-1 truncate text-sm font-medium text-white">
                {value}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
