import { SignupForm } from "@components/login/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen bg-zinc-950">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-zinc-900 p-12 border-r border-zinc-800">
        <div className="text-white font-semibold text-lg tracking-tight">
          ✦ MyApp
        </div>
        <blockquote className="space-y-2">
          <p className="text-zinc-300 text-xl leading-relaxed">
            "Comece agora e transforme a forma como você gerencia seu trabalho."
          </p>
          <footer className="text-zinc-500 text-sm">
            — Equipe de produto
          </footer>
        </blockquote>
      </div>
 
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <SignupForm />
      </div>
    </main>
  );
}
