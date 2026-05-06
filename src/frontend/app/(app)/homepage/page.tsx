"use client";

import Link from "next/link";
import { useAuth } from "@context/auth.context";
import {
  AlertTriangle,
  ArrowRight,
  Car,
  LayoutDashboard,
  Map,
  ShieldCheck,
  Truck,
} from "lucide-react";

export default function HomepagePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <header className="shrink-0 border-b border-border/70 px-8 py-8">
        <div className="rounded-2xl border border-border/80 bg-linear-to-br from-card via-card to-primary/5 px-6 py-7 shadow-sm">
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
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Monitoramento contínuo
            </span>
            <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              Operação em tempo real
            </span>
            <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              Decisões guiadas por dados
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-8 px-8 py-10">
        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">Atalhos</h2>
            <span className="text-xs text-muted-foreground">Acesso rápido aos módulos principais</span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard"
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/30 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20 transition group-hover:scale-105">
                <LayoutDashboard className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary">Dashboard</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Visão consolidada de desempenho, disponibilidade e eventos.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                Abrir módulo
                <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>

            <Link
              href="/map"
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/30 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20 transition group-hover:scale-105">
                <Map className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary">Mapa</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Planejamento de jornadas, trajetos e pontos de atenção.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                Abrir módulo
                <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>

            <Link
              href="/vehicles"
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/30 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20 transition group-hover:scale-105">
                <Car className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary">Veículos</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Gerencie cadastro, edição e exclusão da frota.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                Abrir módulo
                <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>

            <Link
              href="/incidents"
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/30 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20 transition group-hover:scale-105">
                <AlertTriangle className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary">Incidentes</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Controle multas e sinistros dos veículos.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                Abrir módulo
                <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>

            <Link
              href="/"
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/30 hover:shadow-md sm:col-span-2 lg:col-span-1"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-border">
                <Truck className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Página pública</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Landing institucional Unitech.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                Visualizar landing
                <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Operação estável</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Todos os serviços principais estão respondendo normalmente. Última verificação concluída há 2 minutos.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
