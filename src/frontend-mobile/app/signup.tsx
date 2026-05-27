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
import { Button } from "../src/components/ui/Button";
import { Input } from "../src/components/ui/Input";
import { ScreenContainer } from "../src/components/layout/ScreenContainer";
import { useAuth } from "../src/context/auth.context";

export default function SignupScreen() {
  return (
    <AuthGate mode="guest">
      <SignupForm />
    </AuthGate>
  );
}

function SignupForm() {
  const { signUpWithPassword } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signUpWithPassword(name.trim(), email.trim(), password);
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
                Criar conta
              </Text>
              <Text className="text-sm text-muted-foreground">
                Preencha os campos para começar a usar
              </Text>
            </View>

            {error ? (
              <View className="rounded-md border border-destructive/30 bg-[#fee2e2] px-4 py-3">
                <Text className="text-sm text-[#991b1b]">{error}</Text>
              </View>
            ) : null}

            <View className="gap-y-4">
              <Input
                label="Nome"
                placeholder="Seu nome"
                value={name}
                onChangeText={setName}
              />
              <Input
                label="E-mail"
                placeholder="voce@exemplo.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
              <Input
                label="Senha"
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Button onPress={onSubmit} loading={loading}>
                Criar conta
              </Button>
            </View>

            <View className="flex-row justify-center">
              <Text className="text-sm text-muted-foreground">
                Já tem conta?{" "}
              </Text>
              <Link href="/login" className="text-sm font-medium text-primary">
                Entrar
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
