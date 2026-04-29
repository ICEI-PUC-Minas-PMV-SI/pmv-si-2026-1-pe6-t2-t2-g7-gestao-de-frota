"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { SignupForm } from "@components/login/SignupForm";
import { Button } from "@/components/ui/button";

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
      <main className="relative flex min-h-screen bg-background text-foreground">
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
 
      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
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
        <SignupForm />
      </div>
      </main>
    </div>
  );
}
