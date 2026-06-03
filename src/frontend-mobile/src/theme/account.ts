import type { ApiUser } from "../core/modules/users/types";
import type { Tone } from "../components/ui/Badge";

export const ROLE_LABEL: Record<ApiUser["role"], string> = {
  owner: "Proprietário",
  admin: "Administrador",
  user: "Usuário",
  not_provided: "Sem cargo",
};

export const ROLE_TONE: Record<ApiUser["role"], Tone> = {
  owner: "warning",
  admin: "primary",
  user: "success",
  not_provided: "neutral",
};

const PROVIDER_LABEL: Record<string, string> = {
  "google.com": "Google",
  password: "E-mail e senha",
  "facebook.com": "Facebook",
  "github.com": "GitHub",
  "apple.com": "Apple",
  phone: "Telefone",
  anonymous: "Anônimo",
};

export function providerLabel(provider?: string | null) {
  if (!provider) return "—";
  return PROVIDER_LABEL[provider] ?? provider;
}

export function initialsFor(name?: string | null, email?: string | null) {
  const source = (name ?? email ?? "??").trim();
  if (!source) return "??";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function displayNameFor(
  profile: ApiUser | null,
  firebaseName?: string | null,
  email?: string | null,
) {
  return (
    profile?.name?.trim() ||
    firebaseName?.trim() ||
    email?.split("@")[0] ||
    "Sua conta"
  );
}
