# Design Mobile — Unitech Frota

Documento de referência visual e de UX do app móvel (`src/frontend-mobile`), alinhado ao [design web](../frontend/design.md) e a `src/frontend/app/globals.css`.

## 1) Identidade e princípios mobile

- **Mesma marca:** dashboard corporativo Unitech, azul primário `#1A237E`, fundo `#F8FAFC`.
- **Navegação:** menu inferior fixo (tab bar) — padrão de apps modernos; substitui a sidebar do web.
- **Densidade:** cards empilhados, KPIs em grade 2 colunas, gestos de pull-to-refresh.
- **Tipografia:** Inter (`@expo-google-fonts/inter`) como equivalente mobile ao Geist Sans do web.
- **Autenticação:** Firebase (e-mail/senha + Google via `expo-auth-session`), sync `POST /account/sync` — alinhado ao web.

## 2) Tokens de cor (modo claro — padrão atual)

| Token | Hex | Uso |
|-------|-----|-----|
| `background` | `#F8FAFC` | Fundo das telas |
| `foreground` | `#1E293B` | Texto principal |
| `card` | `#FFFFFF` | Cards e tab bar |
| `primary` | `#1A237E` | Marca, tab ativa, títulos de destaque |
| `muted-foreground` | `#475569` | Texto secundário |
| `accent` | `#DBEAFE` | Fundo de ícones e chip primário |
| `border` | `#CBD5E1` | Bordas de cards |
| `ring` | `#38BDF8` | Foco (futuro) |
| `destructive` | `#DC2626` | Erros e ações críticas |
| `success` | `#16A34A` | Estados resolvidos / severidade baixa |
| `warning` | `#CA8A04` | Atenção / incidentes abertos |

Implementação: `tailwind.config.js` + `src/theme/tokens.ts`.

### Modo escuro (planejado)

Seguir o web: background `#0F172A`, primary `#38BDF8`, surface `#1E293B`. Ainda não exposto na UI mobile.

## 3) Tipografia

| Elemento | Estilo |
|----------|--------|
| Eyebrow de módulo | 11px, semibold, uppercase, tracking 0.2em, `text-primary` |
| Título de tela | 24–28px, semibold, `text-foreground` |
| Corpo | 14px, `text-muted-foreground` |
| KPI valor | 24px, semibold, cor por tom |
| Tab bar label | 10px, medium |

## 4) Navegação (tab bar)

Componente: `src/components/layout/AppTabBar.tsx`.

| Tab | Rota | Ícone |
|-----|------|-------|
| Início | `/(app)/homepage` | home |
| Painel | `/(app)/dashboard` | grid |
| Mapa | `/(app)/map` | map |
| Frota | `/(app)/vehicles` | car |
| Incidentes | `/(app)/incidents` | warning |
| Conta | `/(app)/account` | person |

Estilo: fundo branco, borda superior, ícone + label, estado ativo com fundo `accent` e cor `primary`.

## 5) Telas e paridade com o web

| Web | Mobile | Observações |
|-----|--------|-------------|
| `/homepage` | `homepage` | Boas-vindas, chips, atalhos, card “Operação estável” |
| `/dashboard` | `dashboard` | KPIs, incidentes recentes, resumo multas/sinistros |
| `/map` | `map` | Jornada GPS (nativo); preview coords na web |
| `/vehicles` | `vehicles` | Lista + busca + KPIs (sem CRUD no mobile) |
| `/incidents` | `incidents` | Lista + busca + filtro por status |
| `/incidents` | Tab | Lista de incidentes (multas e sinistros) |
| `/account` | `account` | Placeholder até integrar Firebase |

## 6) Componentes reutilizáveis

| Componente | Arquivo |
|------------|---------|
| `AppScreen` | `layout/AppScreen.tsx` — scroll, safe area, refresh |
| `AppTabBar` | `layout/AppTabBar.tsx` |
| `ModuleHeader` | `ui/ModuleHeader.tsx` |
| `KpiCard` | `ui/KpiCard.tsx` |
| `ShortcutCard` | `ui/ShortcutCard.tsx` |
| `Card`, `Badge`, `Button`, `Input` | `ui/*` |
| `SearchInput`, `Chip` | `ui/*` |

## 7) Padrões de UI (espelhando o web)

1. **Cabeçalho de módulo** — eyebrow + título + descrição (`ModuleHeader`).
2. **Faixa de KPIs** — 2 colunas no mobile (`KpiCard`).
3. **Listagens** — `FlatList` + busca + pull-to-refresh.
4. **Badges semânticos** — severidade/status (`src/theme/incidents.ts`).
5. **Cards** — `rounded-xl`, borda `border`, sombra leve `shadow-card`.

## 8) Mapa e plataformas

- **iOS/Android:** `MapJourneyScreen.native.tsx` + `react-native-maps`.
- **Web:** `MapJourneyScreen.tsx` sem mapa nativo; stub Metro em `stubs/react-native-maps.web.js`.

## 9) Autenticação

- Telas `/login` e `/signup` (visitantes) e área `(app)` protegida por `AuthGate`.
- Fluxo igual ao web: login → `getIdToken()` → `POST /account/sync` → `/(app)/homepage`.
- Google: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (+ iOS/Android opcionais).
- Dev sem Firebase: `EXPO_PUBLIC_SKIP_FIREBASE_AUTH=1` + `EXPO_PUBLIC_DEV_ID_TOKEN`.

## 10) Próximos passos

1. Modo escuro com toggle (como `AppSidebar` no web).
2. Detalhe de veículo/incidente (telas push).
3. CRUD mobile onde fizer sentido operacional.
4. Seleção de veículo antes de iniciar jornada no mapa.

## 10) Referências

- [design.md do frontend web](../frontend/design.md)
- [README do mobile](./README.md)
