import { initializeApp, getApps, getApp, deleteApp, FirebaseApp } from "firebase/app";
// `getReactNativePersistence` is shipped by firebase/auth but the public types
// don't expose it. We import via a typed re-export so callers stay clean.
import {
  initializeAuth,
  getAuth,
  GoogleAuthProvider,
  Auth,
  // @ts-expect-error — exported from firebase/auth at runtime, not declared in types
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

function trimEnv(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function firebaseWebConfigComplete(): boolean {
  return (
    Boolean(trimEnv(process.env.EXPO_PUBLIC_FIREBASE_API_KEY)) &&
    Boolean(trimEnv(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN)) &&
    Boolean(trimEnv(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID)) &&
    Boolean(trimEnv(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET)) &&
    Boolean(trimEnv(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)) &&
    Boolean(trimEnv(process.env.EXPO_PUBLIC_FIREBASE_APP_ID))
  );
}

function firebaseWebApiKeyLooksValid(): boolean {
  const k = trimEnv(process.env.EXPO_PUBLIC_FIREBASE_API_KEY);
  if (!k) return false;
  return k.startsWith("AIza") && k.length >= 30;
}

const explicitSkipFirebaseAuth =
  process.env.EXPO_PUBLIC_SKIP_FIREBASE_AUTH === "1" ||
  process.env.EXPO_PUBLIC_SKIP_FIREBASE_AUTH === "true" ||
  process.env.EXPO_PUBLIC_FIREBASE_DISABLE === "1" ||
  process.env.EXPO_PUBLIC_FIREBASE_DISABLE === "true";

const forceFirebaseDespiteKeyShape =
  process.env.EXPO_PUBLIC_FIREBASE_CONFIG_OK === "1" ||
  process.env.EXPO_PUBLIC_FIREBASE_CONFIG_OK === "true";

export const skipFirebaseAuth =
  explicitSkipFirebaseAuth ||
  !firebaseWebConfigComplete() ||
  (!forceFirebaseDespiteKeyShape && !firebaseWebApiKeyLooksValid());

function buildAuth(app: FirebaseApp): Auth {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

let auth: Auth | null = null;

if (skipFirebaseAuth) {
  for (const existing of [...getApps()]) {
    void deleteApp(existing).catch(() => {});
  }
} else {
  const firebaseConfig = {
    apiKey: trimEnv(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
    authDomain: trimEnv(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: trimEnv(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: trimEnv(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: trimEnv(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: trimEnv(process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
  };
  const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = buildAuth(app);
}

export { auth };

export const googleProvider = skipFirebaseAuth
  ? null
  : new GoogleAuthProvider();
