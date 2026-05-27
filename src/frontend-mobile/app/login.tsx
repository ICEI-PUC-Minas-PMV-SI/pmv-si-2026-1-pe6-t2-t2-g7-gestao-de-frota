import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Link } from "expo-router";
import { Image } from "expo-image";

import { AuthGate } from "../src/components/auth/AuthGate";
import { GoogleIcon } from "../src/components/auth/GoogleIcon";
import { Button } from "../src/components/ui/Button";
import { Input } from "../src/components/ui/Input";
import { ScreenContainer } from "../src/components/layout/ScreenContainer";
import { useAuth } from "../src/context/auth.context";
import { getGoogleOAuthRedirectUriHints } from "../src/lib/google-auth";

export default function LoginScreen() {
  return (
    <AuthGate mode="guest">
      <LoginForm />
    </AuthGate>
  );
}

function LoginForm() {
  const { signInWithPassword, signInWithGoogle, googleReady } = useAuth();
  const redirectHints = __DEV__ ? getGoogleOAuthRedirectUriHints() : [];
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
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
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
          <View className="mb-8 items-center">
            <Image
              source={require("../assets/images/logo-unitech.png")}
              style={{ width: 56, height: 56 }}
              contentFit="contain"
            />
            <Text className="mt-3 text-lg font-semibold text-primary">
              Unitech Frota
            </Text>
          </View>

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
              <View className="rounded-md border border-destructive/30 bg-[#fee2e2] px-4 py-3">
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
              disabled={!googleReady || loading}
              leftIcon={<GoogleIcon />}
            >
              {googleReady ? "Entrar com Google" : "Google não configurado"}
            </Button>

            {__DEV__ && googleReady && redirectHints.length > 0 ? (
              <View className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                <Text className="text-[10px] font-medium text-muted-foreground">
                  Erro redirect_uri_mismatch? No Google Cloud (cliente Web), adicione
                  estas URIs de redirecionamento:
                </Text>
                {redirectHints.map((uri) => (
                  <Text
                    key={uri}
                    className="mt-1 font-mono text-[10px] text-foreground"
                    selectable
                  >
                    {uri}
                  </Text>
                ))}
              </View>
            ) : null}

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
