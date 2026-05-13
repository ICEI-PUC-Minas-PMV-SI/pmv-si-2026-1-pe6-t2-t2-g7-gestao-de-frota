import { Pressable, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Card } from "../../src/components/ui/Card";
import { useAuth } from "../../src/context/auth.context";

type Shortcut = {
  href: "/(app)/map" | "/(app)/vehicles" | "/(app)/incidents" | "/(app)/account";
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const shortcuts: Shortcut[] = [
  {
    href: "/(app)/map",
    title: "Mapa",
    description: "Inicie uma jornada com GPS ao vivo",
    icon: "map-outline",
  },
  {
    href: "/(app)/vehicles",
    title: "Veículos",
    description: "Consulte a frota disponível",
    icon: "car-outline",
  },
  {
    href: "/(app)/incidents",
    title: "Incidentes",
    description: "Multas e sinistros recentes",
    icon: "alert-circle-outline",
  },
  {
    href: "/(app)/account",
    title: "Conta",
    description: "Seu perfil e preferências",
    icon: "person-outline",
  },
];

export default function HomepageScreen() {
  const { user } = useAuth();
  const firstName =
    user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "motorista";

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-y-6 px-5 py-5">
        <Card>
          <Text className="text-xs font-medium uppercase tracking-widest text-primary">
            Área logada
          </Text>
          <Text className="mt-2 text-2xl font-semibold text-foreground">
            Olá, <Text className="text-primary">{firstName}</Text>
          </Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            Central de operações Unitech. Acompanhe sua frota e jornadas no
            celular.
          </Text>
        </Card>

        <View className="gap-y-3">
          <Text className="text-sm font-medium text-muted-foreground">
            Atalhos
          </Text>
          {shortcuts.map((s) => (
            <Link key={s.href} href={s.href} asChild>
              <Pressable>
                <Card className="flex-row items-center">
                  <View className="mr-4 h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <Ionicons name={s.icon} size={20} color="#1a237e" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {s.title}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {s.description}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#94a3b8"
                  />
                </Card>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
