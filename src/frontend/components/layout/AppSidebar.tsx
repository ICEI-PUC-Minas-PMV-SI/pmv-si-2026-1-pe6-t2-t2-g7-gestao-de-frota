"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "firebase/auth";
import {
  AlertTriangle,
  Car,
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  LogOut,
  Map,
  Moon,
  Sun,
  UserCog,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const nav = [
  { href: "/homepage", label: "Início", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Mapa", icon: Map },
  { href: "/vehicles", label: "Veículos", icon: Car },
  { href: "/incidents", label: "Incidentes", icon: AlertTriangle },
  { href: "/members", label: "Membros", icon: Users },
  { href: "/account", label: "Conta", icon: UserCog },
] as const;

export function AppSidebar({
  user,
  collapsed,
  onCollapsedChange,
  theme,
  onThemeChange,
  onLogout,
}: {
  user: User;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  onLogout: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar/95 text-sidebar-foreground transition-[width] duration-200 ease-out",
          collapsed ? "w-17" : "w-60"
        )}
      >
        <div
          className={cn(
            "flex border-b border-sidebar-border",
            collapsed
              ? "flex-col items-center gap-2 px-2 py-4"
              : "items-center gap-2 px-4 py-5"
          )}
        >
          <div
            className={cn(
              "flex min-w-0 items-center gap-2",
              collapsed && "justify-center"
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
              <Building2 className="h-5 w-5" aria-hidden />
            </span>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight text-sidebar-foreground">
                  Unitech
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  Gestão de frota
                </p>
              </div>
            )}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onCollapsedChange(!collapsed)}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-background/60 text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed ? "mt-1" : "ml-auto"
                )}
                aria-expanded={!collapsed}
                aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4" aria-hidden />
                ) : (
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {collapsed ? "Expandir menu" : "Recolher menu"}
            </TooltipContent>
          </Tooltip>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Principal">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/homepage" && pathname.startsWith(href + "/"));
            const link = (
              <Link
                key={href + label}
                href={href}
                className={cn(
                  "flex items-center rounded-lg text-sm font-medium transition-colors",
                  collapsed
                    ? "justify-center px-0 py-2.5"
                    : "gap-3 px-3 py-2.5",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                {!collapsed && <span>{label}</span>}
                {collapsed && <span className="sr-only">{label}</span>}
              </Link>
            );

            return collapsed ? (
              <Tooltip key={href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {label}
                </TooltipContent>
              </Tooltip>
            ) : (
              link
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className={cn("flex gap-2", collapsed && "flex-col")}>
          <button
            type="button"
            onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
            className={cn(
              "flex w-full cursor-pointer items-center rounded-lg border border-sidebar-border bg-background/60 text-sm font-medium text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              !collapsed && "flex-1",
              collapsed ? "justify-center px-0 py-2.5" : "justify-center px-3 py-2.5"
            )}
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <Moon className="h-4 w-4 shrink-0" aria-hidden />
            )}
          </button>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => void onLogout()}
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-lg border border-red-500/25 bg-red-500/8 text-sm font-medium text-red-700 dark:text-red-300 transition hover:bg-red-500/14",
                  !collapsed && "flex-1",
                  collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5"
                )}
                aria-label="Sair da conta"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                {!collapsed && <span>Sair</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" sideOffset={8}>
                Sair
              </TooltipContent>
            )}
          </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
