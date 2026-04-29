# Design atual do Frontend (Unitech)

Este documento descreve o estado **atual** do design da aplicação web, com base na implementação existente em `src/frontend`.

## 1) Visão geral de identidade visual

- **Estilo predominante:** dashboard corporativo, com linguagem visual moderna e foco em operação.
- **Tom visual:** sóbrio e técnico, com ênfase em azul (`--primary`) e variações de slate/cyan.
- **Tema:** suporte a claro e escuro via variáveis CSS em `app/globals.css`.
- **Tipografia:** família Geist (sans/mono) carregada no layout raiz.
- **Padrão de interface:** cards, badges, tabelas, chips de filtro, painéis laterais e folhas modais (sheet).

## 2) Tokens e sistema de design

O frontend usa Tailwind v4 + shadcn com tokens centralizados em `app/globals.css`:

- **Cores base:** `--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--accent`, `--border`.
- **Cores de sidebar:** tokens dedicados (`--sidebar-*`) para manter consistência do menu lateral.
- **Raios de borda:** escala de `--radius-sm` até `--radius-4xl`.
- **Estados visuais recorrentes:**
  - Informativo/primário em azul.
  - Sucesso em verde.
  - Atenção em âmbar/laranja.
  - Crítico/erro em vermelho.

### Mapa de cores (especificação)

#### Modo claro

- **Background (Fundo):** `#F8FAFC`
- **Surface (Superfície):** `#FFFFFF`
- **Primary (Primária):** `#1A237E`
- **Text (Texto):** `#1E293B`

#### Modo escuro

- **Background (Fundo):** `#0F172A`
- **Surface (Superfície):** `#1E293B`
- **Primary (Primária):** `#38BDF8`
- **Text (Texto):** `#F1F5F9`

### Conferência da implementação atual

Comparando a especificação com `app/globals.css`:

- `--background` claro: `#f8fafc` (bate)
- `--card` claro (surface): `#ffffff` (bate)
- `--primary` claro: `#1a237e` (bate)
- `--foreground` claro (text): `#1e293b` (bate)
- `--background` escuro: `#0f172a` (bate)
- `--card` escuro (surface): `#1e293b` (bate)
- `--primary` escuro: `#38bdf8` (bate)
- `--foreground` escuro (text): `#f1f5f9` (bate)

Status: o que está implementado hoje está alinhado com essa especificação de paleta base.

## 3) Estrutura de layout e navegação

### Layout público

- `/` (landing page): hero animado com `motion`, fundo com paths e CTAs para login/cadastro.
- `/login`: tela com split layout (painel visual + formulário).
- `/signup`: tela de cadastro com estrutura mais simples.

### Layout autenticado

- Rotas em `app/(app)` usam `AppShell`.
- `AppShell` protege acesso via autenticação e redireciona para `/login` sem sessão.
- Sidebar fixa e recolhível (`AppSidebar`) com persistência em `localStorage`.
- Navegação principal:
  - `/homepage`
  - `/dashboard`
  - `/map`
  - `/vehicles`
  - `/incidents`
  - `/members`
  - `/account`

## 4) Estado das telas (UI)

## Página pública (`/`)
- Hero visual forte com animações.
- Mensagem institucional de gestão de frotas.
- Ações rápidas: acessar painel e criar conta.

## Homepage (`/homepage`)
- Boas-vindas personalizada.
- Cartões de atalho para módulos do sistema.
- Função de “hub” da área logada.

## Dashboard (`/dashboard`)
- Cabeçalho com saudação contextual.
- KPIs principais da operação (frota, incidentes ativos, criticidade, resolução).
- Lista de incidentes recentes.
- Resumo por status/tipo e snapshot de veículos.
- Padrão visual maduro e consistente com o resto do app autenticado.

## Mapa (`/map`)
- Cabeçalho simples e área principal dedicada ao planejador de rotas (`TripRoutePlanner`).
- Foco em operação de jornada/rota (demo).

## Veículos (`/vehicles`)
- Gestão completa com CRUD.
- Busca, paginação, cards visuais e métricas resumidas.
- Sheet para criação/edição.
- Dialogs para confirmação de exclusão e visualização de telemetria/histórico.

## Incidentes (`/incidents`)
- Gestão completa com CRUD.
- Tabela com filtros (tipo/status/severidade), busca e paginação.
- Atualização rápida de status direto na listagem.
- Sheet para formulário e detalhes; dialog de exclusão.

## Membros (`/members`)
- Listagem administrativa de membros.
- Busca/filtro por cargo.
- Ações de promover/rebaixar/remover (com restrições para owner).
- KPIs de distribuição por perfil.

## Conta (`/account`)
- Perfil de usuário com edição de nome.
- Exibição de dados técnicos (UID, token, papel).
- Ações de sessão (logout) e feedback visual claro.

## 5) Componentização e padrões de interação

- **Biblioteca de UI:** coleção ampla em `components/ui` (base shadcn + customizações).
- **Padrões já consolidados:**
  - Header de módulo com subtítulo em uppercase e descrição.
  - Faixa de KPIs no topo de módulos de operação.
  - Banners de feedback para sucesso/erro.
  - Listagens com busca, filtros e paginação.
  - Confirmação explícita para ações destrutivas.
- **Acessibilidade básica:** labels/aria presentes em boa parte dos controles.

## 6) Pontos de inconsistência visível no momento

Apesar do bom nível geral de consistência, existem diferenças entre fluxos:

- `/signup` ainda usa branding genérico (“MyApp”), diferente de “Unitech”.
- Metadados globais ainda padrão de template (`Create Next App`).
- Estilo das telas públicas (`/`, `/login`, `/signup`) não está 100% unificado entre si.
- Existem trechos com strings sem acentuação em algumas páginas.

## 7) Maturidade atual do design

**Estado atual:** intermediário-avançado para a área logada.

- Módulos operacionais principais já têm identidade sólida e padrão consistente.
- Sistema visual com tokens está bem encaminhado.
- A experiência pública/onboarding ainda precisa de alinhamento final de marca.

## 8) Próximos ajustes recomendados (curto prazo)

1. Unificar branding e tom visual entre `/`, `/login` e `/signup`.
2. Atualizar metadados globais (title/description) para produto real.
3. Revisar microcopy (acentuação, nomenclaturas e consistência textual).
4. Consolidar guideline interno (spacing, tipografia, estados e comportamento de componentes) para evolução futura.
