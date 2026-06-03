# Unitech Frota — Mobile (Expo)

Aplicativo móvel do projeto Gestão de Frota construído com **Expo Router** + **React Native** + **NativeWind**. Consome o mesmo backend NestJS (`src/backend`) que o frontend web (`src/frontend`).

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo SDK 54, Expo Router, React Native 0.81 |
| Linguagem | TypeScript |
| Estilo | NativeWind v4 (Tailwind CSS) |
| HTTP | Axios (via `AxiosAdapter` portado do web) |
| Auth | Firebase JS SDK + `expo-auth-session` (Google) |
| Mapa / GPS | `react-native-maps` + `expo-location` |
| Persistência local | `@react-native-async-storage/async-storage` |

## Setup

1. Copie o template de variáveis e preencha:
   ```sh
   cp .env.example .env
   ```
   - `EXPO_PUBLIC_API_URL` deve apontar para o IP da máquina rodando o backend acessível pelo celular (não use `localhost` em dispositivo físico).
   - As `EXPO_PUBLIC_FIREBASE_*` são as mesmas usadas em `src/frontend/.env.local`.
   - O frontend web usa apenas `NEXT_PUBLIC_FIREBASE_*`; o backend valida o `idToken` do Firebase e sincroniza o usuário em `POST /account/sync`.
   - Para Google no mobile, preencha `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` e, preferencialmente, também `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` e `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`.
   - Esses client IDs vêm do Firebase Console → Authentication → Sign-in method → Google → OAuth client IDs.

2. Instale dependências:
   ```sh
   npm install
   ```

3. Inicie o Metro bundler:
   ```sh
   npx expo start
   ```
   Escaneie o QR code com o app **Expo Go** (iOS/Android).

## Scripts

| Script | Função |
|---|---|
| `npx expo start` | Inicia Metro + abre Expo Dev Tools |
| `npx tsc --noEmit` | Type-check |
| `npm run lint` | ESLint (`expo lint`) |

## Design

Guia visual e de UX: **[design-mobile.md](./design-mobile.md)** (alinhado ao [design.md do web](../frontend/design.md)).

## Estrutura

```
app/                 # Rotas (file-based)
  _layout.tsx        # Root: AuthProvider + Stack
  index.tsx          # Gate de autenticação
  login.tsx, signup.tsx
  (app)/             # Protegido (redireciona para /login se deslogado)
    _layout.tsx      # Bottom tabs
    homepage.tsx, dashboard.tsx, map.tsx, vehicles.tsx, incidents.tsx, account.tsx
src/
  components/layout/ # AppTabBar, AppScreen
  screens/           # MapJourneyScreen (.native)
  theme/             # tokens, incidentes
  config/firebase.config.ts
  context/auth.context.tsx
  core/
    adapters/http/   # AxiosAdapter, idêntico ao web
    constants.ts     # API_BASE
    modules/         # users, vehicles, incidents, journeys
  components/        # ui/, layout/
  hooks/             # useAuthorizedToken, useLiveLocation
```

## Mapa & GPS

A tela `/(app)/map` usa `expo-location` para obter coordenadas em tempo real e `react-native-maps` para renderizar (Google Maps no Android, Apple Maps no iOS). Para Android em build standalone, é necessário preencher `android.config.googleMaps.apiKey` em `app.json` com uma chave da Google Cloud Console (Maps SDK for Android).

**Web (`npx expo start --web`):** `react-native-maps` não roda no navegador. A rota `app/(app)/map.tsx` delega para `src/screens/MapJourneyScreen` (`.tsx` na web, `.native.tsx` no celular). O Metro também substitui `react-native-maps` por um stub em builds web. Para mapa completo, use **Expo Go** no celular ou emulador.

## Backend

O app consome `${EXPO_PUBLIC_API_URL}/...`. Endpoints utilizados:

- `POST /account/sync` — sincroniza usuário após login
- `GET /vehicle` — lista veículos
- `GET /incident` — lista incidentes
- `POST /journey` — inicia jornada
- `POST /journey/:id/positions` — registra posição GPS
- `PATCH /journey/:id/complete` — finaliza jornada

A autenticação é via JWT do Firebase enviado em `Authorization: Bearer <idToken>`.

No fluxo Google, não existe rota especial dedicada no backend: o mobile autentica no Google/Firebase, obtém o `idToken` Firebase e chama o mesmo `POST /account/sync` usado pelo frontend web.
