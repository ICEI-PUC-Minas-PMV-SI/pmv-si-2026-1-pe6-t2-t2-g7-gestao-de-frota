"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@context/auth.context";
import { AppSidebar } from "./AppSidebar";

const STORAGE_KEY = "unitech-sidebar-collapsed";
const THEME_STORAGE_KEY = "unitech-theme";
type AppTheme = "light" | "dark";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<AppTheme>("light");

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") {
        setCollapsed(true);
      }
      if (localStorage.getItem(THEME_STORAGE_KEY) === "dark") {
        setTheme("dark");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className={theme === "dark" ? "dark" : undefined}>
      <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar
        user={user}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        theme={theme}
        onThemeChange={setTheme}
        onLogout={logout}
      />
      <div
        className={`flex min-h-screen min-w-0 flex-1 flex-col transition-[padding-left] duration-200 ease-out ${
          collapsed ? "pl-17" : "pl-60"
        }`}
      >
        {children}
      </div>
      </div>
    </div>
  );
}
