"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@context/auth.context";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const STORAGE_KEY = "unitech-sidebar-collapsed";

const nav = [
  { href: "/homepage", label: "Início", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Mapa", icon: Map },
  { href: "/vehicles", label: "Veículos", icon: Car },
  { href: "/incidents", label: "Incidentes", icon: AlertTriangle },
] as const;

export function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed, hydrated]);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/80 transition-[width] duration-200 ease-out",
          collapsed ? "w-17" : "w-60"
        )}
      >
        <div
          className={cn(
            "flex border-b border-zinc-800",
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
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/30">
              <Building2 className="h-5 w-5" aria-hidden />
            </span>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight text-white">
                  Unitech
                </p>
                <p className="truncate text-[11px] text-zinc-500">
                  Gestão de frota
                </p>
              </div>
            )}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-950/40 text-zinc-400 transition hover:bg-zinc-800 hover:text-white",
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
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
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

        <div className="border-t border-zinc-800 p-3">
          {!collapsed && (
            <p
              className="truncate px-1 text-xs text-zinc-500"
              title={user.email ?? undefined}
            >
              {user.email}
            </p>
          )}

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="mt-2 flex w-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950/50 py-2 text-zinc-300 transition hover:bg-zinc-800"
                  aria-label="Sair"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Sair ({user.email ?? "conta"})
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={() => logout()}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950/50 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Sair
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
