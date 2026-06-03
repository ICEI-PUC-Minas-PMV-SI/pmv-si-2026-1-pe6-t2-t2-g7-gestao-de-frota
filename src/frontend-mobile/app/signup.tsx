import { useState } from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";

import { AuthField } from "../src/components/auth/AuthField";
import { AuthShell } from "../src/components/auth/AuthShell";
import { GoogleMark } from "../src/components/auth/GoogleMark";
import { Button } from "../src/components/ui/Button";
import { useAuth } from "../src/context/auth.context";

export default function SignupScreen() {
  const { signUpWithPassword, signInWithGoogle, googleReady } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await signUpWithPassword(name.trim(), email.trim(), password);
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
      title="Criar conta"
      subtitle="Preencha os dados abaixo para se cadastrar"
      heroTag="Conta empresarial"
      heroTitle="Criação de conta"
      footerNote="Criação de conta em menos de 1 minuto."
    >
      <View className="gap-y-6">
        {error ? (
          <View className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <Text className="text-sm text-red-500">{error}</Text>
          </View>
        ) : null}

        <View className="gap-y-4">
          <AuthField
            label="Nome"
            nativeID="signup-name"
            placeholder="Seu nome completo"
            autoComplete="name"
            value={name}
            onChangeText={setName}
          />
          <AuthField
            label="E-mail"
            nativeID="signup-email"
            placeholder="voce@exemplo.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <AuthField
            label="Senha"
            nativeID="signup-password"
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
          />
          <AuthField
            label="Confirmar senha"
            nativeID="signup-password-confirm"
            placeholder="••••••••"
            secureTextEntry
            autoComplete="new-password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={
              confirmPassword && password !== confirmPassword
                ? "As senhas não coincidem."
                : null
            }
          />
          <Button onPress={onSubmit} loading={loading}>
            Criar conta
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
          {googleReady ? "Continuar com Google" : "Google indisponível"}
        </Button>

        <View className="flex-row justify-center">
          <Text className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
          </Text>
          <Link href="/login" className="text-sm font-medium text-primary">
            Entrar
          </Link>
        </View>
      </View>
    </AuthShell>
  );
}
