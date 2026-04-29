"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@context/auth.context";
import { constants } from "@core/contants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  Car,
  CheckCircle2,
  Clock4,
  FileText,
  Fingerprint,
  Gauge,
  KeyRound,
  Mail,
  ShieldCheck,
  Wallet,
} from "lucide-react";

export type Vehicle = {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  ano: number;
  fotoUrl: string;
  tamanhoTanque: number;
  consumoMedio: number;
};

export type IncidentStatus = "aberto" | "em_analise" | "resolvido" | "cancelado";
export type IncidentSeverity = "baixa" | "media" | "alta" | "critica";
export type IncidentType = "multa" | "sinistro";

export type Incident = {
  id: string;
  vehicleId: string;
  tipo: IncidentType;
  status: IncidentStatus;
  severidade: IncidentSeverity;
  descricao: string;
  valor?: number;
  data: string;
};

const SEVERITY_LABEL: Record<IncidentSeverity, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

const SEVERITY_TONE: Record<
  IncidentSeverity,
  { dot: string; bg: string; text: string; ring: string }
> = {
  baixa: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-500/30",
  },
  media: {
    dot: "bg-amber-500",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    ring: "ring-amber-500/30",
  },
  alta: {
    dot: "bg-orange-500",
    bg: "bg-orange-500/10",
    text: "text-orange-700 dark:text-orange-300",
    ring: "ring-orange-500/30",
  },
  critica: {
    dot: "bg-red-500",
    bg: "bg-red-500/10",
    text: "text-red-700 dark:text-red-300",
    ring: "ring-red-500/30",
  },
};

const STATUS_TONE: Record<
  IncidentStatus,
  { bg: string; text: string; label: string }
> = {
  aberto: {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    label: "Aberto",
  },
  em_analise: {
    bg: "bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-300",
    label: "Em análise",
  },
  resolvido: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "Resolvido",
  },
  cancelado: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    label: "Cancelado",
  },
};

