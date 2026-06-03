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

/** Expo usa EXPO_PUBLIC_*; aceita NEXT_PUBLIC_* se você copiou do .env.local do web. */
function publicEnv(expoKey: string, nextKey: string): string {
  return trimEnv(process.env[expoKey]) || trimEnv(process.env[nextKey]);
}

function firebaseWebConfigComplete(): boolean {
  return (
    Boolean(publicEnv("EXPO_PUBLIC_FIREBASE_API_KEY", "NEXT_PUBLIC_FIREBASE_API_KEY")) &&
    Boolean(publicEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN", "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN")) &&
    Boolean(publicEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID", "NEXT_PUBLIC_FIREBASE_PROJECT_ID")) &&
    Boolean(
      publicEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET", "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    ) &&
    Boolean(
      publicEnv(
        "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      ),
    ) &&
    Boolean(publicEnv("EXPO_PUBLIC_FIREBASE_APP_ID", "NEXT_PUBLIC_FIREBASE_APP_ID"))
  );
}

function firebaseWebApiKeyLooksValid(): boolean {
  const k = publicEnv("EXPO_PUBLIC_FIREBASE_API_KEY", "NEXT_PUBLIC_FIREBASE_API_KEY");
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
    apiKey: publicEnv("EXPO_PUBLIC_FIREBASE_API_KEY", "NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: publicEnv(
      "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    ),
    projectId: publicEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID", "NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: publicEnv(
      "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    ),
    messagingSenderId: publicEnv(
      "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    ),
    appId: publicEnv("EXPO_PUBLIC_FIREBASE_APP_ID", "NEXT_PUBLIC_FIREBASE_APP_ID"),
  };
  const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = buildAuth(app);
}

export { auth };

export const googleProvider = skipFirebaseAuth
  ? null
  : new GoogleAuthProvider();
