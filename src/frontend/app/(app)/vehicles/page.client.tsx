"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@context/auth.context";
import { constants } from "@core/contants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Activity,
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  Droplet,
  Fuel,
  Gauge,
  Image as ImageIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type Vehicle = {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  fotoUrl: string;
  tamanhoTanque: number;
  consumoMedio: number;
  createdAt: string;
  updatedAt: string;
};

export type { Vehicle };

type VehicleForm = {
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
  fotoUrl: string;
  tamanhoTanque: string;
  consumoMedio: string;
};

const defaultForm: VehicleForm = {
  marca: "",
  modelo: "",
  ano: "",
  placa: "",
  fotoUrl: "",
  tamanhoTanque: "",
  consumoMedio: "",
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1485463618014-fdf5a38de5f2?auto=format&fit=crop&w=1200&q=60";
const PAGE_SIZE = 8;

type LatestTelemetry = {
  temTelemetria: boolean;
  id?: string;
  vehicleId?: string;
  kmRodados?: number;
  combustivelGasto?: number;
  nivelCombustivel?: number;
  velocidadeMedia?: number;
  registradaEm?: string;
};

type JourneyHistory = {
  id: string;
  nome?: string;
  status: string;
  kmRodados: number;
  combustivelGasto: number;
  nivelCombustivel: number;
  iniciadaEm: string;
};

const FORM_FIELDS: {
  label: string;
  name: keyof VehicleForm;
  placeholder: string;
  type: "text" | "number" | "url";
  helper?: string;
  span?: string;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}[] = [
  {
    label: "Marca",
    name: "marca",
    placeholder: "Fiat, Toyota, Volkswagen…",
    type: "text",
    icon: Car,
  },
  {
    label: "Modelo",
    name: "modelo",
    placeholder: "Uno, Corolla, Polo…",
    type: "text",
  },
  { label: "Ano", name: "ano", placeholder: "2020", type: "number" },
  {
    label: "Placa",
    name: "placa",
    placeholder: "ABC1D23",
    type: "text",
    helper: "Será salva em letras maiúsculas.",
  },
  {
    label: "Tanque (litros)",
    name: "tamanhoTanque",
    placeholder: "55",
    type: "number",
    icon: Fuel,
  },
  {
    label: "Consumo médio (km/L)",
    name: "consumoMedio",
    placeholder: "12.5",
    type: "number",
    icon: Gauge,
  },
  {
    label: "URL da foto",
    name: "fotoUrl",
    placeholder: "https://…",
    type: "url",
    span: "sm:col-span-2",
    helper: "Use uma URL pública. Recomendado 1200×800.",
    icon: ImageIcon,
  },
];

export default function VehiclesPageClient({
  initialVehicles = [],
}: {
  initialVehicles?: Vehicle[];
}) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [form, setForm] = useState<VehicleForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Vehicle | null>(null);
  const [telemetryModalVehicle, setTelemetryModalVehicle] =
    useState<Vehicle | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);
  const [latestTelemetry, setLatestTelemetry] = useState<LatestTelemetry | null>(
    null,
  );
  const [journeyHistory, setJourneyHistory] = useState<JourneyHistory[]>([]);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const authHeaders = useCallback(async () => {
    const idToken = await user?.getIdToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    };
  }, [user]);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${constants.API_BASE}/vehicle`, {
        headers: await authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Erro ao carregar veículos.");
      }
      setVehicles(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    if (!user) return;
    if (initialVehicles.length === 0) {
      void loadVehicles();
    }
  }, [initialVehicles.length, loadVehicles, user]);

  const stats = useMemo(() => {
    const totalTanque = vehicles.reduce((sum, v) => sum + v.tamanhoTanque, 0);
    const consumo = vehicles.length
      ? vehicles.reduce((sum, v) => sum + v.consumoMedio, 0) / vehicles.length
      : 0;
    const anoMaisRecente = vehicles.reduce(
      (max, v) => (v.ano > max ? v.ano : max),
      0,
    );
    return {
      total: vehicles.length,
      totalTanque,
      consumoMedio: consumo,
      anoMaisRecente,
    };
  }, [vehicles]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vehicles;
    return vehicles.filter((v) =>
      `${v.marca} ${v.modelo} ${v.placa} ${v.ano}`
        .toLowerCase()
        .includes(term),
    );
  }, [search, vehicles]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedVehicles = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [search, vehicles.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (!user) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function clearForm() {
    setForm(defaultForm);
    setEditingId(null);
  }

  function startCreate() {
    clearForm();
    setSuccess(null);
    setError(null);
    setFormOpen(true);
  }

  function startEdit(vehicle: Vehicle) {
    setForm({
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      ano: String(vehicle.ano),
      placa: vehicle.placa,
      fotoUrl: vehicle.fotoUrl,
      tamanhoTanque: String(vehicle.tamanhoTanque),
      consumoMedio: String(vehicle.consumoMedio),
    });
    setEditingId(vehicle.id);
    setSuccess(null);
    setError(null);
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        ano: Number(form.ano),
        placa: form.placa.trim().toUpperCase(),
        fotoUrl: form.fotoUrl.trim(),
        tamanhoTanque: Number(form.tamanhoTanque),
        consumoMedio: Number(form.consumoMedio),
      };

      const res = await fetch(
        isEditing
          ? `${constants.API_BASE}/vehicle/${editingId}`
          : `${constants.API_BASE}/vehicle`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: await authHeaders(),
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Erro ao salvar veículo.");
      }

      setSuccess(
        isEditing
          ? "Veículo atualizado com sucesso."
          : "Veículo criado com sucesso.",
      );
      clearForm();
      setFormOpen(false);
      await loadVehicles();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setSaving(false);
    }
  }

  async function performDelete(vehicle: Vehicle) {
    setError(null);
    setSuccess(null);
    setConfirmDelete(null);
    try {
      const res = await fetch(`${constants.API_BASE}/vehicle/${vehicle.id}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message ?? "Erro ao remover veículo.");
      }
      setSuccess("Veículo removido com sucesso.");
      if (editingId === vehicle.id) clearForm();
      await loadVehicles();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  }

  async function openTelemetryModal(vehicle: Vehicle) {
    setTelemetryModalVehicle(vehicle);
    setTelemetryError(null);
    setLatestTelemetry(null);
    setJourneyHistory([]);
    setTelemetryLoading(true);
    setHistoryLoading(true);

    try {
      const headers = await authHeaders();
      const [latestRes, historyRes] = await Promise.all([
        fetch(`${constants.API_BASE}/vehicle/${vehicle.id}/telemetry/latest`, {
          headers,
        }),
        fetch(`${constants.API_BASE}/vehicle/${vehicle.id}/journeys`, {
          headers,
        }),
      ]);

      const latestData = await latestRes.json();
      const historyData = await historyRes.json();

      if (!latestRes.ok) {
        throw new Error(latestData?.message ?? "Erro ao carregar telemetria.");
      }
      if (!historyRes.ok) {
        throw new Error(historyData?.message ?? "Erro ao carregar histórico.");
      }

      setLatestTelemetry(latestData);
      setJourneyHistory(historyData);
    } catch (err: unknown) {
      setTelemetryError(
        err instanceof Error ? err.message : "Erro desconhecido.",
      );
    } finally {
      setTelemetryLoading(false);
      setHistoryLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background">
      <header className="shrink-0 border-b border-border bg-gradient-to-b from-primary/[0.04] to-transparent px-6 py-7 sm:px-8 sm:py-9">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Catálogo
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Gestão de veículos
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              Cadastre, edite e acompanhe a frota da sua operação. Visualize
              telemetria e histórico de viagens em poucos cliques.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={startCreate}>
              <Plus aria-hidden />
              Novo veículo
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-6 px-6 py-7 sm:px-8 sm:py-8">
        {/* KPI strip */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SmallStat
            icon={Car}
            label="Veículos"
            value={String(stats.total)}
            helper="Total na frota"
            tone="primary"
          />
          <SmallStat
            icon={Gauge}
            label="Consumo médio"
            value={
              stats.consumoMedio > 0
                ? `${stats.consumoMedio.toFixed(1)} km/L`
                : "—"
            }
            helper="Média da frota"
            tone="emerald"
          />
          <SmallStat
            icon={Fuel}
            label="Capacidade total"
            value={`${stats.totalTanque.toLocaleString("pt-BR")} L`}
            helper="Soma dos tanques"
            tone="amber"
          />
          <SmallStat
            icon={Calendar}
            label="Mais recente"
            value={stats.anoMaisRecente > 0 ? String(stats.anoMaisRecente) : "—"}
            helper="Ano de fabricação"
            tone="sky"
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

        {/* Toolbar + Catalog */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-foreground">
                Catálogo de veículos
              </h2>
              <Badge variant="outline" className="font-mono">
                {filtered.length}
                {search && filtered.length !== vehicles.length
                  ? ` / ${vehicles.length}`
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
                placeholder="Buscar por marca, modelo ou placa…"
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

          <div className="p-5">
            {loading && vehicles.length === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-xl border border-border bg-background"
                  >
                    <div className="h-36 w-full animate-pulse bg-muted" />
                    <div className="space-y-2 p-3">
                      <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                      <div className="h-2 w-1/2 animate-pulse rounded bg-muted/70" />
                      <div className="h-2 w-1/3 animate-pulse rounded bg-muted/70" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title={
                  search
                    ? "Nenhum veículo corresponde à busca"
                    : "Nenhum veículo cadastrado"
                }
                description={
                  search
                    ? "Tente outro termo ou limpe o filtro para ver toda a frota."
                    : "Crie seu primeiro veículo e comece a operar a frota."
                }
                action={
                  search ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearch("")}
                    >
                      Limpar busca
                    </Button>
                  ) : (
                    <Button size="sm" onClick={startCreate}>
                      <Plus aria-hidden />
                      Cadastrar veículo
                    </Button>
                  )
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onTelemetry={() => void openTelemetryModal(vehicle)}
                    onEdit={() => startEdit(vehicle)}
                    onDelete={() => setConfirmDelete(vehicle)}
                  />
                ))}
              </div>
            )}
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
                veículos
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
          className="flex w-full flex-col gap-0 sm:max-w-lg"
        >
          <SheetHeader className="border-b border-border">
            <SheetTitle>
              {isEditing ? "Editar veículo" : "Cadastrar novo veículo"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Atualize os dados do veículo selecionado."
                : "Informe marca, modelo e dados operacionais para cadastrar."}
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
              {form.fotoUrl && (
                <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.fotoUrl}
                    alt="Pré-visualização"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_IMG;
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2">
                    <p className="truncate text-xs text-white/85">
                      Pré-visualização da foto
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {FORM_FIELDS.map(
                  ({ label, name, placeholder, type, helper, span, icon: Icon }) => (
                    <div key={name} className={span ?? ""}>
                      <Label
                        htmlFor={`vehicle-${name}`}
                        className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        {label}
                      </Label>
                      <div className="relative">
                        {Icon && (
                          <Icon
                            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                          />
                        )}
                        <Input
                          id={`vehicle-${name}`}
                          name={name}
                          type={type}
                          value={form[name]}
                          onChange={handleChange}
                          placeholder={placeholder}
                          required
                          className={Icon ? "pl-8" : ""}
                        />
                      </div>
                      {helper && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {helper}
                        </p>
                      )}
                    </div>
                  ),
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
                    : "Cadastrar veículo"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Confirm delete */}
      <Dialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
      >
        <DialogContent className="w-lg">
          <DialogHeader>
            <DialogTitle>Remover veículo?</DialogTitle>
            <DialogDescription>
              {confirmDelete
                ? `${confirmDelete.marca} ${confirmDelete.modelo} (${confirmDelete.placa}) será removido permanentemente.`
                : ""}
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

      {/* Telemetry */}
      <Dialog
        open={Boolean(telemetryModalVehicle)}
        onOpenChange={(open) => {
          if (!open) setTelemetryModalVehicle(null);
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:w-[38rem] sm:max-w-[38rem] border-border bg-card text-foreground ring-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
                <Activity className="h-3.5 w-3.5" aria-hidden />
              </span>
              Telemetria{" "}
              {telemetryModalVehicle
                ? `· ${telemetryModalVehicle.marca} ${telemetryModalVehicle.modelo}`
                : ""}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Acompanhe os dados atuais e o histórico de viagens deste veículo.
            </DialogDescription>
          </DialogHeader>

          {telemetryError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/5 px-3 py-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{telemetryError}</span>
            </div>
          )}

          <Tabs defaultValue="telemetry" className="mt-2">
            <TabsList className="bg-muted">
              <TabsTrigger value="telemetry">Telemetria</TabsTrigger>
              <TabsTrigger value="history">Histórico de viagens</TabsTrigger>
            </TabsList>

            <TabsContent value="telemetry" className="space-y-3">
              {telemetryLoading ? (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <TelemetryLoadingTile key={index} />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <TelemetryTile
                    icon={Activity}
                    label="Status"
                    value={latestTelemetry?.temTelemetria ? "Ativa" : "Sem registros"}
                  />
                  <TelemetryTile
                    icon={Calendar}
                    label="Última atualização"
                    value={
                      latestTelemetry?.registradaEm
                        ? new Date(latestTelemetry.registradaEm).toLocaleString(
                            "pt-BR",
                          )
                        : "—"
                    }
                  />
                  <TelemetryTile
                    icon={Gauge}
                    label="KM rodados"
                    value={
                      typeof latestTelemetry?.kmRodados === "number"
                        ? `${latestTelemetry.kmRodados} km`
                        : "—"
                    }
                  />
                  <TelemetryTile
                    icon={Fuel}
                    label="Combustível gasto"
                    value={
                      typeof latestTelemetry?.combustivelGasto === "number"
                        ? `${latestTelemetry.combustivelGasto} L`
                        : "—"
                    }
                  />
                  <TelemetryTile
                    icon={Droplet}
                    label="Nível combustível"
                    value={
                      typeof latestTelemetry?.nivelCombustivel === "number"
                        ? `${latestTelemetry.nivelCombustivel}%`
                        : "—"
                    }
                  />
                  <TelemetryTile
                    icon={Activity}
                    label="Velocidade média"
                    value={
                      typeof latestTelemetry?.velocidadeMedia === "number"
                        ? `${latestTelemetry.velocidadeMedia} km/h`
                        : "—"
                    }
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-3">
              {historyLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-border bg-background p-3"
                    >
                      <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                      <div className="mt-2 h-2 w-1/2 animate-pulse rounded bg-muted/80" />
                      <div className="mt-3 flex gap-2">
                        <div className="h-2 w-16 animate-pulse rounded bg-muted/80" />
                        <div className="h-2 w-20 animate-pulse rounded bg-muted/80" />
                        <div className="h-2 w-14 animate-pulse rounded bg-muted/80" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : journeyHistory.length === 0 ? (
                <EmptyState
                  title="Nenhuma viagem encontrada"
                  description="Quando uma jornada for registrada para este veículo, ela aparece aqui."
                />
              ) : (
                <ul className="space-y-2">
                  {journeyHistory.map((journey) => (
                    <li
                      key={journey.id}
                      className="rounded-lg border border-border bg-background p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {journey.nome ?? "Jornada sem nome"}
                        </p>
                        <Badge
                          variant={
                            journey.status === "completed"
                              ? "secondary"
                              : "outline"
                          }
                          className="capitalize"
                        >
                          {journey.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Início:{" "}
                        {new Date(journey.iniciadaEm).toLocaleString("pt-BR")}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>
                          KM:{" "}
                          <span className="text-foreground tabular-nums">
                            {journey.kmRodados}
                          </span>
                        </span>
                        <span>
                          Combustível:{" "}
                          <span className="text-foreground tabular-nums">
                            {journey.combustivelGasto}L
                          </span>
                        </span>
                        <span>
                          Nível:{" "}
                          <span className="text-foreground tabular-nums">
                            {journey.nivelCombustivel}%
                          </span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VehicleCard({
  vehicle,
  onTelemetry,
  onEdit,
  onDelete,
}: {
  vehicle: Vehicle;
  onTelemetry: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="group/card relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/5">
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={vehicle.fotoUrl}
          alt={`${vehicle.marca} ${vehicle.modelo}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMG;
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center rounded-full bg-black/45 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-sm">
            {vehicle.placa}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {vehicle.marca} {vehicle.modelo}
            </p>
            <p className="text-[11px] text-white/75">{vehicle.ano}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <div className="grid grid-cols-2 gap-2">
          <Pill icon={Fuel} label="Tanque" value={`${vehicle.tamanhoTanque}L`} />
          <Pill
            icon={Gauge}
            label="Consumo"
            value={`${vehicle.consumoMedio} km/L`}
          />
        </div>

        <div className="mt-auto flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={onTelemetry}
          >
            <Activity aria-hidden />
            Telemetria
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={onEdit}
            aria-label={`Editar ${vehicle.marca} ${vehicle.modelo}`}
          >
            <Pencil aria-hidden />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="destructive"
            onClick={onDelete}
            aria-label={`Remover ${vehicle.marca} ${vehicle.modelo}`}
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );
}

function Pill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-2.5 py-1.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3 w-3" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-xs font-medium text-foreground tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}

type StatTone = "primary" | "amber" | "emerald" | "sky";
const STAT_TONE: Record<StatTone, { chip: string; ring: string }> = {
  primary: { chip: "bg-primary/10 text-primary", ring: "ring-primary/20" },
  amber: {
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    ring: "ring-amber-500/20",
  },
  emerald: {
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    ring: "ring-emerald-500/20",
  },
  sky: {
    chip: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    ring: "ring-sky-500/20",
  },
};

function SmallStat({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  helper: string;
  tone: StatTone;
}) {
  const t = STAT_TONE[tone];
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

function TelemetryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-3 w-3" aria-hidden />
        </span>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-1.5 text-sm font-medium text-foreground tabular-nums">
        {value}
      </p>
    </div>
  );
}

function TelemetryLoadingTile() {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
          <div className="h-5 w-28 animate-pulse rounded bg-muted/80" />
        </div>
        <div className="h-9 w-9 animate-pulse rounded-lg bg-primary/10" />
      </div>
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

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
        <Car className="h-5 w-5" aria-hidden />
      </span>
      <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
