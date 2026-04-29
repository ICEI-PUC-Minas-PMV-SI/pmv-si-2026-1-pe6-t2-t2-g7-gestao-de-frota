import { SignupForm } from "@components/login/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen bg-background text-foreground">
      <div className="hidden border-r border-border bg-card lg:flex lg:w-1/2 flex-col justify-between p-12">
        <div className="text-lg font-semibold tracking-tight text-foreground">
          ✦ MyApp
        </div>
        <blockquote className="space-y-2">
          <p className="text-xl leading-relaxed text-foreground">
            "Comece agora e transforme a forma como você gerencia seu trabalho."
          </p>
          <footer className="text-sm text-muted-foreground">
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
