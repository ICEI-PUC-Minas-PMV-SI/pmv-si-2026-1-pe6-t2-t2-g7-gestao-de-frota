import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
  AuthError,
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithPopup,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "expo-router";

import { auth, skipFirebaseAuth } from "../config/firebase.config";
import { userModule } from "../core/modules/users/users";

WebBrowser.maybeCompleteAuthSession();

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

  const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  const googleAndroidClientId =
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim();
  const googleClientIdForPlatform = Platform.select({
    web: googleWebClientId,
    ios: googleIosClientId || googleWebClientId,
    android: googleAndroidClientId || googleWebClientId,
    default: googleWebClientId,
  });
  const googleClientIdFallback =
    googleClientIdForPlatform ||
    googleWebClientId ||
    googleIosClientId ||
    googleAndroidClientId ||
    "missing-google-client-id";

  const [googleRequest, , promptGoogleAsync] = Google.useAuthRequest({
    clientId: googleClientIdFallback,
    webClientId: googleWebClientId || googleClientIdFallback,
    iosClientId: googleIosClientId || googleClientIdFallback,
    androidClientId: googleAndroidClientId || googleClientIdFallback,
    scopes: ["openid", "profile", "email"],
  });

  const googleReady =
    Platform.OS === "web"
      ? !skipFirebaseAuth && Boolean(auth)
      : !skipFirebaseAuth &&
          Boolean(auth) &&
          Boolean(googleRequest) &&
          Boolean(googleClientIdForPlatform);

  useEffect(() => {
    if (skipFirebaseAuth || !auth) return;
    const unsubscribe = onIdTokenChanged(
      auth,
      (u) => {
        setFirebaseUser(u);
        setLoading(false);
      },
      () => {
        setFirebaseUser(null);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  async function signInWithPassword(email: string, password: string) {
    if (skipFirebaseAuth) {
      const created = createDevMockUser();
      setMockUser(created);
      const idToken = await created.getIdToken();
      if (idToken) {
        try {
          await userModule.gateways.sync.exec({ idToken });
        } catch {
          // sync opcional em modo sem Firebase
        }
      }
      router.replace("/(app)/dashboard");
      return;
    }
    if (!auth) throw new Error("Firebase não configurado.");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Could not collect idToken!");
      await userModule.gateways.sync.exec({ idToken });
      router.replace("/(app)/dashboard");
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
      const created = createDevMockUser(name);
      setMockUser(created);
      const idToken = await created.getIdToken();
      if (idToken) {
        try {
          await userModule.gateways.sync.exec({ idToken, name });
        } catch {
          // sync opcional em modo sem Firebase
        }
      }
      router.replace("/(app)/dashboard");
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
      router.replace("/(app)/dashboard");
    } catch (err) {
      const error = err as AuthError;
      throw new Error(getAuthErrorMessage(error.code));
    }
  }

  async function signInWithGoogle() {
    if (skipFirebaseAuth) {
      throw new Error("Login com Google indisponível com Firebase desativado.");
    }
    if (!auth) throw new Error("Firebase não configurado.");

    if (Platform.OS === "web") {
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());

        const firebaseIdToken = await auth.currentUser?.getIdToken();
        if (!firebaseIdToken) throw new Error("Could not collect idToken!");

        await userModule.gateways.sync.exec({ idToken: firebaseIdToken });
        router.replace("/(app)/dashboard");
        return;
      } catch (err) {
        const error = err as AuthError | Error;
        if ("code" in error && typeof error.code === "string") {
          throw new Error(getAuthErrorMessage(error.code));
        }
        throw new Error(error.message || "Ocorreu um erro. Tente novamente.");
      }
    }

    if (!googleRequest) {
      throw new Error("Login com Google ainda não está pronto.");
    }

    if (!googleClientIdForPlatform) {
      throw new Error(
        Platform.OS === "web"
          ? "Configure EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID para usar Google na web."
          : "Configure o client ID Google da plataforma atual e, preferencialmente, também o EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.",
      );
    }

    try {
      const result = await promptGoogleAsync();
      if (result.type !== "success") {
        throw new Error("Login com Google cancelado.");
      }

      const idToken = result.params.id_token;
      if (!idToken) {
        throw new Error("Google não retornou id_token.");
      }

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);

      const firebaseIdToken = await auth.currentUser?.getIdToken();
      if (!firebaseIdToken) throw new Error("Could not collect idToken!");

      await userModule.gateways.sync.exec({ idToken: firebaseIdToken });
      router.replace("/(app)/dashboard");
    } catch (err) {
      const error = err as AuthError | Error;
      if ("code" in error && typeof error.code === "string") {
        throw new Error(getAuthErrorMessage(error.code));
      }
      throw new Error(error.message || "Ocorreu um erro. Tente novamente.");
    }
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        googleReady,
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

function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-disabled": "Usuário desativado.",
    "auth/email-already-in-use": "Este e-mail já está em uso.",
    "auth/weak-password": "A senha deve ter no mínimo 6 caracteres.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/popup-closed-by-user": "Login com Google cancelado.",
    "auth/invalid-api-key":
      "Chave de API do Firebase rejeitada (incorreta ou restrita no Google Cloud). Corrija EXPO_PUBLIC_FIREBASE_API_KEY ou defina EXPO_PUBLIC_SKIP_FIREBASE_AUTH=1 / EXPO_PUBLIC_FIREBASE_DISABLE=1 para desenvolvimento. Reinicie o Expo com cache limpo: npx expo start --clear.",
  };
  return messages[code] ?? "Ocorreu um erro. Tente novamente.";
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
