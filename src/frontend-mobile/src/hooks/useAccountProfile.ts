import { useCallback, useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";

import { auth } from "../config/firebase.config";
import type { ApiUser } from "../core/modules/users/types";
import { userModule } from "../core/modules/users/users";
import { useAuthorizedToken } from "./useAuthorizedToken";
import { getApiErrorMessage } from "../utils/apiError";

export function useAccountProfile(firebaseDisplayName?: string | null) {
  const getToken = useAuthorizedToken();
  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const idToken = await getToken();
      const res = await userModule.gateways.sync.exec({
        idToken,
        name: firebaseDisplayName ?? undefined,
      });
      setProfile(res.body);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [firebaseDisplayName, getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveName = useCallback(
    async (name: string) => {
      if (!profile) throw new Error("Perfil não carregado.");
      const trimmed = name.trim();
      if (!trimmed) throw new Error("O nome não pode ficar vazio.");

      const idToken = await getToken();
      const res = await userModule.gateways.update.exec({
        idToken,
        userId: profile.id,
        name: trimmed,
      });
      setProfile(res.body);

      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, { displayName: trimmed });
      }

      return res.body;
    },
    [getToken, profile],
  );

  return { profile, loading, error, reload: load, saveName, setProfile };
}
