import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { updateProfile } from "firebase/auth";

import { BottomSheetModal } from "../../src/components/ui/BottomSheetModal";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import { auth } from "../../src/config/firebase.config";
import { useAuth } from "../../src/context/auth.context";

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  async function onSave() {
    if (!auth?.currentUser) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      setMessage("Perfil atualizado.");
    } catch (err: any) {
      setMessage(err?.message ?? "Erro ao atualizar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-y-4 px-5 py-5">
        <View className="gap-y-2 px-1">
          <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Perfil
          </Text>
          <Text className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Sua conta
          </Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            Dados básicos e preferências do seu acesso.
          </Text>
        </View>

        <Card className="gap-y-4">
          <View>
            <Text className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              E-mail
            </Text>
            <Text className="mt-2 text-base font-semibold text-foreground">
              {user?.email}
            </Text>
          </View>
          <View className="gap-y-4">
            <Text className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              UID
            </Text>
            <Text className="text-sm text-foreground">{user?.uid}</Text>
          </View>
          <View className="gap-y-3">
            <Text className="text-base font-semibold text-foreground">
              Preferências
            </Text>
            <Text className="text-sm text-muted-foreground">
              Atualize o nome exibido pelo aplicativo.
            </Text>
            <Button onPress={() => setEditOpen(true)}>Editar perfil</Button>
            {message ? (
              <Text className="text-xs text-muted-foreground">{message}</Text>
            ) : null}
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
        title="Editar perfil"
        description="Atualize seu nome de exibição."
      >
        <View className="gap-y-4">
          <Input
            label="Nome de exibição"
            placeholder="Seu nome"
            value={displayName}
            onChangeText={setDisplayName}
          />
          <Button
            onPress={async () => {
              await onSave();
              setEditOpen(false);
            }}
            loading={saving}
          >
            Salvar alterações
          </Button>
        </View>
      </BottomSheetModal>
    </ScrollView>
  );
}
