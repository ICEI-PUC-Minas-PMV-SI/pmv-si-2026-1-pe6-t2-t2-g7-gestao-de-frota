import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AuthError,
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "expo-router";

import { auth, skipFirebaseAuth } from "../config/firebase.config";
import { userModule } from "../core/modules/users/users";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";
import { getAuthErrorMessage } from "../lib/auth-errors";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  googleReady: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [mockUser, setMockUser] = useState<User | null>(null);
  const user = mockUser ?? firebaseUser;
  const [loading, setLoading] = useState(!skipFirebaseAuth);
  const router = useRouter();
  const { response, promptAsync, ready: googleReady } = useGoogleSignIn();
  const googleFlowRef = useRef<{
    resolve: () => void;
    reject: (err: Error) => void;
  } | null>(null);

  useEffect(() => {
    if (skipFirebaseAuth || !auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onIdTokenChanged(auth, (u) => {
      setFirebaseUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (skipFirebaseAuth || !auth || !response) return;

    if (response.type === "success") {
      void (async () => {
        try {
          const idTokenGoogle = response.params.id_token;
          if (!idTokenGoogle) {
            throw new Error("Token do Google ausente na resposta.");
          }
          const credential = GoogleAuthProvider.credential(idTokenGoogle);
          await signInWithCredential(auth!, credential);
          const idToken = await auth!.currentUser?.getIdToken();
          if (!idToken) throw new Error("Could not collect idToken!");
          await userModule.gateways.sync.exec({ idToken });
          router.replace("/(app)/homepage");
          googleFlowRef.current?.resolve();
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : getAuthErrorMessage((err as AuthError).code);
          googleFlowRef.current?.reject(new Error(message));
        } finally {
          googleFlowRef.current = null;
        }
      })();
      return;
    }

    if (
      response.type === "cancel" ||
      response.type === "dismiss" ||
      response.type === "error"
    ) {
      const message =
        response.type === "error"
          ? response.error?.message ?? "Erro no login com Google."
          : getAuthErrorMessage("auth/popup-closed-by-user");
      googleFlowRef.current?.reject(new Error(message));
      googleFlowRef.current = null;
    }
  }, [response, router]);

  async function signInWithPassword(email: string, password: string) {
    if (skipFirebaseAuth) {
      await devBypassLogin();
      return;
    }
    if (!auth) throw new Error("Firebase não configurado.");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Could not collect idToken!");
      await userModule.gateways.sync.exec({ idToken });
      router.replace("/(app)/homepage");
    } catch (err) {
      const error = err as AuthError;
      throw new Error(getAuthErrorMessage(error.code));
    }
  }

  async function signUpWithPassword(
    name: string,
    email: string,
    password: string,
  ) {
    if (skipFirebaseAuth) {
      await devBypassLogin(name);
      return;
    }
    if (!auth) throw new Error("Firebase não configurado.");
    try {
      const { user: created } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(created, { displayName: name });
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Could not collect idToken!");
      await userModule.gateways.sync.exec({ idToken, name });
      router.replace("/(app)/homepage");
    } catch (err) {
      const error = err as AuthError;
      throw new Error(getAuthErrorMessage(error.code));
    }
  }

  async function signInWithGoogle() {
    if (skipFirebaseAuth) {
      throw new Error(
        "Login com Google requer Firebase configurado (remova EXPO_PUBLIC_SKIP_FIREBASE_AUTH).",
      );
    }
    if (!auth) throw new Error("Firebase não configurado.");
    if (!googleReady) {
      throw new Error(
        "Google Sign-In não configurado. Defina EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID no .env.",
      );
    }
    return new Promise<void>((resolve, reject) => {
      googleFlowRef.current = { resolve, reject };
      promptAsync().catch((err) => {
        googleFlowRef.current = null;
        reject(err instanceof Error ? err : new Error(String(err)));
      });
    });
  }

  async function logout() {
    if (skipFirebaseAuth) {
      setMockUser(null);
      router.replace("/login");
      return;
    }
    if (!auth) return;
    await signOut(auth);
    router.replace("/login");
  }

  async function devBypassLogin(displayName?: string) {
    const created = createDevMockUser(displayName);
    setMockUser(created);
    const idToken = await created.getIdToken();
    if (idToken) {
      try {
        await userModule.gateways.sync.exec({ idToken, name: displayName });
      } catch {
        // sync opcional se API/token indisponível em dev
      }
    }
    router.replace("/(app)/homepage");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        googleReady: skipFirebaseAuth ? false : googleReady,
        signInWithPassword,
        signUpWithPassword,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

function createDevMockUser(displayName?: string): User {
  const token = process.env.EXPO_PUBLIC_DEV_ID_TOKEN?.trim() ?? "";
  return {
    uid: "dev-local-user",
    email: "dev@local.invalid",
    displayName: displayName ?? "Dev local",
    emailVerified: true,
    isAnonymous: false,
    metadata: {} as User["metadata"],
    providerData: [],
    refreshToken: "",
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => token,
    getIdTokenResult: async () => {
      throw new Error("getIdTokenResult não disponível no modo dev.");
    },
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null,
    providerId: "password",
  } as unknown as User;
}
