"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@context/auth.context";
import { constants } from "@core/contants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  LogOut,
  Mail,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from "lucide-react";

type ApiUser = {
  id: number;
  uid: string;
  email: string;
  name: string;
  provider: string;
  role: "owner" | "admin" | "user" | "not_provided";
  createdAt: string;
  updatedAt: string;
};

const ROLE_TONE: Record<
  ApiUser["role"],
  { label: string; chip: string; ring: string; icon: typeof ShieldCheck }
> = {
  owner: {
    label: "Proprietário",
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    ring: "ring-amber-500/30",
    icon: Crown,
  },
  admin: {
    label: "Admin",
    chip: "bg-primary/10 text-primary",
    ring: "ring-primary/25",
    icon: ShieldCheck,
  },
  user: {
    label: "Usuário",
    chip: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    ring: "ring-sky-500/25",
    icon: UserIcon,
  },
  not_provided: {
    label: "Sem cargo",
    chip: "bg-muted text-muted-foreground",
    ring: "ring-border",
    icon: ShieldAlert,
  },
};

function initialsFor(name?: string | null, email?: string | null) {
  const source = (name ?? email ?? "??").trim();
  if (!source) return "??";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AccountPage() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [name, setName] = useState("");
  const [token, setToken] = useState<string>();
  const [showToken, setShowToken] = useState(false);
  const [copyHit, setCopyHit] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const authHeaders = useCallback(async () => {
    const idToken = await user?.getIdToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    };
  }, [user]);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const res = await fetch(`${constants.API_BASE}/account/sync`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ name: user.displayName ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message ?? "Erro ao carregar conta.");
      setProfile(data);
      setName(data.name ?? "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
    }
  }, [authHeaders, user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    user?.getIdToken().then((t) => setToken(t));
  }, [user]);

  const dirty = useMemo(
    () => Boolean(profile) && name.trim() !== (profile?.name ?? "").trim(),
    [name, profile],
  );

  if (!user) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("O nome não pode ficar vazio.");
      const res = await fetch(
        `${constants.API_BASE}/account/${profile.id}`,
        {
          method: "PATCH",
          headers: await authHeaders(),
          body: JSON.stringify({ name: trimmed }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message ?? "Erro ao atualizar perfil.");
      setProfile(data);
      setName(data.name ?? trimmed);
      setSuccess("Perfil atualizado com sucesso.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setSaving(false);
    }
  }

  async function copyText(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyHit(key);
      window.setTimeout(() => setCopyHit(null), 1400);
    } catch {}
  }

  const role = profile?.role ?? "not_provided";
  const tone = ROLE_TONE[role];
  const RoleIcon = tone.icon;
  const initials = initialsFor(profile?.name ?? user.displayName, user.email);

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background">
      <header className="shrink-0 border-b border-border bg-gradient-to-b from-primary/[0.04] to-transparent px-6 py-7 sm:px-8 sm:py-9">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Configurações
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Minha conta
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              Atualize seus dados pessoais, gerencie a identidade da sessão e
              controle ações sensíveis da conta.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-6 px-6 py-7 sm:px-8 sm:py-8">
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

        {/* Identity card */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative h-24 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
            <div className="absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]">
            </div>
          </div>
          <div className="-mt-10 flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:gap-6 sm:px-6">
            <div className="relative h-20 w-20 shrink-0">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-card text-2xl font-semibold text-primary shadow-sm ring-2 ring-card outline outline-1 outline-border">
                {initials}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-semibold text-foreground">
                  {profile?.name ||
                    user.displayName ||
                    user.email?.split("@")[0] ||
                    "Sua conta"}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${tone.chip} ${tone.ring}`}
                >
                  <RoleIcon className="h-3 w-3" aria-hidden />
                  {tone.label}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" aria-hidden />
                  {user.email ?? "—"}
                </span>
                <span
                  className={`inline-flex items-center gap-1 ${
                    user.emailVerified
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {user.emailVerified ? (
                    <CheckCircle2 className="h-3 w-3" aria-hidden />
                  ) : (
                    <AlertTriangle className="h-3 w-3" aria-hidden />
                  )}
                  {user.emailVerified ? "Verificado" : "Não verificado"}
                </span>
                {profile?.createdAt && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" aria-hidden />
                    Membro desde{" "}
                    {new Date(profile.createdAt).toLocaleDateString("pt-BR", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Two-column: profile form + identity */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(22rem,1fr)] lg:items-stretch">
          <form
            onSubmit={handleSave}
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-base font-semibold text-foreground">
                Informações do perfil
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Esses dados são exibidos para outros membros da operação.
              </p>
            </div>

            <div className="flex-1">
              <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label
                  htmlFor="account-name"
                  className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Nome completo
                </Label>
                <div className="relative">
                  <UserIcon
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="account-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como você quer ser chamado(a)"
                    className="pl-8"
                    maxLength={320}
                    required
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Aparece em telemetrias, incidentes e cabeçalhos do sistema.
                </p>
              </div>

              <ReadOnlyField
                label="E-mail"
                value={user.email ?? "—"}
                icon={Mail}
                hint="Definido pelo provedor de autenticação."
              />
              <ReadOnlyField
                label="Provedor"
                value={
                  profile?.provider ??
                  user.providerData[0]?.providerId ??
                  "—"
                }
                icon={ShieldCheck}
                hint="Origem da autenticação."
              />
              <ReadOnlyField
                label="Cargo"
                value={tone.label}
                icon={RoleIcon}
                hint="Apenas administradores podem alterar."
              />
              <ReadOnlyField
                label="Última atualização"
                value={
                  profile?.updatedAt
                    ? new Date(profile.updatedAt).toLocaleString("pt-BR")
                    : "—"
                }
                icon={CalendarDays}
                hint="Mais recente sincronização do perfil."
              />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setName(profile?.name ?? "")}
                disabled={!dirty || saving}
              >
                Descartar
              </Button>
              <Button type="submit" size="sm" disabled={!dirty || saving}>
                <Save aria-hidden />
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>

          {/* Identity / token */}
          <div className="grid h-full gap-4 lg:grid-rows-[minmax(0,1fr)_auto]">
            <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-base font-semibold text-foreground">
                  Identidade
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Identificadores técnicos da sessão atual.
                </p>
              </div>
              <div className="flex-1 space-y-3 px-5 py-5">
                <SecretField
                  icon={Fingerprint}
                  label="UID Firebase"
                  value={user.uid}
                  copied={copyHit === "uid"}
                  onCopy={() => copyText(user.uid, "uid")}
                />
                {profile?.id !== undefined && (
                  <SecretField
                    icon={Sparkles}
                    label="ID interno"
                    value={String(profile.id)}
                    copied={copyHit === "id"}
                    onCopy={() => copyText(String(profile.id), "id")}
                  />
                )}
                <SecretField
                  icon={KeyRound}
                  label="ID Token"
                  value={token ?? "Carregando..."}
                  hidden={!showToken}
                  onToggle={() => setShowToken((v) => !v)}
                  copied={copyHit === "token"}
                  onCopy={() => token && copyText(token, "token")}
                />
              </div>
            </div>

            <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-base font-semibold text-foreground">
                  Sessão
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Encerre sua sessão atual neste dispositivo.
                </p>
              </div>
              <div className="flex flex-col gap-4 px-5 py-5">
                <p className="text-sm text-muted-foreground">
                  Use esta ação para sair da conta com segurança.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => void logout()}
                >
                  <LogOut aria-hidden />
                  Sair da conta
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ReadOnlyField({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <Label className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-2">
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span
          className="truncate text-sm text-foreground"
          title={value}
        >
          {value}
        </span>
      </div>
      {hint && (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function SecretField({
  icon: Icon,
  label,
  value,
  hidden,
  copied,
  onToggle,
  onCopy,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  hidden?: boolean;
  copied?: boolean;
  onToggle?: () => void;
  onCopy?: () => void;
}) {
  const display = hidden
    ? "•".repeat(Math.min(28, Math.max(8, value.length / 2)))
    : value;
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Icon className="h-3 w-3" aria-hidden />
          {label}
        </span>
        <div className="flex items-center gap-1">
          {onToggle && (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={onToggle}
              aria-label={hidden ? "Mostrar" : "Ocultar"}
            >
              {hidden ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
            </Button>
          )}
          {onCopy && (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={onCopy}
              aria-label="Copiar"
            >
              {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            </Button>
          )}
        </div>
      </div>
      <p
        className="mt-1 truncate rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-xs text-foreground"
        title={hidden ? undefined : value}
      >
        {display}
      </p>
    </div>
  );
}
