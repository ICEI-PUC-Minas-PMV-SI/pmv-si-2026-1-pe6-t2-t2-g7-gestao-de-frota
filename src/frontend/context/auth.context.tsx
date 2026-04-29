"use client";
 
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signOut,
  AuthError,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@config/firebase.config";
import { userModule } from "@core/modules/users/users";
import { AUTH_TOKEN_COOKIE_NAME } from "@/lib/auth-session";
 
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}
 
const AuthContext = createContext<AuthContextType | null>(null);

function syncAuthCookie(token: string | null) {
  if (typeof document === "undefined") return;

  if (!token) {
    document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }

  document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=${encodeURIComponent(
    token,
  )}; Path=/; Max-Age=3600; SameSite=Lax`;
}
 
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
 
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        syncAuthCookie(idToken);
      } else {
        syncAuthCookie(null);
      }
      setLoading(false);
    });
 
    return () => unsubscribe();
  }, []);
 
  async function signInWithPassword(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      const idToken = await auth.currentUser?.getIdToken()
      if(!idToken) throw new Error("Could not collect idToken!")

      syncAuthCookie(idToken);
      await userModule.gateways.sync.exec({idToken})
      router.push("/homepage");
    } catch (err) {
      const error = err as AuthError;
      throw new Error(getAuthErrorMessage(error.code));
    }
  }
 
  async function signUpWithPassword(name: string, email: string, password: string) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      const idToken = await auth.currentUser?.getIdToken()
      if(!idToken) throw new Error("Could not collect idToken!")

      syncAuthCookie(idToken);
      await userModule.gateways.sync.exec({idToken, name})
      await updateProfile(user, { displayName: name });
      router.push("/homepage");
    } catch (err) {
      const error = err as AuthError;
      throw new Error(getAuthErrorMessage(error.code));
    }
  }
 
  async function signInWithGoogle() {
    try {
      await signInWithPopup(auth, googleProvider);

      const idToken = await auth.currentUser?.getIdToken()
      if(!idToken) throw new Error("Could not collect idToken!")

      syncAuthCookie(idToken);
      await userModule.gateways.sync.exec({idToken})
      router.push("/homepage");
    } catch (err) {
      const error = err as AuthError;
      throw new Error(getAuthErrorMessage(error.code));
    }
  }
 
  async function logout() {
    syncAuthCookie(null);
    await signOut(auth);
    router.push("/login");
  }
 
  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithPassword, signUpWithPassword, signInWithGoogle, logout }}
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
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-disabled": "Usuário desativado.",
    "auth/email-already-in-use": "Este e-mail já está em uso.",
    "auth/weak-password": "A senha deve ter no mínimo 6 caracteres.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/popup-closed-by-user": "Login com Google cancelado.",
  };
  return messages[code] ?? "Ocorreu um erro. Tente novamente.";
}
