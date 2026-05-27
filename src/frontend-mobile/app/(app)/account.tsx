import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { updateProfile } from "firebase/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import { auth } from "../../src/config/firebase.config";
import { useAuth } from "../../src/context/auth.context";
import { ApiUser, userModule } from "../../src/core/modules/users/users";
import { useAuthorizedToken } from "../../src/hooks/useAuthorizedToken";

const ROLE_LABEL: Record<ApiUser["role"], string> = {
  owner: "Proprietário",
  admin: "Admin",
  user: "Usuário",
  not_provided: "Sem cargo",
};

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const getToken = useAuthorizedToken();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [name, setName] = useState(user?.displayName ?? "");
  const [loading, setLoading] = useState(true);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setError(null);
    setSyncWarning(null);
    setLoading(true);
    setName(user.displayName ?? user.email?.split("@")[0] ?? "");
    try {
      const idToken = await getToken();
      const res = await userModule.gateways.sync.exec({
        idToken,
        name: user.displayName ?? undefined,
      });
      setProfile(res.body);
      setName(res.body.name ?? "");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar perfil.";
      setSyncWarning(
        `${message} Dados do Firebase ainda aparecem abaixo; tente novamente quando o túnel estiver estável.`,
      );
    } finally {
      setLoading(false);
    }
  }, [getToken, user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function onSave() {
    if (!profile || !user) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError("O nome não pode ficar vazio.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const idToken = await getToken();
      const res = await userModule.gateways.update.exec({
        idToken,
        userId: profile.id,
        name: trimmed,
      });
      setProfile(res.body);
      setName(res.body.name);
      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, { displayName: trimmed });
      }
      setMessage("Perfil atualizado com sucesso.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar perfil.",
      );
    } finally {
      setSaving(false);
    }
  }

  const displayName =
    profile?.name ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Usuário";
  const roleLabel = ROLE_LABEL[profile?.role ?? "not_provided"];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 100,
        paddingHorizontal: 20,
        gap: 20,
      }}
    >
      <View>
        <Text className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          Configurações
        </Text>
        <Text className="mt-1.5 text-2xl font-semibold text-foreground">
          Minha conta
        </Text>
        <Text className="mt-1.5 text-sm text-muted-foreground">
          Atualize seus dados e gerencie a sessão neste dispositivo.
        </Text>
      </View>

      {syncWarning ? (
        <View className="rounded-xl border border-amber-500/40 bg-[#fef3c7] px-4 py-3">
          <Text className="text-sm text-[#92400e]">{syncWarning}</Text>
          <View className="mt-3">
            <Button variant="outline" onPress={loadProfile} loading={loading}>
              Tentar sincronizar de novo
            </Button>
          </View>
        </View>
      ) : null}
      {error ? (
        <View className="rounded-xl border border-destructive/30 bg-[#fee2e2] px-4 py-3">
          <Text className="text-sm text-[#991b1b]">{error}</Text>
        </View>
      ) : null}
      {message ? (
        <View className="rounded-xl border border-[#86efac] bg-[#dcfce7] px-4 py-3">
          <Text className="text-sm text-[#166534]">{message}</Text>
        </View>
      ) : null}

      <Card>
        <View className="flex-row items-center gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-accent">
            <Text className="text-lg font-semibold text-primary">
              {initials(displayName)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">
              {loading ? "Carregando..." : displayName}
            </Text>
            <Text className="text-sm text-muted-foreground">{user?.email}</Text>
            <View className="mt-2 self-start rounded-full bg-accent px-2.5 py-0.5">
              <Text className="text-[11px] font-semibold text-accent-foreground">
                {roleLabel}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      <Card>
        <Text className="mb-4 text-base font-semibold text-foreground">
          Informações do perfil
        </Text>
        <Input
          label="Nome completo"
          placeholder="Como você quer ser chamado(a)"
          value={name}
          onChangeText={setName}
        />
        <View className="mt-4 gap-y-3">
          <ReadOnlyRow label="E-mail" value={user?.email ?? "—"} />
          <ReadOnlyRow
            label="Provedor"
            value={
              profile?.provider ?? user?.providerData[0]?.providerId ?? "—"
            }
          />
          <ReadOnlyRow label="UID" value={user?.uid ?? "—"} mono />
        </View>
        <View className="mt-4">
          <Button
            onPress={onSave}
            loading={saving}
            disabled={loading || !profile}
          >
            Salvar alterações
          </Button>
          {!profile && !loading ? (
            <Text className="mt-2 text-xs text-muted-foreground">
              Sincronize com a API para habilitar edição do perfil.
            </Text>
          ) : null}
        </View>
      </Card>

      <Card>
        <View className="flex-row items-center gap-2">
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text className="text-base font-semibold text-foreground">Sessão</Text>
        </View>
        <Text className="mt-2 text-sm text-muted-foreground">
          Encerre sua sessão neste dispositivo com segurança.
        </Text>
        <View className="mt-4">
          <Button variant="destructive" onPress={logout}>
            Sair da conta
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ReadOnlyRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <View>
      <Text className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Text
        className={`mt-1 text-sm text-foreground ${mono ? "font-mono text-xs" : ""}`}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}
