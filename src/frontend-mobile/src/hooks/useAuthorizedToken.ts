import { useCallback } from "react";
import { auth, skipFirebaseAuth } from "../config/firebase.config";

export function useAuthorizedToken() {
  return useCallback(async () => {
    if (skipFirebaseAuth) {
      const token = process.env.EXPO_PUBLIC_DEV_ID_TOKEN?.trim();
      if (token) return token;
      const mock = await auth?.currentUser?.getIdToken?.();
      if (mock) return mock;
      throw new Error(
        "Defina EXPO_PUBLIC_DEV_ID_TOKEN no .env (modo sem Firebase) ou configure o Firebase.",
      );
    }
    const token = await auth?.currentUser?.getIdToken();
    if (!token) throw new Error("Usuário não autenticado.");
    return token;
  }, []);
}
