import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTabScreenBottomInset } from "../../src/components/layout/useTabScreenBottomInset";

import { BottomSheetModal } from "../../src/components/ui/BottomSheetModal";
import { Badge } from "../../src/components/ui/Badge";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import { ScreenLoader } from "../../src/components/ui/ScreenLoader";
import { ThemeToggle } from "../../src/components/ui/ThemeToggle";
import { useAuth } from "../../src/context/auth.context";
import { useAccountProfile } from "../../src/hooks/useAccountProfile";
import {
  displayNameFor,
  initialsFor,
  providerLabel,
  ROLE_LABEL,
  ROLE_TONE,
} from "../../src/theme/account";
import { getApiErrorMessage } from "../../src/utils/apiError";
import { notifySuccess, showToast } from "../../src/components/ui/toast";

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Text className="mt-2 text-sm font-medium text-foreground">{value}</Text>
    </View>
  );
}

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = useTabScreenBottomInset();
  const { user, logout } = useAuth();
  const { profile, loading, error, saveName, reload } = useAccountProfile(
    user?.displayName,
  );
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (profile?.name) setDisplayName(profile.name);
    else if (user?.displayName) setDisplayName(user.displayName);
  }, [profile?.name, user?.displayName]);

  const title = displayNameFor(profile, user?.displayName, user?.email);
  const initials = initialsFor(profile?.name ?? user?.displayName, user?.email);
  const role = profile?.role ?? "not_provided";

  async function onSave() {
    setSaving(true);
    try {
      await saveName(displayName);
      notifySuccess("Perfil atualizado.");
      setEditOpen(false);
    } catch (err: unknown) {
      showToast({ message: getApiErrorMessage(err), tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <ScreenLoader message="Carregando perfil..." />;
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: bottomInset }}
    >
      <View className="gap-y-4 px-5 py-5">
        <View className="gap-y-2 px-1">
          <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Perfil
          </Text>
          <Text className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Sua conta
          </Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            Dados da operação, preferências e identificadores da sessão.
          </Text>
        </View>

        {error ? (
          <Card>
            <Text className="text-sm text-destructive">{error}</Text>
            <Button variant="outline" className="mt-3" onPress={() => void reload()}>
              Tentar novamente
            </Button>
          </Card>
        ) : null}

        <Card className="gap-y-4 overflow-hidden p-0">
          <View className="h-16 bg-primary/10" />
          <View className="-mt-8 px-5 pb-5">
            <View className="h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
              <Text className="text-xl font-semibold text-primary">{initials}</Text>
            </View>
            <View className="mt-4 flex-row flex-wrap items-center gap-2">
              <Text className="text-lg font-semibold text-foreground">{title}</Text>
              <Badge tone={ROLE_TONE[role]}>{ROLE_LABEL[role]}</Badge>
            </View>
            <Text className="mt-2 text-sm text-muted-foreground">{user?.email ?? "—"}</Text>
            <Text
              className={`mt-1 text-xs font-medium ${
                user?.emailVerified ? "text-success" : "text-warning"
              }`}
            >
              {user?.emailVerified ? "E-mail verificado" : "E-mail não verificado"}
            </Text>
            {profile?.createdAt ? (
              <Text className="mt-2 text-xs text-muted-foreground">
                Membro desde{" "}
                {new Date(profile.createdAt).toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            ) : null}
          </View>
        </Card>

        <Card className="gap-y-4">
          <Text className="text-base font-semibold text-foreground">
            Informações do perfil
          </Text>
          <ReadOnlyRow label="Nome" value={profile?.name?.trim() || "—"} />
          <ReadOnlyRow
            label="Provedor de login"
            value={providerLabel(profile?.provider ?? user?.providerData[0]?.providerId)}
          />
          <ReadOnlyRow
            label="Última atualização"
            value={
              profile?.updatedAt
                ? new Date(profile.updatedAt).toLocaleString("pt-BR")
                : "—"
            }
          />
          <Button onPress={() => setEditOpen(true)}>Editar nome</Button>
        </Card>

        <Card className="gap-y-4">
          <Text className="text-base font-semibold text-foreground">Preferências</Text>
          <Text className="text-sm text-muted-foreground">
            Aparência do aplicativo neste dispositivo.
          </Text>
          <ThemeToggle />
        </Card>

        <Card className="gap-y-4">
          <Text className="text-base font-semibold text-foreground">
            Identificadores
          </Text>
          <Text className="text-xs text-muted-foreground">
            Referências técnicas da sua conta no sistema.
          </Text>
          {profile?.id !== undefined ? (
            <ReadOnlyRow label="ID interno" value={String(profile.id)} />
          ) : null}
          <View>
            <Text className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              UID Firebase
            </Text>
            <Text className="mt-2 font-mono text-xs leading-5 text-foreground">
              {user?.uid ?? "—"}
            </Text>
          </View>
        </Card>

        <Card className="p-4">
          <Button variant="destructive" onPress={logout}>
            Sair
          </Button>
        </Card>
      </View>

      <BottomSheetModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar nome"
        description="Nome exibido na operação e sincronizado com o servidor."
      >
        <View className="gap-y-4">
          <Input
            label="Nome completo"
            nativeID="account-name"
            placeholder="Como você quer ser chamado(a)"
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={320}
          />
          <Button
            onPress={() => void onSave()}
            loading={saving}
            disabled={!displayName.trim()}
          >
            Salvar alterações
          </Button>
        </View>
      </BottomSheetModal>
    </ScrollView>
  );
}
