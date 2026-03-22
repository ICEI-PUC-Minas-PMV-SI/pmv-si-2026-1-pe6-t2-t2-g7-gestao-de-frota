import { LoginForm } from "@components/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-zinc-950">
      {/* Painel visual esquerdo */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-zinc-900 p-12 border-r border-zinc-800">
        <div className="text-white font-semibold text-lg tracking-tight">
          ✦ MyApp
        </div>
        <blockquote className="space-y-2">
          <p className="text-zinc-300 text-xl leading-relaxed">
            "Simplifique seu fluxo de trabalho e aumente a produtividade do seu time."
          </p>
          <footer className="text-zinc-500 text-sm">
            — Equipe de produto
          </footer>
        </blockquote>
      </div>

      {/* Painel do formulário */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <LoginForm />
      </div>
    </main>
  );
}
