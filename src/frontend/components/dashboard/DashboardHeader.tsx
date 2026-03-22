"use client";

import { useAuth } from "@context/auth.context";


export function DashboardHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
      <span className="text-white font-semibold tracking-tight">✦ MyApp</span>

      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-400">{user?.email}</span>
        <button
          onClick={logout}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
