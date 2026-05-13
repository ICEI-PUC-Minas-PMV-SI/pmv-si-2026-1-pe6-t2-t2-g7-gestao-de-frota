import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AuthError,
  User,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "expo-router";

import { auth, skipFirebaseAuth } from "../config/firebase.config";
import { userModule } from "../core/modules/users/users";

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

  const googleReady = false;

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
      router.replace("/(app)/homepage");
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
      router.replace("/(app)/homepage");
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
    throw new Error("Login com Google desativado neste protótipo.");
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
