"use client";

import { useState } from "react";
import { useAuth } from "@context/auth.context";
import { constants } from "@core/contants";

type TelemetryForm = {
  journeyId: string;
  vehicleId: string;
  kmRodados: string;
  combustivelGasto: string;
  nivelCombustivel: string;
  latitude: string;
  longitude: string;
  velocidadeMedia: string;
};

type TelemetryRecord = {
  id: string;
  journeyId: string;
  vehicleId: string;
  kmRodados: number;
  combustivelGasto: number;
  nivelCombustivel: number;
  latitude: number;
  longitude: number;
  velocidadeMedia: number;
  registradaEm: string;
};

type LatestTelemetry =
  | { temTelemetria: false }
  | ({ temTelemetria: true } & TelemetryRecord);

type JourneyStop = {
  id: string;
  ordem: number;
  latitude: number;
  longitude: number;
};

type JourneyResponse = {
  id: string;
  status: string;
  paradas: JourneyStop[];
};

const defaultForm: TelemetryForm = {
  journeyId: "",
  vehicleId: "",
  kmRodados: "",
  combustivelGasto: "",
  nivelCombustivel: "",
  latitude: "",
  longitude: "",
  velocidadeMedia: "",
};

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function totalRouteKm(stops: JourneyStop[]): number {
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    total += haversineKm(
      stops[i].latitude,
      stops[i].longitude,
      stops[i + 1].latitude,
      stops[i + 1].longitude,
    );
  }
  return total;
}

export default function TelemetryPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<TelemetryForm>(defaultForm);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyError, setJourneyError] = useState<string | null>(null);
  const [postResult, setPostResult] = useState<TelemetryRecord | null>(null);
  const [latestResult, setLatestResult] = useState<LatestTelemetry | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [getError, setGetError] = useState<string | null>(null);
  const [postLoading, setPostLoading] = useState(false);
  const [getLoading, setGetLoading] = useState(false);

  if (!user) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleJourneyBlur() {
    const id = form.journeyId.trim();
    if (!id) return;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) return;

    setJourneyError(null);
    setJourneyLoading(true);
    try {
      const idToken = await user!.getIdToken();
      const res = await fetch(`${constants.API_BASE}/journey/${id}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data: JourneyResponse = await res.json();
      if (!res.ok) {
        setJourneyError("Jornada não encontrada ou sem acesso.");
        return;
      }

      const stops = [...data.paradas].sort((a, b) => a.ordem - b.ordem);
      if (stops.length === 0) return;

      const km = totalRouteKm(stops);
      const last = stops[stops.length - 1];

      setForm((prev) => ({
        ...prev,
        kmRodados: km.toFixed(2),
        latitude: String(last.latitude),
        longitude: String(last.longitude),
      }));
    } catch {
      setJourneyError("Erro ao buscar jornada. Preencha os campos manualmente.");
    } finally {
      setJourneyLoading(false);
    }
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    setPostError(null);
    setPostResult(null);
    setPostLoading(true);
    try {
      const idToken = await user!.getIdToken();
      const res = await fetch(
        `${constants.API_BASE}/journey/${form.journeyId}/telemetry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            vehicleId: form.vehicleId,
            kmRodados: Number(form.kmRodados),
            combustivelGasto: Number(form.combustivelGasto),
            nivelCombustivel: Number(form.nivelCombustivel),
            latitude: Number(form.latitude),
            longitude: Number(form.longitude),
            velocidadeMedia: Number(form.velocidadeMedia),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message ?? "Erro ao registrar telemetria");
      setPostResult(data);
    } catch (err: unknown) {
      setPostError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setPostLoading(false);
    }
  }

  async function handleGetLatest() {
    setGetError(null);
    setLatestResult(null);
    setGetLoading(true);
    try {
      const idToken = await user!.getIdToken();
      const res = await fetch(
        `${constants.API_BASE}/journey/${form.journeyId}/telemetry/latest`,
        { headers: { Authorization: `Bearer ${idToken}` } },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message ?? "Erro ao buscar telemetria");
      setLatestResult(data);
    } catch (err: unknown) {
      setGetError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setGetLoading(false);
    }
  }

  const fields: {
    label: string;
    name: keyof TelemetryForm;
    placeholder: string;
    hint?: string;
  }[] = [
    {
      label: "Journey ID (UUID)",
      name: "journeyId",
      placeholder: "uuid da jornada",
      hint: journeyLoading
        ? "Buscando jornada…"
        : "Ao sair do campo, calcula km e coordenadas automaticamente.",
    },
    { label: "Vehicle ID (UUID)", name: "vehicleId", placeholder: "uuid do veículo" },
    {
      label: "KM Rodados",
      name: "kmRodados",
      placeholder: "calculado automaticamente",
      hint: "Calculado via Haversine entre as paradas. Editável.",
    },
    { label: "Combustível Gasto (L)", name: "combustivelGasto", placeholder: "ex: 8.3" },
    { label: "Nível Combustível (%)", name: "nivelCombustivel", placeholder: "0–100" },
    {
      label: "Latitude",
      name: "latitude",
      placeholder: "preenchida automaticamente",
      hint: "Coordenada da última parada. Editável.",
    },
    {
      label: "Longitude",
      name: "longitude",
      placeholder: "preenchida automaticamente",
      hint: "Coordenada da última parada. Editável.",
    },
    { label: "Velocidade Média (km/h)", name: "velocidadeMedia", placeholder: "ex: 60" },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <header className="shrink-0 border-b border-zinc-800 px-8 py-8">
        <h1 className="text-2xl font-semibold text-white">Telemetria</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Registre e consulte dados de telemetria da frota.
        </p>
      </header>

      <main className="flex-1 px-8 py-8 space-y-8 max-w-2xl">
        <form onSubmit={handlePost} className="space-y-4">
          <h2 className="text-lg font-medium text-white">Registrar telemetria</h2>

          {fields.map(({ label, name, placeholder, hint }) => (
            <div key={name}>
              <label className="block text-xs text-zinc-400 mb-1 uppercase tracking-widest">
                {label}
              </label>
              <input
                type="text"
                name={name}
                value={form[name]}
                onChange={handleChange}
                onBlur={name === "journeyId" ? handleJourneyBlur : undefined}
                placeholder={placeholder}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
              {hint && (
                <p className="mt-1 text-xs text-zinc-600">{hint}</p>
              )}
            </div>
          ))}

          {journeyError && (
            <p className="text-xs text-amber-400">{journeyError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={postLoading}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {postLoading ? "Enviando..." : "POST /telemetry"}
            </button>
            <button
              type="button"
              onClick={handleGetLatest}
              disabled={getLoading || !form.journeyId}
              className="rounded-lg border border-zinc-700 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {getLoading ? "Buscando..." : "GET /telemetry/latest"}
            </button>
          </div>
        </form>

        {postError && (
          <div className="rounded-lg border border-red-800 bg-red-950 px-5 py-4 text-sm text-red-300">
            <strong>Erro (POST):</strong> {postError}
          </div>
        )}

        {postResult && (
          <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
              Resposta POST
            </p>
            <pre className="text-xs text-green-400 overflow-auto">
              {JSON.stringify(postResult, null, 2)}
            </pre>
          </div>
        )}

        {getError && (
          <div className="rounded-lg border border-red-800 bg-red-950 px-5 py-4 text-sm text-red-300">
            <strong>Erro (GET latest):</strong> {getError}
          </div>
        )}

        {latestResult && (
          <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
              Resposta GET latest
            </p>
            <pre className="text-xs text-blue-400 overflow-auto">
              {JSON.stringify(latestResult, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