function formatCurrency(value: number | undefined) {
  if (typeof value !== "number") return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatRelative(date: string) {
  const d = new Date(date).getTime();
  const diff = Date.now() - d;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h atrás`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d atrás`;
  return new Date(date).toLocaleDateString("pt-BR");
}

export default function DashboardPageClient({
  initialVehicles = [],
  initialIncidents = [],
  initialRefreshedAt = null,
}: {
  initialVehicles?: Vehicle[];
  initialIncidents?: Incident[];
  initialRefreshedAt?: string | null;
}) {
  const { user } = useAuth();
  const [token, setToken] = useState<string>();
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(
    initialRefreshedAt ? new Date(initialRefreshedAt) : null,
  );

  const authHeaders = useCallback(async () => {
    const idToken = await user?.getIdToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    };
  }, [user]);

  const loadAll = useCallback(async () => {
    if (!user) return;
    try {
      const headers = await authHeaders();
      const [vRes, iRes] = await Promise.all([
        fetch(`${constants.API_BASE}/vehicle`, { headers }),
        fetch(`${constants.API_BASE}/incident`, { headers }),
      ]);
      const [v, i] = await Promise.all([vRes.json(), iRes.json()]);
      if (Array.isArray(v)) setVehicles(v);
      if (Array.isArray(i)) setIncidents(i);
      setRefreshedAt(new Date());
    } catch {
      /* silencioso — já existem mensagens nas telas dedicadas */
    } finally {
    }
  }, [authHeaders, user]);

  useEffect(() => {
    user?.getIdToken().then((idToken) => setToken(idToken));
  }, [user]);

  useEffect(() => {
    if (initialVehicles.length === 0 || initialIncidents.length === 0) {
      void loadAll();
    }
  }, [initialIncidents.length, initialVehicles.length, loadAll]);

  const stats = useMemo(() => {
    const byStatus: Record<IncidentStatus, number> = {
      aberto: 0,
      em_analise: 0,
      resolvido: 0,
      cancelado: 0,
    };
    const bySeverity: Record<IncidentSeverity, number> = {
      baixa: 0,
      media: 0,
      alta: 0,
      critica: 0,
    };
    let multasValor = 0;
    let multasCount = 0;
    let sinistrosCount = 0;

    for (const inc of incidents) {
      byStatus[inc.status]++;
      bySeverity[inc.severidade]++;
      if (inc.tipo === "multa") {
        multasCount++;
        if (typeof inc.valor === "number") multasValor += inc.valor;
      } else {
        sinistrosCount++;
      }
    }

    const total = incidents.length;
    const ativos = byStatus.aberto + byStatus.em_analise;
    const resolvidos = byStatus.resolvido;
    const taxaResolucao = total > 0 ? Math.round((resolvidos / total) * 100) : 0;

    return {
      total,
      ativos,
      resolvidos,
      taxaResolucao,
      byStatus,
      bySeverity,
      multasValor,
      multasCount,
      sinistrosCount,
    };
  }, [incidents]);

  const recentIncidents = useMemo(() => {
    const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
    return [...incidents]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5)
      .map((inc) => ({ ...inc, vehicle: vehicleById.get(inc.vehicleId) }));
  }, [incidents, vehicles]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  })();

  const firstName =
    (user as any).displayName?.split(" ")[0] ?? (user as any).email?.split("@")[0] ?? "operador";

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background">
      <header className="shrink-0 border-b border-border bg-gradient-to-b from-primary/[0.04] to-transparent px-6 py-7 sm:px-8 sm:py-9">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Painel da frota
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {greeting},{" "}
              <span className="text-primary">{firstName}</span>
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
			  Visão geral da operação: veículos, incidentes em andamento e
              indicadores que merecem sua atenção agora.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline-flex">
              {refreshedAt
                ? `Atualizado às ${refreshedAt.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "—"}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-8 px-6 py-7 sm:px-8 sm:py-8">
        {/* KPI strip */}
        <section
          aria-label="Indicadores principais"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <KpiCard
            label="Frota cadastrada"
            value={vehicles.length}
            unit="veículos"
            icon={Car}
            tone="primary"
            href="/vehicles"
            hint={
              vehicles.length === 0
                ? "Cadastre seu primeiro veículo"
                : "Catálogo completo"
            }
          />
          <KpiCard
            label="Incidentes ativos"
            value={stats.ativos}
            unit={stats.ativos === 1 ? "em andamento" : "em andamento"}
            icon={AlertTriangle}
            tone="amber"
            href="/incidents"
            hint={`${stats.byStatus.aberto} abertos · ${stats.byStatus.em_analise} em análise`}
          />
          <KpiCard
            label="Casos críticos"
            value={stats.bySeverity.critica + stats.bySeverity.alta}
            unit="alta severidade"
            icon={AlertOctagon}
            tone="red"
            href="/incidents"
            hint={`${stats.bySeverity.critica} críticos · ${stats.bySeverity.alta} altos`}
          />
          <KpiCard
            label="Taxa de resolução"
            value={stats.taxaResolucao}
            unit="%"
            icon={ShieldCheck}
            tone="emerald"
            hint={`${stats.resolvidos} de ${stats.total} encerrados`}
          />
        </section>

        {/* Main grid */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Recent incidents */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card lg:col-span-2">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Incidentes recentes
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Últimos registros lançados pela equipe.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/incidents">
                  Ver todos
                  <ArrowUpRight aria-hidden />
                </Link>
              </Button>
            </div>

            {recentIncidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Nenhum incidente registrado
                </p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Quando uma multa ou sinistro for criado, ele aparece aqui em
                  ordem cronológica.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentIncidents.map((inc) => {
                  const sev = SEVERITY_TONE[inc.severidade];
                  const status = STATUS_TONE[inc.status];
                  return (
                    <li
                      key={inc.id}
                      className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-accent/40"
                    >
                      <span
                        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${sev.bg} ${sev.text} ${sev.ring}`}
                      >
                        {inc.tipo === "multa" ? (
                          <FileText className="h-4 w-4" aria-hidden />
                        ) : (
                          <AlertTriangle className="h-4 w-4" aria-hidden />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-foreground">
                            {inc.tipo === "multa" ? "Multa" : "Sinistro"} ·{" "}
                            {inc.vehicle
                              ? `${inc.vehicle.marca} ${inc.vehicle.modelo}`
                              : "Veículo removido"}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.bg} ${status.text}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p
                          className="mt-0.5 truncate text-xs text-muted-foreground"
                          title={inc.descricao}
                        >
                          {inc.descricao || "Sem descrição"}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock4 className="h-3 w-3" aria-hidden />
                            {formatRelative(inc.data)}
                          </span>
                          {inc.vehicle?.placa && (
                            <span className="font-mono uppercase tracking-wider">
                              {inc.vehicle.placa}
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1 ${sev.text}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${sev.dot}`}
                              aria-hidden
                            />
                            {SEVERITY_LABEL[inc.severidade]}
                          </span>
                          {inc.tipo === "multa" &&
                            typeof inc.valor === "number" && (
                              <span>{formatCurrency(inc.valor)}</span>
                            )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <BreakdownCard title="Distribuição por status" total={stats.total}>
              <BreakdownRow
                label="Aberto"
                value={stats.byStatus.aberto}
                total={stats.total}
                color="bg-amber-500"
              />
              <BreakdownRow
                label="Em análise"
                value={stats.byStatus.em_analise}
                total={stats.total}
                color="bg-sky-500"
              />
              <BreakdownRow
                label="Resolvido"
                value={stats.byStatus.resolvido}
                total={stats.total}
                color="bg-emerald-500"
              />
              <BreakdownRow
                label="Cancelado"
                value={stats.byStatus.cancelado}
                total={stats.total}
                color="bg-muted-foreground/40"
              />
            </BreakdownCard>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Tipos de incidente
                </h3>
                <Badge variant="outline">{stats.total} total</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <TypeTile
                  label="Multas"
                  value={stats.multasCount}
                  helper={formatCurrency(stats.multasValor)}
                  icon={Wallet}
                  tone="amber"
                />
                <TypeTile
                  label="Sinistros"
                  value={stats.sinistrosCount}
                  helper="Eventos registrados"
                  icon={AlertTriangle}
                  tone="red"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Fleet snapshot */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Snapshot da frota
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {vehicles.length === 0
                  ? "Cadastre veículos para ver o resumo aqui."
                  : `Resumo dos ${Math.min(vehicles.length, 6)} primeiros veículos.`}
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/vehicles">
                Ver veículos
                <ArrowUpRight aria-hidden />
              </Link>
            </Button>
          </div>

          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                <Car className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-3 text-sm font-medium text-foreground">
                Nenhum veículo na frota
              </p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Adicione seu primeiro veículo na página de Veículos.
              </p>
              <Button asChild size="sm" className="mt-4">
                <Link href="/vehicles">Ir para Veículos</Link>
              </Button>
            </div>
          ) : (
            <ul className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.slice(0, 6).map((v) => (
                <li
                  key={v.id}
                  className="group/vehicle flex items-center gap-3 rounded-xl border border-border bg-background p-2.5 transition-colors hover:border-primary/35 hover:bg-accent/30"
                >
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.fotoUrl}
                      alt={`${v.marca} ${v.modelo}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover/vehicle:scale-[1.04]"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src =
                          "https://images.unsplash.com/photo-1485463618014-fdf5a38de5f2?auto=format&fit=crop&w=600&q=60";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {v.marca} {v.modelo}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {v.placa} · {v.ano}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Gauge className="h-3 w-3" aria-hidden />
                        {v.consumoMedio} km/L
                      </span>
                      <Separator orientation="vertical" className="h-3" />
                      <span>{v.tamanhoTanque} L</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

type Tone = "primary" | "amber" | "red" | "emerald";
const TONE_CLASS: Record<Tone, { chip: string; text: string; ring: string }> = {
  primary: {
    chip: "bg-primary/10 text-primary",
    text: "text-primary",
    ring: "ring-primary/20",
  },
  amber: {
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    text: "text-amber-600 dark:text-amber-300",
    ring: "ring-amber-500/20",
  },
  red: {
    chip: "bg-red-500/10 text-red-600 dark:text-red-300",
    text: "text-red-600 dark:text-red-300",
    ring: "ring-red-500/20",
  },
  emerald: {
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    text: "text-emerald-600 dark:text-emerald-300",
    ring: "ring-emerald-500/20",
  },
};

function KpiCard({
  label,
  value,
  unit,
  icon: Icon,
  tone,
  hint,
  href,
}: {
  label: string;
  value: number;
  unit: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tone: Tone;
  hint?: string;
  href?: string;
}) {
  const tones = TONE_CLASS[tone];
  const inner = (
    <div className="group/kpi relative flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-px hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${tones.chip} ${tones.ring}`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        {href && (
          <ArrowUpRight
            className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover/kpi:opacity-100"
            aria-hidden
          />
        )}
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="font-heading text-3xl font-semibold tabular-nums text-foreground">
            {value}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
        {hint && (
          <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block focus-visible:outline-none">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function BreakdownCard({
  title,
  total,
  children,
}: {
  title: string;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <Badge variant="outline">{total} total</Badge>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground tabular-nums">
          {value}
          <span className="ml-1 text-muted-foreground">· {pct}%</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${color} transition-[width] duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TypeTile({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  helper: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tone: Tone;
}) {
  const tones = TONE_CLASS[tone];
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-md ring-1 ${tones.chip} ${tones.ring}`}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </span>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 font-heading text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
        {helper}
      </p>
    </div>
  );
}
