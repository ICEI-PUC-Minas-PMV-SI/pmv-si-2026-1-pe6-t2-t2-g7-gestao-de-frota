import Image from "next/image";
import { Building2, MapPin, Route, Truck } from "lucide-react";
import { LoginForm } from "@components/login/LoginForm";

const highlights = [
  {
    icon: Truck,
    label: "Frota unificada",
    detail: "Visão em tempo real dos veículos",
  },
  {
    icon: Route,
    label: "Rotas inteligentes",
    detail: "Planejamento e execução integrados",
  },
  {
    icon: MapPin,
    label: "Operação centralizada",
    detail: "Matriz e equipes alinhadas",
  },
] as const;

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Painel visual — frota / matriz */}
        <div className="relative h-[min(44vh,380px)] shrink-0 overflow-hidden lg:h-auto lg:min-h-screen lg:w-[54%]">
          <Image
            src="/unitech-fleet.png"
            alt="Sede Unitech e frota de distribuição"
            fill
            className="object-cover object-[center_35%] lg:object-center"
            priority
            sizes="(max-width: 1024px) 100vw, 54vw"
          />
          {/* Camadas de cor — identidade azul corporativa */}
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
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                    <Building2 className="h-5 w-5 text-cyan-200" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
                      Unitech
                    </p>
                    <p className="text-lg font-bold tracking-tight text-white md:text-xl">
                      Central — Matriz
                    </p>
                  </div>
                </div>
                <p className="max-w-md pt-3 text-sm leading-relaxed text-slate-300/95 md:text-base">
                  Plataforma corporativa para gestão de frota, logística e operações
                  em escala — com a mesma precisão da sua equipe no pátio.
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
              <p className="text-xs text-slate-500">
                Acesso restrito a colaboradores autorizados.
              </p>
            </div>
          </div>
        </div>

        {/* Área do formulário */}
        <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] lg:opacity-50"
            aria-hidden
          >
            <div className="absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-blue-600/20 blur-[100px]" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
          </div>

          <div className="relative z-10 w-full max-w-[min(100%,420px)] rounded-2xl border border-border/80 bg-card/90 p-8 shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_32px_64px_-20px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:shadow-[0_0_0_1px_rgba(241,245,249,0.04),0_32px_64px_-20px_rgba(2,6,23,0.75)] sm:p-10">
            <LoginForm />
          </div>

          <p className="relative z-10 mt-8 text-center text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Unitech · Gestão de frota empresarial
          </p>
        </div>
      </div>
    </main>
  );
}
