"use client";

import Link from "next/link";
import { useAuth } from "@context/auth.context";
import { AlertTriangle, Car, LayoutDashboard, Map, Truck } from "lucide-react";

export default function HomepagePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <header className="shrink-0 border-b border-zinc-800 px-8 py-10">
        <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">
          Área logada
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Olá,{" "}
          <span className="text-indigo-400">
            {user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0]}
          </span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Central de operações Unitech: acompanhe frota, rotas e indicadores em
          um só lugar. Use o menu à esquerda ou os atalhos abaixo.
        </p>
      </header>

      <main className="flex-1 space-y-8 px-8 py-10">
        <section>
          <h2 className="text-sm font-medium text-zinc-500">Atalhos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard"
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-indigo-500/40 hover:bg-zinc-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/15 text-indigo-400 ring-1 ring-indigo-500/20">
                <LayoutDashboard className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-indigo-300">
                Dashboard
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Conta, token e dados da sessão.
              </p>
            </Link>

            <Link
              href="/map"
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-indigo-500/40 hover:bg-zinc-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-400 ring-1 ring-emerald-500/20">
                <Map className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-emerald-300">
                Mapa
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Planejamento de jornadas e rotas (demo).
              </p>
            </Link>

            <Link
              href="/vehicles"
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-amber-500/40 hover:bg-zinc-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600/15 text-amber-400 ring-1 ring-amber-500/20">
                <Car className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-amber-300">
                Veículos
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Gerencie cadastro, edição e exclusão da frota.
              </p>
            </Link>

            <Link
              href="/incidents"
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-rose-500/40 hover:bg-zinc-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-600/15 text-rose-400 ring-1 ring-rose-500/20">
                <AlertTriangle className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-rose-300">
                Incidentes
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Controle multas e sinistros dos veículos.
              </p>
            </Link>

            <Link
              href="/"
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-zinc-600 sm:col-span-2 lg:col-span-1"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700/40 text-zinc-300 ring-1 ring-zinc-600/50">
                <Truck className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                Página pública
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Landing institucional Unitech.
              </p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
