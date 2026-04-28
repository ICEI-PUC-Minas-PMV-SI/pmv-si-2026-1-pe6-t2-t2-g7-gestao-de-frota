"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@context/auth.context";
import { constants } from "@core/contants";
import { Badge } from "@/components/ui/badge";

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

type Vehicle = {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
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

export default function IncidentsPage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [form, setForm] = useState<IncidentForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

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
    setVehicles(data);
    setForm((prev) => ({
      ...prev,
      vehicleId: prev.vehicleId || data[0]?.id || "",
    }));
  }, [authHeaders]);

  const loadIncidents = useCallback(async () => {
    setLoading(true);
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
        const updatedSelected = data.find((item: Incident) => item.id === selectedIncident.id);
        setSelectedIncident(updatedSelected ?? null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders, selectedIncident]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      await loadVehicles();
      await loadIncidents();
    })();
  }, [user, loadVehicles, loadIncidents]);

  function clearForm() {
    setForm({
      ...defaultForm,
      vehicleId: vehicles[0]?.id ?? "",
    });
    setEditingId(null);
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function startEdit(incident: Incident) {
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
    setSuccess(null);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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
      setSuccess(isEditing ? "Incidente atualizado com sucesso." : "Incidente criado com sucesso.");
      clearForm();
      await loadIncidents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusUpdate(incident: Incident, status: IncidentStatus) {
    try {
      const response = await fetch(`${constants.API_BASE}/incident/${incident.id}`, {
        method: "PATCH",
        headers: await authHeaders(),
        body: JSON.stringify({ status }),
      });
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

  async function handleDelete(id: string) {
    try {
      setError(null);
      setSuccess(null);
      const response = await fetch(`${constants.API_BASE}/incident/${id}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message ?? "Erro ao remover incidente.");
      }
      if (selectedIncident?.id === id) {
        setSelectedIncident(null);
      }
      setSuccess("Incidente removido com sucesso.");
      await loadIncidents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  }

  const vehicleById = useMemo(() => {
    return new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
  }, [vehicles]);

  if (!user) return null;

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <header className="shrink-0 border-b border-zinc-800 px-8 py-8">
        <h1 className="text-2xl font-semibold text-white">Incidentes</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Registre, acompanhe e atualize multas e sinistros da frota.
        </p>
      </header>

      <main className="flex-1 space-y-6 px-8 py-8">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="text-lg font-medium text-white">
            {isEditing ? "Editar incidente" : "Novo incidente"}
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-500">
                Veículo
              </label>
              <select
                name="vehicleId"
                value={form.vehicleId}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.marca} {vehicle.modelo} · {vehicle.placa}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-500">
                Tipo
              </label>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="multa">Multa</option>
                <option value="sinistro">Sinistro</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-500">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="aberto">Aberto</option>
                <option value="em_analise">Em análise</option>
                <option value="resolvido">Resolvido</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-500">
                Severidade
              </label>
              <select
                name="severidade"
                value={form.severidade}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
            <div className="md:col-span-2 xl:col-span-4">
              <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-500">
                Descrição
              </label>
              <textarea
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                required
                rows={3}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-500">
                Data do incidente
              </label>
              <input
                type="datetime-local"
                name="data"
                value={form.data}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            {form.tipo === "multa" ? (
              <>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-500">
                    Código da infração
                  </label>
                  <input
                    type="text"
                    name="codigoInfracao"
                    value={form.codigoInfracao}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-500">
                    Valor
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    name="valor"
                    value={form.valor}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2 xl:col-span-2">
                  <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-500">
                    Local da infração
                  </label>
                  <input
                    type="text"
                    name="localInfracao"
                    value={form.localInfracao}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-500">
                    Natureza
                  </label>
                  <input
                    type="text"
                    name="natureza"
                    value={form.natureza}
                    onChange={handleChange}
                    placeholder="ex: colisão, roubo, avaria"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2 xl:col-span-2">
                  <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-500">
                    Local
                  </label>
                  <input
                    type="text"
                    name="local"
                    value={form.local}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </>
            )}
            <div className="md:col-span-2 xl:col-span-4 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving ? "Salvando..." : isEditing ? "Salvar edição" : "Criar incidente"}
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

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Tabela de incidentes</h2>
            <button
              type="button"
              onClick={loadIncidents}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
            >
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
          <div className="mt-4 overflow-auto rounded-lg border border-zinc-800">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-950/80 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-3 py-2 text-left">Data</th>
                  <th className="px-3 py-2 text-left">Veículo</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Severidade</th>
                  <th className="px-3 py-2 text-left">Descrição</th>
                  <th className="px-3 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => {
                  const vehicle = vehicleById.get(incident.vehicleId);
                  return (
                    <tr key={incident.id} className="border-t border-zinc-800 text-zinc-200">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(incident.data).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {vehicle
                          ? `${vehicle.marca} ${vehicle.modelo} (${vehicle.placa})`
                          : incident.vehicleId}
                      </td>
                      <td className="px-3 py-2 capitalize">{incident.tipo}</td>
                      <td className="px-3 py-2">
                        <select
                          value={incident.status}
                          onChange={(event) =>
                            void handleStatusUpdate(
                              incident,
                              event.target.value as IncidentStatus,
                            )
                          }
                          className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs"
                        >
                          <option value="aberto">Aberto</option>
                          <option value="em_analise">Em análise</option>
                          <option value="resolvido">Resolvido</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="capitalize">
                          {incident.severidade}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 max-w-[340px] truncate" title={incident.descricao}>
                        {incident.descricao}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedIncident(incident)}
                            className="rounded border border-zinc-700 px-2 py-1 text-xs hover:bg-zinc-800"
                          >
                            Detalhes
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(incident)}
                            className="rounded border border-zinc-700 px-2 py-1 text-xs hover:bg-zinc-800"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(incident.id)}
                            className="rounded border border-red-800 px-2 py-1 text-xs text-red-300 hover:bg-red-950/60"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loading && incidents.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-5 text-center text-sm text-zinc-500"
                    >
                      Nenhum incidente cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selectedIncident && (
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="text-lg font-medium text-white">Detalhes do incidente</h2>
            <p className="mt-2 text-sm text-zinc-300">{selectedIncident.descricao}</p>
            <div className="mt-3 grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
              <p>
                <strong className="text-zinc-300">Tipo:</strong> {selectedIncident.tipo}
              </p>
              <p>
                <strong className="text-zinc-300">Status:</strong> {selectedIncident.status}
              </p>
              <p>
                <strong className="text-zinc-300">Severidade:</strong>{" "}
                {selectedIncident.severidade}
              </p>
              <p>
                <strong className="text-zinc-300">Data:</strong>{" "}
                {new Date(selectedIncident.data).toLocaleString("pt-BR")}
              </p>
              {selectedIncident.tipo === "multa" ? (
                <>
                  <p>
                    <strong className="text-zinc-300">Código infração:</strong>{" "}
                    {selectedIncident.codigoInfracao ?? "—"}
                  </p>
                  <p>
                    <strong className="text-zinc-300">Valor:</strong>{" "}
                    {selectedIncident.valor ?? "—"}
                  </p>
                  <p className="sm:col-span-2">
                    <strong className="text-zinc-300">Local infração:</strong>{" "}
                    {selectedIncident.localInfracao ?? "—"}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong className="text-zinc-300">Natureza:</strong>{" "}
                    {selectedIncident.natureza ?? "—"}
                  </p>
                  <p className="sm:col-span-2">
                    <strong className="text-zinc-300">Local:</strong>{" "}
                    {selectedIncident.local ?? "—"}
                  </p>
                </>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
