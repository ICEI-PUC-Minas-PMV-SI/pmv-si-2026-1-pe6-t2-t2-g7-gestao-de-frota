import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";

import { Badge } from "../../src/components/ui/Badge";
import { BottomSheetModal } from "../../src/components/ui/BottomSheetModal";
import { Card } from "../../src/components/ui/Card";
import { memberModule, Member } from "../../src/core/modules/members/members";
import { useAuthorizedToken } from "../../src/hooks/useAuthorizedToken";

const roleTone: Record<Member["role"], "primary" | "warning" | "neutral"> = {
  owner: "primary",
  admin: "warning",
  user: "neutral",
};
const roleLabel: Record<Member["role"], string> = {
  owner: "Proprietário",
  admin: "Admin",
  user: "Membro",
};
const providerLabel: Record<string, string> = {
  password: "E-mail / Senha",
  "google.com": "Google",
  google: "Google",
  github: "GitHub",
};
const PAGE_SIZE = 10;

export default function MembersScreen() {
  const getToken = useAuthorizedToken();
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Member["role"]>("all");

  const load = useCallback(
    async (
      mode: "reset" | "append" = "reset",
      props?: { lastItemId?: number; currentCount?: number },
    ) => {
      try {
        setError(null);
        const idToken = await getToken();
        const res = await memberModule.gateways.list.exec({
          idToken,
          limit: PAGE_SIZE,
          lastItemId: props?.lastItemId,
        });
        setMembers((current) =>
          mode === "append" ? [...current, ...res.body.list] : res.body.list,
        );
        setTotal(res.body.total);
        const loadedCount =
          mode === "append"
            ? (props?.currentCount ?? 0) + res.body.list.length
            : res.body.list.length;
        setHasMore(
          res.body.list.length === PAGE_SIZE && loadedCount < res.body.total,
        );
      } catch (err: any) {
        setError(err?.message ?? "Erro ao carregar membros.");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [getToken],
  );

  useEffect(() => {
    load("reset");
  }, [load]);

  async function onLoadMore() {
    if (loading || refreshing || loadingMore || !hasMore || members.length === 0) {
      return;
    }
    setLoadingMore(true);
    await load("append", {
      lastItemId: members[members.length - 1]?.id,
      currentCount: members.length,
    });
  }

  const filteredMembers = members.filter((member) => {
    if (roleFilter !== "all" && member.role !== roleFilter) return false;
    if (!search.trim()) return true;
    const haystack = `${member.name ?? ""} ${member.email} ${member.provider}`.toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#1a237e" />
      </View>
    );
  }

  return (
    <>
      <FlatList
        className="flex-1 bg-background"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 28,
          gap: 14,
        }}
        data={filteredMembers}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setHasMore(true);
              load("reset");
            }}
          />
        }
        ListHeaderComponent={
          <View className="gap-y-4">
            <View className="gap-y-1 px-1">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                Membros
              </Text>
              <Text className="text-[28px] font-semibold tracking-tight text-foreground">
                Sua equipe
              </Text>
              <Text className="text-sm text-muted-foreground">
                Veja quem participa da operação e abra os detalhes quando precisar.
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              <SummaryPill label="Total" value={String(total)} />
              <SummaryPill
                label="Admins"
                value={String(members.filter((member) => member.role === "admin").length)}
              />
              <SummaryPill
                label="Owners"
                value={String(members.filter((member) => member.role === "owner").length)}
              />
            </View>

            <Card className="p-4">
              <View className="gap-y-3">
                <View className="flex-row items-center justify-between gap-x-3">
                  <View>
                    <Text className="text-sm font-semibold text-foreground">Buscar</Text>
                    <Text className="text-xs text-muted-foreground">
                      {filteredMembers.length} membro(s) visível(is)
                    </Text>
                  </View>
                  <Badge tone="neutral">{String(filteredMembers.length)}</Badge>
                </View>

                <View className="flex-row items-center rounded-2xl border border-border bg-background px-4">
                  <Ionicons name="search-outline" size={18} color="#64748b" />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Nome, e-mail ou provider"
                    placeholderTextColor="#94a3b8"
                    className="ml-3 min-h-[52px] flex-1 py-3 text-base text-foreground"
                  />
                </View>

                <View className="flex-row flex-wrap gap-2">
                  {(["all", "owner", "admin", "user"] as const).map((option) => {
                    const active = roleFilter === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setRoleFilter(option)}
                        hitSlop={10}
                        className={`rounded-full border px-3 py-2 ${
                          active
                            ? "border-primary bg-accent"
                            : "border-border bg-card"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold uppercase ${
                            active ? "text-accent-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {option === "all"
                            ? "Todos"
                            : option === "owner"
                              ? "Proprietário"
                              : option === "admin"
                                ? "Admin"
                                : "Membro"}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </Card>
          </View>
        }
        ListEmptyComponent={
          <Card className="p-5">
            <Text className="text-sm text-muted-foreground">
              {error ?? "Nenhum membro encontrado."}
            </Text>
          </Card>
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4">
              <ActivityIndicator color="#1a237e" />
            </View>
          ) : !hasMore && members.length > 0 ? (
            <Text className="py-4 text-center text-xs text-muted-foreground">
              Todos os membros foram carregados.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <MemberRow member={item} onPress={() => setSelectedMember(item)} />
        )}
      />

      <BottomSheetModal
        open={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        title={selectedMember?.name ?? selectedMember?.email ?? "Membro"}
        description="Detalhes do membro envolvido na operação."
      >
        {selectedMember ? (
          <View className="gap-y-4">
            <View className="rounded-2xl border border-border bg-background p-4">
              <View className="flex-row items-start gap-x-4">
                <View
                  className={`h-14 w-14 items-center justify-center rounded-2xl border ${
                    selectedMember.role === "owner"
                      ? "border-amber-500/30 bg-amber-500/10"
                      : selectedMember.role === "admin"
                        ? "border-primary/25 bg-primary/10"
                        : "border-sky-500/25 bg-sky-500/10"
                  }`}
                >
                  <Text className="text-base font-semibold text-foreground">
                    {initialsFor(selectedMember.name, selectedMember.email)}
                  </Text>
                </View>
                <View className="flex-1 gap-y-3">
                  <View className="flex-row flex-wrap items-center gap-2">
                    <Badge tone={roleTone[selectedMember.role]}>
                      {roleLabel[selectedMember.role]}
                    </Badge>
                    <Badge tone="neutral">
                      {providerLabel[selectedMember.provider] ?? selectedMember.provider}
                    </Badge>
                  </View>
                  <Text className="text-sm text-muted-foreground">
                    {roleDescription(selectedMember.role)}
                  </Text>
                </View>
              </View>
            </View>

            <DetailCard label="E-mail" value={selectedMember.email} />
            <DetailCard label="UID" value={selectedMember.uid ?? "Não informado"} />

            <View className="flex-row gap-3">
              <DetailCard
                label="Criado em"
                value={new Date(selectedMember.createdAt).toLocaleDateString("pt-BR")}
                className="flex-1"
              />
              <DetailCard
                label="Atualizado em"
                value={new Date(selectedMember.updatedAt).toLocaleDateString("pt-BR")}
                className="flex-1"
              />
            </View>
          </View>
        ) : null}
      </BottomSheetModal>
    </>
  );
}

const MemberRow = memo(function MemberRow({
  member,
  onPress,
}: {
  member: Member;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={10}>
      <Card className="p-4">
        <View className="flex-row items-center gap-x-3">
          <View
            className={`h-12 w-12 items-center justify-center rounded-2xl border ${
              member.role === "owner"
                ? "border-amber-500/30 bg-amber-500/10"
                : member.role === "admin"
                  ? "border-primary/25 bg-primary/10"
                  : "border-sky-500/25 bg-sky-500/10"
            }`}
          >
            <Text className="text-sm font-semibold text-foreground">
              {initialsFor(member.name, member.email)}
            </Text>
          </View>

          <View className="flex-1 gap-y-2">
            <View className="flex-row items-start justify-between gap-x-3">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  {member.name ?? member.email.split("@")[0]}
                </Text>
                <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={1}>
                  {member.email}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </View>

            <View className="flex-row flex-wrap items-center gap-2">
              <Badge tone={roleTone[member.role]}>{roleLabel[member.role]}</Badge>
              <Badge tone="neutral">
                {providerLabel[member.provider] ?? member.provider}
              </Badge>
              <Text className="text-xs text-muted-foreground">
                Desde {new Date(member.createdAt).toLocaleDateString("pt-BR")}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
});

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[92px] rounded-2xl border border-border bg-card px-3 py-3">
      <Text className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </Text>
      <Text className="mt-1 text-lg font-semibold text-foreground">{value}</Text>
    </View>
  );
}

function DetailCard({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <View className={`rounded-2xl border border-border bg-background p-4 ${className}`.trim()}>
      <Text className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Text className="mt-2 text-sm font-medium text-foreground">{value}</Text>
    </View>
  );
}

function initialsFor(name?: string | null, email?: string | null) {
  const source = (name ?? email ?? "??").trim();
  if (!source) return "??";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function roleDescription(role: Member["role"]) {
  if (role === "owner") return "Proprietário da operação. Não pode ser alterado.";
  if (role === "admin") return "Gerencia membros, veículos e incidentes.";
  return "Acesso operacional padrão.";
}
