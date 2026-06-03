import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect, useMemo } from "react";

import { getGoogleOAuthRedirectUri } from "../lib/google-auth";

WebBrowser.maybeCompleteAuthSession();

function trimEnv(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export function useGoogleSignIn() {
  const webClientId = trimEnv(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
  const iosClientId =
    trimEnv(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) || webClientId;
  const androidClientId =
    trimEnv(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID) || webClientId;

  const redirectUri = useMemo(() => getGoogleOAuthRedirectUri(), []);

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      webClientId,
      iosClientId,
      androidClientId,
      redirectUri,
    },
    {
      scheme: "unitechfrota",
      path: "oauthredirect",
      preferLocalhost: true,
    },
  );

  const ready = useMemo(
    () => Boolean(webClientId && request),
    [webClientId, request],
  );

  useEffect(() => {
    if (__DEV__ && redirectUri) {
      console.log(
        "[Google OAuth] Cadastre esta URI no Google Cloud → Credenciais → Cliente Web → URIs de redirecionamento:\n",
        redirectUri,
      );
    }
  }, [redirectUri]);

  return { request, response, promptAsync, ready, webClientId, redirectUri };
}
