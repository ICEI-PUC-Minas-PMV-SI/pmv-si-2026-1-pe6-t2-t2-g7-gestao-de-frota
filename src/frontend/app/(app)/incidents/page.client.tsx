"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@context/auth.context";
import { constants } from "@core/contants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  Hash,
  Inbox,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

type IncidentType = "multa" | "sinistro";
type IncidentStatus = "aberto" | "em_analise" | "resolvido" | "cancelado";
type IncidentSeverity = "baixa" | "media" | "alta" | "critica";

type Incident = {
  id: string;
  vehicleId: string;
  tipo: IncidentType;
  status: IncidentStatus;
  severidade: IncidentSeverity;
  descricao: string;
  codigoInfracao?: string;
  valor?: number;
  localInfracao?: string;
  natureza?: string;
  local?: string;
  data: string;
  createdAt: string;
  updatedAt: string;
};

export type { Incident };

type Vehicle = {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
};

export type { Vehicle };

type VehicleOption = {
  value: string;
  label: string;
  search: string;
};

type IncidentForm = {
  vehicleId: string;
  tipo: IncidentType;
  status: IncidentStatus;
  severidade: IncidentSeverity;
  descricao: string;
  data: string;
  codigoInfracao: string;
  valor: string;
  localInfracao: string;
  natureza: string;
  local: string;
};

const defaultForm: IncidentForm = {
  vehicleId: "",
  tipo: "multa",
  status: "aberto",
  severidade: "media",
  descricao: "",
  data: "",
  codigoInfracao: "",
  valor: "",
  localInfracao: "",
  natureza: "",
  local: "",
};
const PAGE_SIZE = 10;
const VEHICLE_AUTOCOMPLETE_LIMIT = 50;

const STATUS_OPTIONS: { value: IncidentStatus; label: string }[] = [
  { value: "aberto", label: "Aberto" },
  { value: "em_analise", label: "Em análise" },
  { value: "resolvido", label: "Resolvido" },
  { value: "cancelado", label: "Cancelado" },
];

const SEVERITY_OPTIONS: { value: IncidentSeverity; label: string }[] = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

const STATUS_TONE: Record<
  IncidentStatus,
  { bg: string; text: string; ring: string; label: string }
> = {
  aberto: {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    ring: "ring-amber-500/20",
    label: "Aberto",
  },
  em_analise: {
    bg: "bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-300",
    ring: "ring-sky-500/20",
    label: "Em análise",
  },
  resolvido: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-500/20",
    label: "Resolvido",
  },
  cancelado: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    ring: "ring-border",
    label: "Cancelado",
  },
};

const SEVERITY_TONE: Record<
  IncidentSeverity,
  { dot: string; text: string; label: string }
> = {
  baixa: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "Baixa",
  },
  media: {
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    label: "Média",
  },
  alta: {
    dot: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-300",
    label: "Alta",
  },
  critica: {
    dot: "bg-red-500",
    text: "text-red-700 dark:text-red-300",
    label: "Crítica",
  },
};

