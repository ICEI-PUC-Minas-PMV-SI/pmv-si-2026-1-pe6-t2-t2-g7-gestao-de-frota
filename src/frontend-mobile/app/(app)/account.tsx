import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { updateProfile } from "firebase/auth";

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
      <View className="gap-y-5 px-5 py-5">
        <Card>
          <Text className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Perfil
          </Text>
          <Text className="mt-2 text-base font-semibold text-foreground">
            {user?.email}
          </Text>
          <Text className="mt-1 text-xs text-muted-foreground">
            UID: {user?.uid}
          </Text>
        </Card>

        <Card>
          <View className="gap-y-4">
            <Input
              label="Nome de exibição"
              placeholder="Seu nome"
              value={displayName}
              onChangeText={setDisplayName}
            />
            <Button onPress={onSave} loading={saving}>
              Salvar alterações
            </Button>
            {message ? (
              <Text className="text-xs text-muted-foreground">{message}</Text>
            ) : null}
          </View>
        </Card>

        <Button variant="destructive" onPress={logout}>
          Sair
        </Button>
      </View>
    </ScrollView>
  );
}
