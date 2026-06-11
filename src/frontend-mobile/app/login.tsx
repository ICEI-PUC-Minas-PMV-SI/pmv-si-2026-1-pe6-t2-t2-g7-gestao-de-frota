import { useState } from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";

import { AuthField } from "../src/components/auth/AuthField";
import { AuthShell } from "../src/components/auth/AuthShell";
import { GoogleMark } from "../src/components/auth/GoogleMark";
import { Button } from "../src/components/ui/Button";
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
    <AuthShell
      title="Entrar"
      subtitle="Acesse sua conta para continuar"
      heroTag="Central - Matriz"
      heroTitle="Operação conectada"
      footerNote="Acesso restrito a colaboradores autorizados."
    >
      <View className="gap-y-6">
        {error ? (
          <View className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3">
            <Text className="text-sm text-destructive">{error}</Text>
          </View>
        ) : null}

        <View className="gap-y-4">
          <AuthField
            label="E-mail"
            nativeID="login-email"
            placeholder="voce@exemplo.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <AuthField
            label="Senha"
            nativeID="login-password"
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
          leftIcon={<GoogleMark />}
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
    </AuthShell>
  );
}
