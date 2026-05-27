import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { AppScreen } from "../../src/components/layout/AppScreen";
import { Card } from "../../src/components/ui/Card";
import { Chip } from "../../src/components/ui/Chip";
import { ShortcutCard } from "../../src/components/ui/ShortcutCard";
import { useAuth } from "../../src/context/auth.context";

export default function HomepageScreen() {
  const { user } = useAuth();
  const firstName =
    user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "operador";

  return (
    <AppScreen
      header={
        <View className="border-b border-border/70 px-5 pb-6 pt-2">
          <Card className="overflow-hidden border-primary/10 bg-card">
            <View className="flex-row items-center gap-3">
              <Image
                source={require("../../assets/images/logo-unitech.png")}
                style={{ width: 44, height: 44, borderRadius: 10 }}
                contentFit="contain"
              />
              <View className="flex-1">
                <Text className="text-xs font-medium uppercase tracking-widest text-primary">
                  Área logada
                </Text>
                <Text className="mt-1 text-2xl font-semibold text-foreground">
                  Olá,{" "}
                  <Text className="text-primary">{firstName}</Text>
                </Text>
              </View>
            </View>
            <Text className="mt-3 text-sm leading-5 text-muted-foreground">
              Central de operações Unitech: acompanhe frota, rotas e indicadores
              no celular. Use o menu inferior ou os atalhos abaixo.
            </Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              <Chip variant="primary">Monitoramento contínuo</Chip>
              <Chip>Operação em tempo real</Chip>
              <Chip>Decisões guiadas por dados</Chip>
            </View>
          </Card>
        </View>
      }
    >
      <View>
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-muted-foreground">Atalhos</Text>
          <Text className="text-xs text-muted-foreground">Acesso rápido</Text>
        </View>
        <View className="gap-y-3">
          <ShortcutCard
            href="/(app)/dashboard"
            title="Painel"
            description="Visão consolidada de desempenho e incidentes."
            icon="grid-outline"
          />
          <ShortcutCard
            href="/(app)/map"
            title="Mapa"
            description="Planejamento de jornadas com GPS ao vivo."
            icon="map-outline"
          />
          <ShortcutCard
            href="/(app)/vehicles"
            title="Veículos"
            description="Consulte e acompanhe a frota cadastrada."
            icon="car-outline"
          />
          <ShortcutCard
            href="/(app)/incidents"
            title="Incidentes"
            description="Multas e sinistros dos veículos."
            icon="alert-circle-outline"
          />
        </View>
      </View>

      <Card>
        <View className="flex-row items-start gap-3">
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-[#dcfce7]">
            <Ionicons name="shield-checkmark-outline" size={20} color="#16a34a" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">
              Operação estável
            </Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Todos os serviços principais estão respondendo normalmente.
            </Text>
          </View>
        </View>
      </Card>
    </AppScreen>
  );
}
