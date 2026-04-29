"use client";

import Link from "next/link";
import { useAuth } from "@context/auth.context";
import { AlertTriangle, Car, LayoutDashboard, Map, Truck } from "lucide-react";

export default function HomepagePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <header className="shrink-0 border-b border-border px-8 py-10">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">
          Área logada
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Olá,{" "}
          <span className="text-primary">
            {user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0]}
          </span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Central de operações Unitech: acompanhe frota, rotas e indicadores em
          um só lugar. Use o menu à esquerda ou os atalhos abaixo.
        </p>
      </header>

      <main className="flex-1 space-y-8 px-8 py-10">
        <section>
          <h2 className="text-sm font-medium text-muted-foreground">Atalhos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard"
              className="group rounded-xl border border-border bg-card p-6 transition hover:border-primary/40 hover:bg-accent/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
                <LayoutDashboard className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary">
                Dashboard
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Conta, token e dados da sessão.
              </p>
            </Link>

            <Link
              href="/map"
              className="group rounded-xl border border-border bg-card p-6 transition hover:border-primary/40 hover:bg-accent/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
                <Map className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary">
                Mapa
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Planejamento de jornadas e rotas (demo).
              </p>
            </Link>

            <Link
              href="/vehicles"
              className="group rounded-xl border border-border bg-card p-6 transition hover:border-primary/40 hover:bg-accent/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
                <Car className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary">
                Veículos
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Gerencie cadastro, edição e exclusão da frota.
              </p>
            </Link>

            <Link
              href="/incidents"
              className="group rounded-xl border border-border bg-card p-6 transition hover:border-primary/40 hover:bg-accent/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
                <AlertTriangle className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary">
                Incidentes
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Controle multas e sinistros dos veículos.
              </p>
            </Link>

            <Link
              href="/"
              className="group rounded-xl border border-border bg-card p-6 transition hover:border-primary/40 hover:bg-accent/30 sm:col-span-2 lg:col-span-1"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-border">
                <Truck className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Página pública
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Landing institucional Unitech.
              </p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
