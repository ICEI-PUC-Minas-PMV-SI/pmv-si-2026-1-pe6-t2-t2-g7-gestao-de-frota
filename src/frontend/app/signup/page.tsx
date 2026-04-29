"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Moon,
  Route,
  ShieldCheck,
  Sun,
  Truck,
} from "lucide-react";
import { SignupForm } from "@components/login/SignupForm";
import { Button } from "@/components/ui/button";
import companyLogo from "../../../../docs/img/Gestao-frotas-imagens/unitech-logo-sem-fundo.png";

const highlights = [
  {
    icon: Truck,
    label: "Operação centralizada",
    detail: "Cadastre-se e acompanhe frota, incidentes e performance em um só lugar.",
  },
  {
    icon: Route,
    label: "Jornadas inteligentes",
    detail: "Planeje rotas, inicie jornadas e monitore o progresso em tempo real.",
  },
  {
    icon: ShieldCheck,
    label: "Acesso seguro",
    detail: "Dados de operação protegidos com autenticação e controle de sessão.",
  },
] as const;

export default function SignupPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("unitech-theme");
      if (stored === "dark") {
        setTheme("dark");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("unitech-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  return (
    <div className={theme === "dark" ? "dark" : undefined}>
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="flex min-h-screen flex-col lg:flex-row">
          <div className="relative hidden shrink-0 overflow-hidden lg:block lg:min-h-screen lg:w-[54%]">
            <Image
              src="/unitech-fleet.png"
              alt="Frota Unitech em operação"
              fill
              className="object-cover object-[center_35%] lg:object-center"
              priority
              sizes="(max-width: 1024px) 100vw, 54vw"
            />
            <div
              className="absolute inset-0 bg-linear-to-br from-slate-950/92 via-blue-950/65 to-cyan-950/35"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(56,189,248,0.12),transparent_55%)]"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,23,42,0.95),transparent_45%)] lg:bg-[linear-gradient(to_right,rgba(15,23,42,0.5),transparent)]"
              aria-hidden
            />

            <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-10 lg:p-14">
              <header className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white">
                    <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                      <Image
                        src={companyLogo}
                        alt="Logo Unitech"
                        width={56}
                        height={56}
                        className="h-full w-full object-contain"
                      />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
                        Unitech
                      </p>
                      <p className="text-lg font-bold tracking-tight text-white md:text-xl">
                        Criação de conta
                      </p>
                    </div>
                  </div>
                  <p className="max-w-md pt-3 text-sm leading-relaxed text-slate-300/95 md:text-base">
                    Cadastre-se para acessar o painel operacional e gerir sua frota
                    com visão de rotas, incidentes e métricas em tempo real.
                  </p>
                </div>
              </header>

              <div className="hidden space-y-4 md:block">
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:gap-4 xl:grid-cols-3">
                  {highlights.map(({ icon: Icon, label, detail }) => (
                    <div
                      key={label}
                      className="group rounded-xl border border-white/10 bg-white/6 p-4 backdrop-blur-md transition hover:border-cyan-400/25 hover:bg-white/9"
                    >
                      <Icon
                        className="mb-3 h-5 w-5 text-cyan-300/90 transition group-hover:text-cyan-200"
                        aria-hidden
                      />
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="mt-1 text-xs leading-snug text-slate-400">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  Criação de conta em menos de 1 minuto
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
            <div className="absolute right-6 top-6 z-10 sm:right-8 sm:top-8">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
              >
                {theme === "dark" ? <Sun aria-hidden /> : <Moon aria-hidden />}
              </Button>
            </div>
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35] lg:opacity-50"
              aria-hidden
            >
              <div className="absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-blue-600/20 blur-[100px]" />
              <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
            </div>
            <div className="relative z-10 w-full max-w-[min(100%,440px)] rounded-2xl border border-border/80 bg-card/90 p-8 shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_32px_64px_-20px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:shadow-[0_0_0_1px_rgba(241,245,249,0.04),0_32px_64px_-20px_rgba(2,6,23,0.75)] sm:p-10">
              <SignupForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
