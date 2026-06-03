import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { UnitechLogo } from "../brand/UnitechLogo";
import { ThemeToggle } from "../ui/ThemeToggle";

const HERO_BG = "#0f172a";
/** Espaço entre o bloco do hero e o título do formulário. */
const HEADER_FORM_GAP = 28;

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
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen} className="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.root}
      >
        <View style={styles.column}>
          <View style={styles.heroWrap}>
            <View
              style={[
                styles.hero,
                {
                  paddingTop: insets.top + 16,
                  paddingBottom: 24,
                },
              ]}
            >
              <View style={styles.heroTopRow}>
                <View style={styles.brandRow}>
                  <UnitechLogo size={48} />
                  <View style={styles.brandText}>
                    <Text style={styles.brandEyebrow}>Unitech</Text>
                    <Text style={styles.brandTitle}>{heroTitle}</Text>
                  </View>
                </View>
                <ThemeToggle
                  compact
                  className="border-white/20 bg-white/10"
                  iconColor="#bae6fd"
                />
              </View>

              <Text style={styles.heroTag}>{heroTag}</Text>
              {footerNote ? (
                <Text style={styles.heroNote}>{footerNote}</Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.formSection, { paddingTop: HEADER_FORM_GAP }]}>
            <View style={styles.formHeader}>
              <Text className="text-3xl font-semibold tracking-tight text-foreground">
                {title}
              </Text>
              <Text className="mt-1.5 text-sm text-muted-foreground">
                {subtitle}
              </Text>
            </View>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>

          <View
            style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}
          >
            <Text className="text-center text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} Unitech · Gestão de frota empresarial
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  column: {
    flex: 1,
  },
  heroWrap: {
    overflow: "hidden",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  hero: {
    backgroundColor: HERO_BG,
    paddingHorizontal: 20,
    gap: 12,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  brandRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandText: {
    flex: 1,
    minWidth: 0,
  },
  brandEyebrow: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#bae6fd",
  },
  brandTitle: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
  },
  heroTag: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: "#67e8f9",
  },
  heroNote: {
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 18,
  },
  formSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formHeader: {
    marginBottom: 24,
  },
  formScroll: {
    flex: 1,
  },
  formScrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
