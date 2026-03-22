"use client";
 
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@context/auth.context";
 
export function SignupForm() {
  const { signUpWithPassword, signInWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
 
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
 
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
 
    setLoading(true);
    try {
      await signUpWithPassword(name, email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }
 
  async function handleGoogleSignup() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Criar conta
        </h1>
        <p className="text-sm text-zinc-400">
          Preencha os dados abaixo para se cadastrar
        </p>
      </div>
 
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
 
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-widest text-zinc-500">
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Seu nome completo"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
 
        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-widest text-zinc-500">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="voce@exemplo.com"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
 
        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-widest text-zinc-500">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
 
        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-widest text-zinc-500">
            Confirmar senha
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:ring-2
              ${
                confirmPassword && password !== confirmPassword
                  ? "border-red-500/60 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20"
                  : "border-zinc-700 bg-zinc-800/60 focus:border-indigo-500 focus:ring-indigo-500/20"
              }`}
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-400">As senhas não coincidem.</p>
          )}
        </div>
 
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>
 
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-700" />
        <span className="text-xs text-zinc-500">ou</span>
        <div className="h-px flex-1 bg-zinc-700" />
      </div>
 
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleIcon />
        Continuar com Google
      </button>
 
      <p className="text-center text-sm text-zinc-500">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="text-indigo-400 transition hover:text-indigo-300"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
 
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
 
