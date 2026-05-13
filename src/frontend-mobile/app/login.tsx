import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Link } from "expo-router";

import { Button } from "../src/components/ui/Button";
import { Input } from "../src/components/ui/Input";
import { ScreenContainer } from "../src/components/layout/ScreenContainer";
import { useAuth } from "../src/context/auth.context";

export default function LoginScreen() {
  const { signInWithPassword, signInWithGoogle, googleReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signInWithPassword(email.trim(), password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <ScreenContainer padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="px-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-y-6">
            <View className="gap-y-1">
              <Text className="text-3xl font-semibold text-foreground">
                Entrar
              </Text>
              <Text className="text-sm text-muted-foreground">
                Acesse sua conta para continuar
              </Text>
            </View>

            {error ? (
              <View className="rounded-md bg-[#fee2e2] px-4 py-3">
                <Text className="text-sm text-[#991b1b]">{error}</Text>
              </View>
            ) : null}

            <View className="gap-y-4">
              <Input
                label="E-mail"
                placeholder="voce@exemplo.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <Input
                label="Senha"
                placeholder="••••••••"
                secureTextEntry
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
              />
              <Button onPress={onSubmit} loading={loading}>
                Entrar com e-mail
              </Button>
            </View>

            <View className="flex-row items-center gap-x-3">
              <View className="h-px flex-1 bg-border" />
              <Text className="text-xs text-muted-foreground">ou</Text>
              <View className="h-px flex-1 bg-border" />
            </View>

            <Button
              variant="outline"
              onPress={onGoogle}
              disabled={!googleReady}
            >
              {googleReady ? "Entrar com Google" : "Google indisponível"}
            </Button>

            <View className="flex-row justify-center">
              <Text className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
              </Text>
              <Link href="/signup" className="text-sm font-medium text-primary">
                Criar conta
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
