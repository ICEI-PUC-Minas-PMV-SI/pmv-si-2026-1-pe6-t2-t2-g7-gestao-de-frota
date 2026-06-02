import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenContainer } from "../layout/ScreenContainer";

type AuthShellProps = {
  title: string;
  subtitle: string;
  heroTag: string;
  heroTitle: string;
  footerNote?: string;
  children: ReactNode;
};

export function AuthShell({
  title,
  subtitle,
  heroTag,
  heroTitle,
  footerNote,
  children,
}: AuthShellProps) {
  return (
    <ScreenContainer padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-[#eff6ff]"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: 0,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="min-h-full w-full">
            <View className="overflow-hidden pb-5 pt-0">
              <View className="overflow-hidden rounded-b-[32px] px-5 pb-5 pt-10">
                <View className="absolute inset-0 bg-[#0f172a]" />

                <View className="relative gap-y-3">
                  <View className="flex-row items-center gap-x-3">
                    <View className="h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                      <Ionicons
                        name="business-outline"
                        size={26}
                        color="#bae6fd"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[11px] font-semibold uppercase tracking-[3px] text-[#bae6fd]">
                        Unitech
                      </Text>
                      <Text className="mt-1 text-xl font-semibold text-white">
                        {heroTitle}
                      </Text>
                    </View>
                  </View>

                  <View>
                    <Text className="text-[10px] font-semibold uppercase tracking-[2.5px] text-[#67e8f9]">
                      {heroTag}
                    </Text>
                  </View>

                  {footerNote ? (
                    <Text className="text-xs text-slate-400">{footerNote}</Text>
                  ) : null}
                </View>
              </View>
            </View>

            <View className="flex-1 bg-background px-5 pb-8 pt-4">
              <View className="mb-6 gap-y-1">
                <Text className="text-3xl font-semibold tracking-tight text-foreground">
                  {title}
                </Text>
                <Text className="text-sm text-muted-foreground">{subtitle}</Text>
              </View>
              <View className="w-full">{children}</View>
            </View>

            <View className="bg-background px-5 pb-6">
              <Text className="text-center text-[11px] text-muted-foreground">
                © {new Date().getFullYear()} Unitech · Gestão de frota empresarial
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
