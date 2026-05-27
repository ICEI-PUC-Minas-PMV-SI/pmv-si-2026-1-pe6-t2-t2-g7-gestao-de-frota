import { makeRedirectUri } from "expo-auth-session";

/**
 * URI que o Google OAuth exige em "URIs de redirecionamento autorizados"
 * (credencial Web no Google Cloud Console).
 */
export function getGoogleOAuthRedirectUri() {
  return makeRedirectUri({
    scheme: "unitechfrota",
    path: "oauthredirect",
    preferLocalhost: true,
  });
}

/** URIs comuns — cadastre todas se uma só não funcionar. */
export function getGoogleOAuthRedirectUriHints(): string[] {
  const primary = getGoogleOAuthRedirectUri();
  const base = primary.replace(/\/oauthredirect.*$/, "").replace(/\/--\/oauthredirect.*$/, "");
  const hints = new Set([
    primary,
    `${base}/oauthredirect`,
    `${base}/--/oauthredirect`,
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "unitechfrota://oauthredirect",
  ]);
  return [...hints];
}
