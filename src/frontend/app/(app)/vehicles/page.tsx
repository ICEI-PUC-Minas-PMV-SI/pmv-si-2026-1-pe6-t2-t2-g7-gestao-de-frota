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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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

export default function VehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState<VehicleForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [telemetryModalVehicle, setTelemetryModalVehicle] = useState<Vehicle | null>(
    null,
  );
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);
  const [latestTelemetry, setLatestTelemetry] = useState<LatestTelemetry | null>(null);
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
    void loadVehicles();
  }, [loadVehicles, user]);

  if (!user) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function clearForm() {
    setForm(defaultForm);
    setEditingId(null);
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

      setSuccess(isEditing ? "Veículo atualizado com sucesso." : "Veículo criado com sucesso.");
      clearForm();
      await loadVehicles();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${constants.API_BASE}/vehicle/${id}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message ?? "Erro ao remover veículo.");
      }
      setSuccess("Veículo removido com sucesso.");
      if (editingId === id) clearForm();
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
        fetch(`${constants.API_BASE}/vehicle/${vehicle.id}/journeys`, { headers }),
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
      setTelemetryError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setTelemetryLoading(false);
      setHistoryLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <header className="shrink-0 border-b border-zinc-800 px-8 py-8">
        <h1 className="text-2xl font-semibold text-white">Gerenciar veículos</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Cadastre, edite e remova veículos da frota.
        </p>
      </header>

      <main className="flex-1 px-8 py-8">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="text-lg font-medium text-white">
            {isEditing ? "Editar veículo" : "Novo veículo"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Informe os dados do veículo e o link de uma foto pública da internet.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              { label: "Marca", name: "marca", placeholder: "ex: Fiat" },
              { label: "Modelo", name: "modelo", placeholder: "ex: Uno" },
              { label: "Ano", name: "ano", placeholder: "ex: 2020" },
              { label: "Placa", name: "placa", placeholder: "ex: ABC1D23" },
              {
                label: "Tanque (L)",
                name: "tamanhoTanque",
                placeholder: "ex: 55",
              },
              {
                label: "Consumo médio (km/L)",
                name: "consumoMedio",
                placeholder: "ex: 12.5",
              },
              {
                label: "Link da foto",
                name: "fotoUrl",
                placeholder: "https://...",
              },
            ].map(({ label, name, placeholder }) => (
              <div key={name} className={name === "fotoUrl" ? "md:col-span-2 xl:col-span-1" : ""}>
                <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-500">
                  {label}
                </label>
                <input
                  type={
                    name === "ano" || name === "tamanhoTanque" || name === "consumoMedio"
                      ? "number"
                      : name === "fotoUrl"
                        ? "url"
                        : "text"
                  }
                  name={name}
                  value={form[name as keyof VehicleForm]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            ))}

            <div className="flex gap-3 md:col-span-2 xl:col-span-5">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving ? "Salvando..." : isEditing ? "Salvar edição" : "Criar veículo"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="rounded-lg border border-zinc-700 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950 px-4 py-3 text-sm text-emerald-300">
              {success}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Catálogo de veículos</h2>
            <button
              type="button"
              onClick={loadVehicles}
              disabled={loading}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
          </div>

          {loading && <p className="mt-4 text-sm text-zinc-500">Carregando veículos...</p>}

          {!loading && vehicles.length === 0 && (
            <p className="mt-4 text-sm text-zinc-500">Nenhum veículo cadastrado ainda.</p>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {vehicles.map((vehicle) => (
              <article
                key={vehicle.id}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50"
              >
                <div className="relative h-32 w-full bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vehicle.fotoUrl}
                    alt={`${vehicle.marca} ${vehicle.modelo}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://images.unsplash.com/photo-1485463618014-fdf5a38de5f2?auto=format&fit=crop&w=1200&q=60";
                    }}
                  />
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-semibold text-white">
                    {vehicle.marca} {vehicle.modelo}
                  </h3>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-500">
                    {vehicle.placa} · {vehicle.ano}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Tanque: {vehicle.tamanhoTanque}L · Consumo: {vehicle.consumoMedio} km/L
                  </p>
                  <p className="mt-1.5 truncate text-[11px] text-zinc-500" title={vehicle.fotoUrl}>
                    {vehicle.fotoUrl}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void openTelemetryModal(vehicle)}
                      className="rounded-md border border-emerald-800 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-950/60"
                    >
                      Telemetria
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(vehicle)}
                      className="rounded-md border border-zinc-700 px-2.5 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-800"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(vehicle.id)}
                      className="rounded-md border border-red-800 px-2.5 py-1 text-[11px] font-medium text-red-300 hover:bg-red-950/60"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Dialog
        open={Boolean(telemetryModalVehicle)}
        onOpenChange={(open) => {
          if (!open) setTelemetryModalVehicle(null);
        }}
      >
        <DialogContent className="max-w-3xl bg-zinc-950 text-white ring-zinc-800">
          <DialogHeader>
            <DialogTitle>
              Telemetria do veículo{" "}
              {telemetryModalVehicle
                ? `${telemetryModalVehicle.marca} ${telemetryModalVehicle.modelo}`
                : ""}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Acompanhe os dados atuais e o histórico de viagens deste veículo.
            </DialogDescription>
          </DialogHeader>

          {telemetryError && (
            <p className="rounded-lg border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-300">
              {telemetryError}
            </p>
          )}

          <Tabs defaultValue="telemetry" className="mt-2">
            <TabsList className="bg-zinc-900">
              <TabsTrigger value="telemetry">Telemetria</TabsTrigger>
              <TabsTrigger value="history">Histórico de viagens</TabsTrigger>
            </TabsList>

            <TabsContent value="telemetry" className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Status de telemetria
                  </p>
                  <p className="mt-1 text-sm">
                    {telemetryLoading
                      ? "Carregando..."
                      : latestTelemetry?.temTelemetria
                        ? "Último registro disponível"
                        : "Sem telemetria registrada"}
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Última atualização
                  </p>
                  <p className="mt-1 text-sm">
                    {latestTelemetry?.registradaEm
                      ? new Date(latestTelemetry.registradaEm).toLocaleString("pt-BR")
                      : "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">KM rodados</p>
                  <p className="mt-1 text-sm">{latestTelemetry?.kmRodados ?? "—"}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Combustível gasto (L)
                  </p>
                  <p className="mt-1 text-sm">{latestTelemetry?.combustivelGasto ?? "—"}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Nível combustível (%)
                  </p>
                  <p className="mt-1 text-sm">{latestTelemetry?.nivelCombustivel ?? "—"}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Velocidade média (km/h)
                  </p>
                  <p className="mt-1 text-sm">{latestTelemetry?.velocidadeMedia ?? "—"}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-3">
              {historyLoading && (
                <p className="text-sm text-zinc-400">Carregando histórico de viagens...</p>
              )}

              {!historyLoading && journeyHistory.length === 0 && (
                <p className="text-sm text-zinc-400">Nenhuma viagem encontrada para este veículo.</p>
              )}

              {!historyLoading && journeyHistory.length > 0 && (
                <div className="space-y-2">
                  {journeyHistory.map((journey) => (
                    <div
                      key={journey.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-white">
                          {journey.nome ?? "Jornada sem nome"}
                        </p>
                        <Badge
                          variant={journey.status === "completed" ? "secondary" : "outline"}
                          className="capitalize"
                        >
                          {journey.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        Início: {new Date(journey.iniciadaEm).toLocaleString("pt-BR")}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        KM: {journey.kmRodados} · Combustível: {journey.combustivelGasto}L · Nível:{" "}
                        {journey.nivelCombustivel}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
