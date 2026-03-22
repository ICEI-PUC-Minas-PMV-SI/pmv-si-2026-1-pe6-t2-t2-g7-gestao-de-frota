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
  onAuthStateChanged,
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
 
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}
 
const AuthContext = createContext<AuthContextType | null>(null);
 
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
 
    return () => unsubscribe();
  }, []);
 
  async function signInWithPassword(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      const idToken = await auth.currentUser?.getIdToken()
      if(!idToken) throw new Error("Could not collect idToken!")

      await userModule.gateways.sync.exec({idToken})
      router.push("/dashboard");
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

      await userModule.gateways.sync.exec({idToken, name})
      await updateProfile(user, { displayName: name });
      router.push("/dashboard");
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

      await userModule.gateways.sync.exec({idToken})
      router.push("/dashboard");
    } catch (err) {
      const error = err as AuthError;
      throw new Error(getAuthErrorMessage(error.code));
    }
  }
 
  async function logout() {
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