function formatCurrency(value: number | undefined) {
  if (typeof value !== "number") return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function IncidentsPageClient({
  initialIncidents = [],
  initialVehicles = [],
}: {
  initialIncidents?: Incident[];
  initialVehicles?: Vehicle[];
}) {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null,
  );
  const [form, setForm] = useState<IncidentForm>(defaultForm);
  const [vehicleQuery, setVehicleQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Incident | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<"all" | IncidentType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | IncidentStatus>(
    "all",
  );
  const [filterSeverity, setFilterSeverity] = useState<"all" | IncidentSeverity>(
    "all",
  );
  const [vehicleAutocompleteOpen, setVehicleAutocompleteOpen] = useState(false);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);
  const deferredVehicleQuery = useDeferredValue(vehicleQuery);
  const vehicleOptions = useMemo<VehicleOption[]>(
    () =>
      vehicles.map((vehicle) => ({
        value: vehicle.id,
        label: `${vehicle.marca} ${vehicle.modelo} · ${vehicle.placa}`,
        search: `${vehicle.marca} ${vehicle.modelo} ${vehicle.placa}`.toLowerCase(),
      })),
    [vehicles],
  );
  const selectedVehicleOption = useMemo(
    () => vehicleOptions.find((option) => option.value === form.vehicleId) ?? null,
    [form.vehicleId, vehicleOptions],
  );
  const hasConfirmedVehicleSelection =
    selectedVehicleOption !== null &&
    vehicleQuery.trim() === selectedVehicleOption.label;
  const filteredVehicleOptions = useMemo(() => {
    const normalizedQuery = deferredVehicleQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return vehicleOptions.slice(0, VEHICLE_AUTOCOMPLETE_LIMIT);
    }

    return vehicleOptions
      .filter((option) => option.search.includes(normalizedQuery))
      .slice(0, VEHICLE_AUTOCOMPLETE_LIMIT);
  }, [deferredVehicleQuery, vehicleOptions]);
  const vehicleSelectionInvalid =
    vehicleQuery.trim().length > 0 && !hasConfirmedVehicleSelection;

  const authHeaders = useCallback(async () => {
    const idToken = await user?.getIdToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    };
  }, [user]);

  const loadVehicles = useCallback(async () => {
    const response = await fetch(`${constants.API_BASE}/vehicle`, {
      headers: await authHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message ?? "Erro ao carregar veículos.");
    }
    const nextVehicleId = form.vehicleId || "";
    const nextVehicle = data.find((vehicle: Vehicle) => vehicle.id === nextVehicleId);
    setVehicles(data);
    setForm((prev) => ({
      ...prev,
      vehicleId: nextVehicleId,
    }));
    setVehicleQuery(
      nextVehicle
        ? `${nextVehicle.marca} ${nextVehicle.modelo} · ${nextVehicle.placa}`
        : "",
    );
  }, [authHeaders, form.vehicleId]);

  const loadIncidents = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(`${constants.API_BASE}/incident`, {
        headers: await authHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Erro ao carregar incidentes.");
      }
      setIncidents(data);
      if (selectedIncident) {
        const updatedSelected = data.find(
          (item: Incident) => item.id === selectedIncident.id,
        );
        setSelectedIncident(updatedSelected ?? null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
    }
  }, [authHeaders, selectedIncident]);

  useEffect(() => {
    if (!user) return;
    if (initialVehicles.length === 0 || initialIncidents.length === 0) {
      void (async () => {
        if (initialVehicles.length === 0) await loadVehicles();
        if (initialIncidents.length === 0) await loadIncidents();
      })();
    }
  }, [
    initialIncidents.length,
    initialVehicles.length,
    user,
    loadVehicles,
    loadIncidents,
  ]);

  function clearForm() {
    setForm({
      ...defaultForm,
      vehicleId: "",
    });
    setVehicleQuery("");
    setEditingId(null);
  }

  function startCreate() {
    clearForm();
    setSuccess(null);
    setError(null);
    setVehicleAutocompleteOpen(false);
    setFormOpen(true);
  }

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function startEdit(incident: Incident) {
    const nextVehicle = vehicleOptions.find(
      (option) => option.value === incident.vehicleId,
    );
    setEditingId(incident.id);
    setForm({
      vehicleId: incident.vehicleId,
      tipo: incident.tipo,
      status: incident.status,
      severidade: incident.severidade,
      descricao: incident.descricao,
      data: new Date(incident.data).toISOString().slice(0, 16),
      codigoInfracao: incident.codigoInfracao ?? "",
      valor: incident.valor !== undefined ? String(incident.valor) : "",
      localInfracao: incident.localInfracao ?? "",
      natureza: incident.natureza ?? "",
      local: incident.local ?? "",
    });
    setVehicleQuery(nextVehicle?.label ?? "");
    setSuccess(null);
    setError(null);
    setVehicleAutocompleteOpen(false);
    setFormOpen(true);
  }

  function handleVehicleQueryChange(nextQuery: string) {
    setVehicleQuery(nextQuery);
    setVehicleAutocompleteOpen(true);
    if (selectedVehicleOption?.label !== nextQuery) {
      setForm((prev) => ({ ...prev, vehicleId: "" }));
    }
  }

  function handleVehicleSelect(option: VehicleOption) {
    setForm((prev) => ({
      ...prev,
      vehicleId: option.value,
    }));
    setVehicleQuery(option.label);
    setVehicleAutocompleteOpen(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!hasConfirmedVehicleSelection || !form.vehicleId) {
      setError("Selecione um veículo válido na lista.");
      return;
    }
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        vehicleId: form.vehicleId,
        tipo: form.tipo,
        status: form.status,
        severidade: form.severidade,
        descricao: form.descricao.trim(),
        data: form.data ? new Date(form.data).toISOString() : undefined,
      };
      if (form.tipo === "multa") {
        payload.codigoInfracao = form.codigoInfracao.trim() || undefined;
        payload.valor = form.valor ? Number(form.valor) : undefined;
        payload.localInfracao = form.localInfracao.trim() || undefined;
      } else {
        payload.natureza = form.natureza.trim() || undefined;
        payload.local = form.local.trim() || undefined;
      }

      const response = await fetch(
        isEditing
          ? `${constants.API_BASE}/incident/${editingId}`
          : `${constants.API_BASE}/incident`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: await authHeaders(),
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Erro ao salvar incidente.");
      }
      setSuccess(
        isEditing
          ? "Incidente atualizado com sucesso."
          : "Incidente criado com sucesso.",
      );
      clearForm();
      setFormOpen(false);
      await loadIncidents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusUpdate(
    incident: Incident,
    status: IncidentStatus,
  ) {
    try {
      const response = await fetch(
        `${constants.API_BASE}/incident/${incident.id}`,
        {
          method: "PATCH",
          headers: await authHeaders(),
          body: JSON.stringify({ status }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Erro ao atualizar status.");
      }
      setSuccess("Status atualizado com sucesso.");
      await loadIncidents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  }

  async function performDelete(incident: Incident) {
    setConfirmDelete(null);
    try {
      setError(null);
      setSuccess(null);
      const response = await fetch(
        `${constants.API_BASE}/incident/${incident.id}`,
        {
          method: "DELETE",
          headers: await authHeaders(),
        },
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message ?? "Erro ao remover incidente.");
      }
      if (selectedIncident?.id === incident.id) setSelectedIncident(null);
      setSuccess("Incidente removido com sucesso.");
      await loadIncidents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  }

  const vehicleById = useMemo(() => {
    return new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
  }, [vehicles]);

  const stats = useMemo(() => {
    const byStatus: Record<IncidentStatus, number> = {
      aberto: 0,
      em_analise: 0,
      resolvido: 0,
      cancelado: 0,
    };
    let critical = 0;
    let multasValor = 0;
    for (const inc of incidents) {
      byStatus[inc.status]++;
      if (inc.severidade === "critica" || inc.severidade === "alta") critical++;
      if (inc.tipo === "multa" && typeof inc.valor === "number")
        multasValor += inc.valor;
    }
    return {
      total: incidents.length,
      ...byStatus,
      critical,
      multasValor,
    };
  }, [incidents]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return incidents.filter((inc) => {
      if (filterType !== "all" && inc.tipo !== filterType) return false;
      if (filterStatus !== "all" && inc.status !== filterStatus) return false;
      if (filterSeverity !== "all" && inc.severidade !== filterSeverity)
        return false;
      if (!term) return true;
      const v = vehicleById.get(inc.vehicleId);
      const haystack = [
        inc.descricao,
        inc.codigoInfracao,
        inc.localInfracao,
        inc.local,
        inc.natureza,
        v?.placa,
        v?.marca,
        v?.modelo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [
    incidents,
    search,
    filterType,
    filterStatus,
    filterSeverity,
    vehicleById,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedIncidents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [search, filterType, filterStatus, filterSeverity, incidents.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const hasFilters =
    Boolean(search) ||
    filterType !== "all" ||
    filterStatus !== "all" ||
    filterSeverity !== "all";

  if (!user) return null;

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background">
      <header className="shrink-0 border-b border-border bg-gradient-to-b from-primary/[0.04] to-transparent px-6 py-7 sm:px-8 sm:py-9">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Operações
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Incidentes
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              Registre, acompanhe e atualize multas e sinistros da frota com
              filtros, busca e atualização rápida de status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={startCreate}>
              <Plus aria-hidden />
              Novo incidente
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-6 px-6 py-7 sm:px-8 sm:py-8">
        {/* KPIs */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile
            icon={Inbox}
            label="Total"
            value={stats.total}
            helper="Registros existentes"
            tone="primary"
          />
          <KpiTile
            icon={Clock}
            label="Ativos"
            value={stats.aberto + stats.em_analise}
            helper={`${stats.aberto} abertos · ${stats.em_analise} em análise`}
            tone="amber"
          />
          <KpiTile
            icon={AlertOctagon}
            label="Severidade alta"
            value={stats.critical}
            helper="Alta + crítica"
            tone="red"
          />
          <KpiTile
            icon={Wallet}
            label="Multas em valor"
            value={formatCurrency(stats.multasValor)}
            helper="Soma do valor"
            tone="emerald"
          />
        </section>

        {/* Banners */}
        {(error || success) && (
          <div className="space-y-2">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{success}</span>
              </div>
            )}
          </div>
        )}

        {/* Toolbar + table */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-foreground">
                  Tabela de incidentes
                </h2>
                <Badge variant="outline" className="font-mono">
                  {filtered.length}
                  {hasFilters && filtered.length !== incidents.length
                    ? ` / ${incidents.length}`
                    : ""}
                </Badge>
              </div>
              <div className="relative w-full sm:w-72">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por descrição, placa, código…"
                  className="pl-8"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Limpar busca"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <Filter className="h-3 w-3" aria-hidden />
                Filtros
              </span>
              <FilterChips
                value={filterType}
                onChange={(v) => setFilterType(v as "all" | IncidentType)}
                options={[
                  { value: "all", label: "Todos" },
                  { value: "multa", label: "Multas" },
                  { value: "sinistro", label: "Sinistros" },
                ]}
              />
              <span className="text-muted-foreground/40">·</span>
              <FilterChips
                value={filterStatus}
                onChange={(v) => setFilterStatus(v as "all" | IncidentStatus)}
                options={[
                  { value: "all", label: "Status" },
                  ...STATUS_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                  })),
                ]}
              />
              <span className="text-muted-foreground/40">·</span>
              <FilterChips
                value={filterSeverity}
                onChange={(v) =>
                  setFilterSeverity(v as "all" | IncidentSeverity)
                }
                options={[
                  { value: "all", label: "Severidade" },
                  ...SEVERITY_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                  })),
                ]}
              />
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setSearch("");
                    setFilterType("all");
                    setFilterStatus("all");
                    setFilterSeverity("all");
                  }}
                  className="ml-auto"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                <Inbox className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-3 text-sm font-medium text-foreground">
                {hasFilters
                  ? "Nenhum incidente encontrado com esses filtros"
                  : "Nenhum incidente cadastrado"}
              </p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {hasFilters
                  ? "Ajuste a busca ou limpe os filtros para ver mais registros."
                  : "Crie seu primeiro registro de multa ou sinistro para começar."}
              </p>
              <div className="mt-4">
                {hasFilters ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setFilterType("all");
                      setFilterStatus("all");
                      setFilterSeverity("all");
                    }}
                  >
                    Limpar filtros
                  </Button>
                ) : (
                  <Button size="sm" onClick={startCreate}>
                    <Plus aria-hidden />
                    Cadastrar incidente
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Data</th>
                    <th className="px-4 py-3 text-left">Veículo</th>
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Severidade</th>
                    <th className="px-4 py-3 text-left">Descrição</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedIncidents.map((incident) => {
                    const vehicle = vehicleById.get(incident.vehicleId);
                    const sev = SEVERITY_TONE[incident.severidade];
                    const status = STATUS_TONE[incident.status];
                    return (
                      <tr
                        key={incident.id}
                        className="border-t border-border text-foreground transition-colors hover:bg-accent/30"
                      >
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar
                              className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                              aria-hidden
                            />
                            <div className="text-xs tabular-nums">
                              <p className="text-foreground">
                                {new Date(incident.data).toLocaleDateString(
                                  "pt-BR",
                                )}
                              </p>
                              <p className="text-muted-foreground">
                                {new Date(incident.data).toLocaleTimeString(
                                  "pt-BR",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          {vehicle ? (
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {vehicle.marca} {vehicle.modelo}
                              </p>
                              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                {vehicle.placa}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Veículo removido
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs">
                            {incident.tipo === "multa" ? (
                              <FileText
                                className="h-3 w-3 text-muted-foreground"
                                aria-hidden
                              />
                            ) : (
                              <AlertTriangle
                                className="h-3 w-3 text-muted-foreground"
                                aria-hidden
                              />
                            )}
                            <span className="capitalize">{incident.tipo}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <select
                            value={incident.status}
                            onChange={(event) =>
                              void handleStatusUpdate(
                                incident,
                                event.target.value as IncidentStatus,
                              )
                            }
                            className={`appearance-none rounded-md px-2 py-1 text-xs font-medium ring-1 transition-colors ${status.bg} ${status.text} ${status.ring} hover:opacity-90`}
                          >
                            {STATUS_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${sev.text}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${sev.dot}`}
                              aria-hidden
                            />
                            {sev.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p
                            className="max-w-[340px] truncate text-sm text-foreground"
                            title={incident.descricao}
                          >
                            {incident.descricao}
                          </p>
                          {incident.tipo === "multa" &&
                            typeof incident.valor === "number" && (
                              <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                                {formatCurrency(incident.valor)}
                              </p>
                            )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  aria-label="Ações do incidente"
                                >
                                  <MoreHorizontal aria-hidden />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  onClick={() => setSelectedIncident(incident)}
                                >
                                  <Eye aria-hidden />
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => startEdit(incident)}
                                >
                                  <Pencil aria-hidden />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setConfirmDelete(incident)}
                                >
                                  <Trash2 aria-hidden />
                                  Remover
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
              {filtered.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Mostrando{" "}
                    <span className="font-medium text-foreground">
                      {(page - 1) * PAGE_SIZE + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-medium text-foreground">
                      {Math.min(page * PAGE_SIZE, filtered.length)}
                    </span>{" "}
                    de{" "}
                    <span className="font-medium text-foreground">
                      {filtered.length}
                    </span>{" "}
                    incidentes
                  </p>
                  <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          text="Anterior"
                          onClick={(event) => {
                            event.preventDefault();
                            setPage((current) => Math.max(1, current - 1));
                          }}
                          className={page === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {buildVisiblePages(page, totalPages).map((pageNumber, index) =>
                        pageNumber === "ellipsis" ? (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              href="#"
                              isActive={pageNumber === page}
                              onClick={(event) => {
                                event.preventDefault();
                                setPage(pageNumber);
                              }}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        ),
                      )}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          text="Próxima"
                          onClick={(event) => {
                            event.preventDefault();
                            setPage((current) => Math.min(totalPages, current + 1));
                          }}
                          className={
                            page === totalPages ? "pointer-events-none opacity-50" : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Form Sheet */}
      <Sheet
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) clearForm();
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 sm:max-w-xl"
        >
          <SheetHeader className="border-b border-border">
            <SheetTitle>
              {isEditing ? "Editar incidente" : "Novo incidente"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Atualize os dados do incidente selecionado."
                : "Registre uma multa ou sinistro associando-o a um veículo."}
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
              {/* Type segmented */}
              <div>
                <Label className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Tipo de incidente
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["multa", "sinistro"] as const).map((t) => {
                    const active = form.tipo === t;
                    const Icon = t === "multa" ? FileText : AlertTriangle;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, tipo: t }))}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-all ${
                          active
                            ? "border-primary/50 bg-primary/10 text-primary ring-2 ring-primary/15"
                            : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="vehicleId"
                    className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Veículo
                  </Label>
                  <div className="relative">
                    <Car
                      className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id="vehicleId"
                      value={vehicleQuery}
                      onChange={(event) =>
                        handleVehicleQueryChange(event.target.value)
                      }
                      onFocus={() => setVehicleAutocompleteOpen(true)}
                      onBlur={() => {
                        window.setTimeout(() => {
                          setVehicleAutocompleteOpen(false);
                        }, 100);
                      }}
                      placeholder="Busque por marca, modelo ou placa"
                      disabled={vehicles.length === 0}
                      autoComplete="off"
                      className="h-8 pl-8 pr-8 text-sm"
                    />
                    {vehicleAutocompleteOpen ? (
                      <div className="absolute inset-x-0 top-[calc(100%+0.375rem)] z-50 overflow-hidden rounded-lg border border-border bg-popover shadow-md ring-1 ring-foreground/10">
                        <div className="max-h-64 overflow-y-auto p-1">
                          {filteredVehicleOptions.length === 0 ? (
                            <p className="py-3 text-center text-sm text-muted-foreground">
                              Nenhum veículo encontrado.
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {filteredVehicleOptions.map((option) => (
                                <button
                                  type="button"
                                  key={option.value}
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                  }}
                                  onClick={() => handleVehicleSelect(option)}
                                  className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                                >
                                  <div className="flex min-w-0 flex-1 flex-col">
                                    <span className="truncate font-medium">
                                      {option.label}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  {vehicleSelectionInvalid ? (
                    <p className="mt-1 text-xs text-destructive">
                      Selecione um veículo existente na lista.
                    </p>
                  ) : null}
                </div>

                <div>
                  <Label
                    htmlFor="status"
                    className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Status
                  </Label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 dark:bg-input/30"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label
                    htmlFor="severidade"
                    className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Severidade
                  </Label>
                  <select
                    id="severidade"
                    name="severidade"
                    value={form.severidade}
                    onChange={handleChange}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/50 dark:bg-input/30"
                  >
                    {SEVERITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Label
                    htmlFor="data"
                    className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Data do incidente
                  </Label>
                  <Input
                    id="data"
                    type="datetime-local"
                    name="data"
                    value={form.data}
                    onChange={handleChange}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label
                    htmlFor="descricao"
                    className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Descrição
                  </Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={form.descricao}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Descreva brevemente o ocorrido…"
                  />
                </div>

                {form.tipo === "multa" ? (
                  <>
                    <div>
                      <Label
                        htmlFor="codigoInfracao"
                        className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        Código da infração
                      </Label>
                      <div className="relative">
                        <Hash
                          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="codigoInfracao"
                          name="codigoInfracao"
                          value={form.codigoInfracao}
                          onChange={handleChange}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="valor"
                        className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        Valor (R$)
                      </Label>
                      <div className="relative">
                        <Wallet
                          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="valor"
                          type="number"
                          min={0}
                          step="0.01"
                          name="valor"
                          value={form.valor}
                          onChange={handleChange}
                          className="pl-8"
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Label
                        htmlFor="localInfracao"
                        className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        Local da infração
                      </Label>
                      <div className="relative">
                        <MapPin
                          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="localInfracao"
                          name="localInfracao"
                          value={form.localInfracao}
                          onChange={handleChange}
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label
                        htmlFor="natureza"
                        className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        Natureza
                      </Label>
                      <Input
                        id="natureza"
                        name="natureza"
                        value={form.natureza}
                        onChange={handleChange}
                        placeholder="ex: colisão, roubo, avaria"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="local"
                        className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        Local
                      </Label>
                      <div className="relative">
                        <MapPin
                          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="local"
                          name="local"
                          value={form.local}
                          onChange={handleChange}
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-4 py-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFormOpen(false);
                  clearForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving
                  ? "Salvando..."
                  : isEditing
                    ? "Salvar alterações"
                    : "Criar incidente"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Detail Sheet */}
      <Sheet
        open={Boolean(selectedIncident)}
        onOpenChange={(open) => {
          if (!open) setSelectedIncident(null);
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              {selectedIncident?.tipo === "multa" ? (
                <FileText className="h-4 w-4 text-primary" aria-hidden />
              ) : (
                <AlertTriangle className="h-4 w-4 text-primary" aria-hidden />
              )}
              Detalhes do incidente
            </SheetTitle>
            <SheetDescription>
              {selectedIncident
                ? new Date(selectedIncident.data).toLocaleString("pt-BR")
                : ""}
            </SheetDescription>
          </SheetHeader>

          {selectedIncident && (
            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                    STATUS_TONE[selectedIncident.status].bg
                  } ${STATUS_TONE[selectedIncident.status].text} ${
                    STATUS_TONE[selectedIncident.status].ring
                  }`}
                >
                  {STATUS_TONE[selectedIncident.status].label}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium ${
                    SEVERITY_TONE[selectedIncident.severidade].text
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      SEVERITY_TONE[selectedIncident.severidade].dot
                    }`}
                    aria-hidden
                  />
                  Severidade {SEVERITY_TONE[selectedIncident.severidade].label}
                </span>
                <Badge variant="outline" className="capitalize">
                  {selectedIncident.tipo}
                </Badge>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Descrição
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                  {selectedIncident.descricao}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(() => {
                  const v = vehicleById.get(selectedIncident.vehicleId);
                  return (
                    <DetailItem
                      icon={Car}
                      label="Veículo"
                      value={
                        v
                          ? `${v.marca} ${v.modelo} (${v.placa})`
                          : "Veículo removido"
                      }
                    />
                  );
                })()}
                <DetailItem
                  icon={Calendar}
                  label="Data"
                  value={new Date(selectedIncident.data).toLocaleString(
                    "pt-BR",
                  )}
                />

                {selectedIncident.tipo === "multa" ? (
                  <>
                    <DetailItem
                      icon={Hash}
                      label="Código infração"
                      value={selectedIncident.codigoInfracao ?? "—"}
                    />
                    <DetailItem
                      icon={Wallet}
                      label="Valor"
                      value={formatCurrency(selectedIncident.valor)}
                    />
                    <DetailItem
                      icon={MapPin}
                      label="Local da infração"
                      value={selectedIncident.localInfracao ?? "—"}
                      span
                    />
                  </>
                ) : (
                  <>
                    <DetailItem
                      icon={AlertTriangle}
                      label="Natureza"
                      value={selectedIncident.natureza ?? "—"}
                    />
                    <DetailItem
                      icon={MapPin}
                      label="Local"
                      value={selectedIncident.local ?? "—"}
                      span
                    />
                  </>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const inc = selectedIncident;
                    setSelectedIncident(null);
                    if (inc) startEdit(inc);
                  }}
                >
                  <Pencil aria-hidden />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmDelete(selectedIncident)}
                >
                  <Trash2 aria-hidden />
                  Remover
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirm delete */}
      <Dialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover incidente?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O incidente será removido
              permanentemente do sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => confirmDelete && void performDelete(confirmDelete)}
            >
              <Trash2 aria-hidden />
              Remover
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function buildVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = start + 4;
  const pages: Array<number | "ellipsis"> = [];

  if (start > 1) {
    pages.push("ellipsis");
  }

  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    pages.push(pageNumber);
  }

  if (end < totalPages) {
    pages.push("ellipsis");
  }

  return pages;
}

function FilterChips<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-background p-0.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
              active
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

type KpiTone = "primary" | "amber" | "red" | "emerald";
const KPI_TONE: Record<KpiTone, { chip: string; ring: string }> = {
  primary: { chip: "bg-primary/10 text-primary", ring: "ring-primary/20" },
  amber: {
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    ring: "ring-amber-500/20",
  },
  red: {
    chip: "bg-red-500/10 text-red-600 dark:text-red-300",
    ring: "ring-red-500/20",
  },
  emerald: {
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    ring: "ring-emerald-500/20",
  },
};

function KpiTile({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: number | string;
  helper: string;
  tone: KpiTone;
}) {
  const t = KPI_TONE[tone];
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${t.chip} ${t.ring}`}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="font-heading text-xl font-semibold tabular-nums text-foreground">
          {value}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">{helper}</p>
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  span,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  span?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-background p-3 ${
        span ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-3 w-3" aria-hidden />
        </span>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-1.5 break-words text-sm font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}
