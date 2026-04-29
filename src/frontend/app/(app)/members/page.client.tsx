"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Mail,
  MoreHorizontal,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";

type Role = "owner" | "admin" | "user" | "not_provided";

type Member = {
  id: number;
  uid: string;
  email: string;
  name: string;
  provider: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

export type { Member };

const PAGE_SIZE = 20;

const ROLE_TONE: Record<
  Role,
  {
    label: string;
    chip: string;
    ring: string;
    icon: typeof ShieldCheck;
    description: string;
  }
> = {
  owner: {
    label: "Proprietário",
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    ring: "ring-amber-500/30",
    icon: Crown,
    description: "Proprietário da operação. Não pode ser alterado.",
  },
  admin: {
    label: "Admin",
    chip: "bg-primary/10 text-primary",
    ring: "ring-primary/25",
    icon: ShieldCheck,
    description: "Gerencia membros, veículos e incidentes.",
  },
  user: {
    label: "Usuário",
    chip: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    ring: "ring-sky-500/25",
    icon: UserIcon,
    description: "Acesso operacional padrão.",
  },
  not_provided: {
    label: "Sem cargo",
    chip: "bg-muted text-muted-foreground",
    ring: "ring-border",
    icon: ShieldAlert,
    description: "Aguardando atribuição de cargo.",
  },
};

const PROVIDER_LABEL: Record<string, string> = {
  password: "E-mail / Senha",
  "google.com": "Google",
  google: "Google",
  github: "GitHub",
};

function initialsFor(name?: string | null, email?: string | null) {
  const source = (name ?? email ?? "??").trim();
  if (!source) return "??";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarTone(seed: string) {
  const palette = [
    "bg-primary/12 text-primary",
    "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    "bg-amber-500/12 text-amber-700 dark:text-amber-300",
    "bg-sky-500/12 text-sky-700 dark:text-sky-300",
    "bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300",
    "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export default function MembersPageClient({
  initialMembers = [],
}: {
  initialMembers?: Member[];
}) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | Role>("all");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Member | null>(null);
  const [confirmRole, setConfirmRole] = useState<{
    member: Member;
    nextRole: "admin" | "user";
  } | null>(null);

  const authHeaders = useCallback(async () => {
    const idToken = await user?.getIdToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    };
  }, [user]);

  const loadMembers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const collected: Member[] = [];
      let lastId: number | undefined;
      let safety = 0;
      while (safety < 20) {
        const params = new URLSearchParams();
        params.set("limit", String(PAGE_SIZE));
        if (lastId !== undefined) params.set("last-item-id", String(lastId));
        const res = await fetch(
          `${constants.API_BASE}/members?${params.toString()}`,
          { headers: await authHeaders() },
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.message ?? "Erro ao carregar membros.");
        const list: Member[] = Array.isArray(data?.list) ? data.list : [];
        collected.push(...list);
        if (list.length < PAGE_SIZE) break;
        lastId = list[list.length - 1]?.id;
        if (lastId === undefined) break;
        safety++;
      }
      collected.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setMembers(collected);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders, user]);

  useEffect(() => {
    if (initialMembers.length === 0) {
      void loadMembers();
    }
  }, [initialMembers.length, loadMembers]);

  const stats = useMemo(() => {
    const counts: Record<Role, number> = {
      owner: 0,
      admin: 0,
      user: 0,
      not_provided: 0,
    };
    for (const m of members) counts[m.role]++;
    return { total: members.length, ...counts };
  }, [members]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return members.filter((m) => {
      if (filterRole !== "all" && m.role !== filterRole) return false;
      if (!term) return true;
      const haystack = `${m.name} ${m.email} ${m.uid} ${m.provider}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [members, search, filterRole]);

  const hasFilters = Boolean(search) || filterRole !== "all";

  if (!user) return null;

  async function applyRole(member: Member, role: "admin" | "user") {
    setPendingId(member.id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(
        `${constants.API_BASE}/member/${member.id}?role=${role}`,
        { method: "PATCH", headers: await authHeaders() },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data?.message ?? "Erro ao atualizar cargo.");
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, role } : m)),
      );
      setSuccess(`${member.name || member.email}: cargo atualizado para ${role}.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setPendingId(null);
      setConfirmRole(null);
    }
  }

  async function performDelete(member: Member) {
    setPendingId(member.id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${constants.API_BASE}/member/${member.id}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Erro ao remover membro.");
      }
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      setSuccess(`${member.name || member.email} removido(a) da operação.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setPendingId(null);
      setConfirmDelete(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background">
      <header className="shrink-0 border-b border-border bg-gradient-to-b from-primary/[0.04] to-transparent px-6 py-7 sm:px-8 sm:py-9">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Organização
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Membros
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              Visualize quem tem acesso à operação, ajuste cargos e remova
              acessos quando necessário. Proprietários não podem ser alterados.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-6 px-6 py-7 sm:px-8 sm:py-8">
        {/* KPIs */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile
            icon={Users}
            label="Total"
            value={stats.total}
            helper="Membros ativos"
            tone="primary"
          />
          <KpiTile
            icon={Crown}
            label="Proprietários"
            value={stats.owner}
            helper="Proprietários"
            tone="amber"
          />
          <KpiTile
            icon={ShieldCheck}
            label="Admins"
            value={stats.admin}
            helper="Acesso administrativo"
            tone="primary"
          />
          <KpiTile
            icon={UserIcon}
            label="Usuários"
            value={stats.user}
            helper="Acesso padrão"
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

        {/* Toolbar + table */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-foreground">
                  Membros da operação
                </h2>
                <Badge variant="outline" className="font-mono">
                  {filtered.length}
                  {hasFilters && filtered.length !== members.length
                    ? ` / ${members.length}`
                    : ""}
                </Badge>
              </div>
              <div className="relative w-full sm:w-80">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, e-mail ou UID…"
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
                Filtrar por cargo
              </span>
              <RoleChips value={filterRole} onChange={setFilterRole} />
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setSearch("");
                    setFilterRole("all");
                  }}
                  className="ml-auto"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {loading && members.length === 0 ? (
            <div className="space-y-2 px-5 py-5">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
                >
                  <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                    <div className="h-2 w-1/2 animate-pulse rounded bg-muted/70" />
                  </div>
                  <div className="h-7 w-20 animate-pulse rounded-md bg-muted" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                <Users className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-3 text-sm font-medium text-foreground">
                {hasFilters
                  ? "Nenhum membro corresponde aos filtros"
                  : "Nenhum membro encontrado"}
              </p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {hasFilters
                  ? "Ajuste a busca ou limpe os filtros para ver mais membros."
                  : "Quando alguém entrar na operação, aparecerá aqui automaticamente."}
              </p>
              {hasFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearch("");
                    setFilterRole("all");
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Membro</th>
                    <th className="px-4 py-3 text-left">Cargo</th>
                    <th className="px-4 py-3 text-left">Provedor</th>
                    <th className="px-4 py-3 text-left">Entrou em</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member) => {
                    const tone = ROLE_TONE[member.role];
                    const RoleIcon = tone.icon;
                    const isMe = member.uid === user.uid;
                    const isOwner = member.role === "owner";
                    const busy = pendingId === member.id;
                    const provider =
                      PROVIDER_LABEL[member.provider] ?? member.provider;
                    return (
                      <tr
                        key={member.id}
                        className="border-t border-border text-foreground transition-colors hover:bg-accent/30"
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1 ring-border ${avatarTone(
                                member.uid,
                              )}`}
                            >
                              {initialsFor(member.name, member.email)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {member.name || "—"}
                                </p>
                                {isMe && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px]"
                                  >
                                    Você
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-0.5 inline-flex items-center gap-1 truncate text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" aria-hidden />
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${tone.chip} ${tone.ring}`}
                          >
                            <RoleIcon className="h-3 w-3" aria-hidden />
                            {tone.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className="text-xs text-muted-foreground">
                            {provider}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          <p className="text-xs tabular-nums text-foreground">
                            {new Date(member.createdAt).toLocaleDateString(
                              "pt-BR",
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(member.createdAt).toLocaleTimeString(
                              "pt-BR",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center justify-end">
                            {isOwner ? (
                              <span className="text-[11px] italic text-muted-foreground">
                                Proprietário protegido
                              </span>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    disabled={busy || isMe}
                                    aria-label={`Ações para ${member.name || member.email}`}
                                  >
                                    <MoreHorizontal aria-hidden />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  {member.role === "admin" ? (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setConfirmRole({
                                          member,
                                          nextRole: "user",
                                        })
                                      }
                                    >
                                      <UserIcon aria-hidden />
                                      Rebaixar
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setConfirmRole({
                                          member,
                                          nextRole: "admin",
                                        })
                                      }
                                    >
                                      <ShieldCheck aria-hidden />
                                      Promover
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => setConfirmDelete(member)}
                                  >
                                    <Trash2 aria-hidden />
                                    Remover
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Confirm role change */}
      <Dialog
        open={Boolean(confirmRole)}
        onOpenChange={(open) => {
          if (!open) setConfirmRole(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmRole?.nextRole === "admin"
                ? "Promover a admin?"
                : "Rebaixar para usuário?"}
            </DialogTitle>
            <DialogDescription>
              {confirmRole && (
                <>
                  <span className="font-medium text-foreground">
                    {confirmRole.member.name || confirmRole.member.email}
                  </span>{" "}
                  passará a ter cargo{" "}
                  <span className="font-medium text-foreground">
                    {ROLE_TONE[confirmRole.nextRole].label}
                  </span>
                  . {ROLE_TONE[confirmRole.nextRole].description}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmRole(null)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() =>
                confirmRole &&
                void applyRole(confirmRole.member, confirmRole.nextRole)
              }
              disabled={pendingId === confirmRole?.member.id}
            >
              <ShieldCheck aria-hidden />
              Confirmar alteração
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600" aria-hidden />
              Remover membro?
            </DialogTitle>
            <DialogDescription>
              {confirmDelete && (
                <>
                  <span className="font-medium text-foreground">
                    {confirmDelete.name || confirmDelete.email}
                  </span>{" "}
                  perderá acesso à operação. A ação não pode ser desfeita.
                </>
              )}
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
              disabled={pendingId === confirmDelete?.id}
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

function RoleChips({
  value,
  onChange,
}: {
  value: "all" | Role;
  onChange: (v: "all" | Role) => void;
}) {
  const options: { value: "all" | Role; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "owner", label: "Proprietários" },
    { value: "admin", label: "Admins" },
    { value: "user", label: "Usuários" },
    { value: "not_provided", label: "Sem cargo" },
  ];
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-0.5">
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

type Tone = "primary" | "amber" | "sky" | "emerald";
const TONE: Record<Tone, { chip: string; ring: string }> = {
  primary: { chip: "bg-primary/10 text-primary", ring: "ring-primary/20" },
  amber: {
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    ring: "ring-amber-500/20",
  },
  sky: {
    chip: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    ring: "ring-sky-500/20",
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
  value: number;
  helper: string;
  tone: Tone;
}) {
  const t = TONE[tone];
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
