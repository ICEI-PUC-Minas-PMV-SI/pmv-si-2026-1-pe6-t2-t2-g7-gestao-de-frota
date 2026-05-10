# Front-end Web

A interface Web da plataforma **Unitech** tem como objetivo centralizar a gestão de frotas em uma experiência única para usuários autenticados, cobrindo cadastro e consulta de veículos, controle de incidentes, visualização de indicadores operacionais, gestão de membros e planejamento de jornadas em mapa.

No contexto da aplicação distribuída, o frontend atua como cliente principal do backend via APIs HTTP autenticadas por token (Firebase ID Token), priorizando produtividade operacional, boa usabilidade e feedback visual para ações críticas.

## Projeto da Interface Web

A interface foi desenvolvida em arquitetura baseada em rotas com **Next.js (App Router)**, separando:

- **Área pública**: landing page (`/`), login (`/login`) e cadastro (`/signup`);
- **Área autenticada**: homepage, dashboard, mapa, veículos, incidentes, membros e conta (envolvidas por shell com sidebar).

Principais decisões de layout e interação:

- Navegação principal por **sidebar fixa** com destaque da rota ativa;
- Suporte a **tema claro/escuro** com persistência em `localStorage`;
- Organização visual por cartões, indicadores e blocos funcionais (KPI, listas, formulários, painéis);
- Telas de CRUD com feedbacks imediatos de sucesso/erro;
- Proteção de área logada por verificação de sessão no cliente e pré-carregamento de dados por rotas server-side quando aplicável.

### Wireframes

As imagens das telas foram inseridas na ordem do fluxo de navegação da aplicação:

![Tela 1](img/Gestao-frotas-imagens/prints-telas-front-web/Captura%20de%20tela%202026-04-29%20131838.png)

![Tela 2](img/Gestao-frotas-imagens/prints-telas-front-web/Captura%20de%20tela%202026-04-29%20131849.png)

![Tela 3](img/Gestao-frotas-imagens/prints-telas-front-web/Captura%20de%20tela%202026-04-29%20131902.png)

![Tela 4](img/Gestao-frotas-imagens/prints-telas-front-web/Captura%20de%20tela%202026-04-29%20131926.png)

![Tela 5](img/Gestao-frotas-imagens/prints-telas-front-web/Captura%20de%20tela%202026-04-29%20131941.png)

![Tela 6](img/Gestao-frotas-imagens/prints-telas-front-web/Captura%20de%20tela%202026-04-29%20131947.png)

![Tela 7](img/Gestao-frotas-imagens/prints-telas-front-web/Captura%20de%20tela%202026-04-29%20132005.png)

![Tela 8](img/Gestao-frotas-imagens/prints-telas-front-web/Captura%20de%20tela%202026-04-29%20132014.png)

![Tela 9](img/Gestao-frotas-imagens/prints-telas-front-web/Captura%20de%20tela%202026-04-29%20132026.png)

![Tela 10](img/Gestao-frotas-imagens/prints-telas-front-web/Captura%20de%20tela%202026-04-29%20132037.png)

![Tela 11](img/Gestao-frotas-imagens/prints-telas-front-web/Captura%20de%20tela%202026-04-29%20132108.png)

### Design Visual

O design visual segue estilo moderno com foco operacional:

- **Paleta**:
  - **Tema claro**: fundo `#F8FAFC`, texto `#1E293B`, primária `#1A237E`, acento `#DBEAFE`, borda `#CBD5E1`, ring `#38BDF8`;
  - **Tema escuro**: fundo `#0F172A`, texto `#F1F5F9`, card `#1E293B`, primária `#38BDF8`, secundária/acento `#334155`, ring `#38BDF8`;
  - **Landing page (presets configuráveis)**: roxo (base `#120B21`; linhas `#E945F5`, `#C084FC`, `#F1F5F9`), azul (base `#081429`; linhas `#38BDF8`, `#60A5FA`, `#E2E8F0`), esmeralda (base `#072019`; linhas `#34D399`, `#2DD4BF`, `#E2E8F0`) e âmbar (base `#211305`; linhas `#F59E0B`, `#FB923C`, `#FEF3C7`);
- **Tipografia (fontes exatas)**: `Geist Sans` (via `next/font/google`, variável `--font-geist-sans`) como fonte principal da interface; `Geist Mono` (via `next/font/google`, variável `--font-geist-mono`) para conteúdos monoespaçados; `Frizon` (via `next/font/local`, arquivo `src/frontend/fonts/frizon.ttf`) para destaque no título da landing;
- **Iconografia**: biblioteca `lucide-react` para ações e estados de interface;
- **Componentização**: base de componentes reutilizáveis com `shadcn/ui` + Tailwind;
- **Elementos gráficos**: uso de gradientes, vidro fosco (backdrop blur), sombras suaves e microinterações com animação para melhorar percepção de estado.

Diretrizes de UX observadas:

- Feedback claro para operações (toasts, mensagens de erro, confirmação visual);
- Rótulos e placeholders em português;
- Prioridade para legibilidade dos dados de operação (placa, status, severidade, métricas);
- Estados vazios orientados para próxima ação (ex.: convidar para cadastrar primeiro veículo).

## Fluxo de Dados

Fluxo principal da aplicação Web:

1. Usuário acessa páginas públicas (`/`, `/login`, `/signup`);
2. Na autenticação (email/senha ou Google), o Firebase retorna sessão e ID Token;
3. O frontend sincroniza o token em cookie (`fleet_id_token`) e chama endpoint de sincronização de conta no backend;
4. Em área autenticada, a UI envia requisições ao backend em `NEXT_PUBLIC_API_URL` com header `Authorization: Bearer <token>`;
5. Algumas páginas carregam dados iniciais no servidor (`serverFetchJson`) usando o cookie da sessão para SSR/hidratação inicial;
6. Componentes cliente atualizam dados por `fetch`/gateway conforme ações do usuário (CRUD, filtros, atualização de status);
7. No módulo de mapa, o frontend também consome serviços de rota/tiles (LocationIQ e OSRM) para planejamento e simulação de jornada;
8. No logout, sessão é encerrada no Firebase e cookie de autenticação é removido.

Resumo de integrações:

- **Autenticação**: Firebase Auth;
- **API de negócio**: backend da aplicação (veículos, incidentes, membros, conta, jornadas);
- **Mapas/rotas**: LocationIQ + OSRM (com fallback quando indisponível).

![Fluxo de dados Frontend](../docs/img/Gestao-frotas-imagens/fluxo-dados-front.jpg)


## Tecnologias Utilizadas

- **Framework Web**: Next.js 16 (React 19, App Router);
- **Linguagem**: TypeScript (com alguns componentes em JSX);
- **Estilo/UI**: Tailwind CSS 4, `shadcn/ui`, Radix UI, `lucide-react`;
- **Autenticação**: Firebase Authentication;
- **HTTP/API**: `fetch` e `axios` via adapter;
- **Mapa**: Leaflet + LocationIQ + OSRM;
- **Qualidade de código**: ESLint, Prettier, lint-staged;
- **Testes E2E**: Cypress.

## Considerações de Segurança

Medidas aplicadas no frontend:

- Autenticação centralizada em Firebase com renovação/escuta de token (`onIdTokenChanged`);
- Encaminhamento do token no header `Authorization` para acesso aos endpoints protegidos;
- Persistência de sessão em cookie com `SameSite=Lax` para apoiar leitura server-side;
- Redirecionamento para `/login` quando usuário não autenticado tenta acessar área privada;
- Sanitização básica de fluxo por validações de formulário e controle de estados de erro.

Recomendações para produção:

- Definir expiração/rotação de sessão alinhada ao backend;
- Reforçar políticas de segurança HTTP (CSP, `X-Frame-Options`, `Referrer-Policy`);
- Garantir HTTPS em todo o tráfego e armazenamento seguro das variáveis de ambiente;
- Evitar exposição desnecessária de dados sensíveis na interface (especialmente tokens em tela);
- Revisar regras de autorização por papel no backend para cada recurso exibido no frontend.

## Implantação

Implantação sugerida para o frontend Web:

1. Defina os requisitos de hardware e software necessários para implantar a aplicação em um ambiente de produção.
   - Node.js LTS, gerenciador de pacotes (preferencialmente `pnpm`) e acesso às variáveis públicas necessárias.
2. Escolha uma plataforma de hospedagem adequada, como um provedor de nuvem ou um servidor dedicado.
   - Recomendado: Vercel para fluxo nativo com Next.js (ou alternativa com suporte a Node/SSR).
3. Configure o ambiente de implantação, incluindo a instalação de dependências e configuração de variáveis de ambiente.
   - Variáveis mínimas: `NEXT_PUBLIC_API_URL`, chaves `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_LOCATIONIQ_ACCESS_TOKEN`.
4. Faça o deploy da aplicação no ambiente escolhido, seguindo as instruções específicas da plataforma de hospedagem.
   - Passos típicos: instalar dependências, executar build (`pnpm build`) e publicar artefato (`pnpm start` ou deploy gerenciado).
5. Realize testes para garantir que a aplicação esteja funcionando corretamente no ambiente de produção.
   - Validar login/cadastro, navegação protegida, CRUD de veículos/incidentes, mapa/jornada e logout.

## Testes

A estratégia atual prioriza **testes end-to-end (E2E)** para validar jornadas reais do usuário:

- Navegação em páginas públicas;
- Fluxo completo de criação de conta e login;
- Tratamento de erros de autenticação e proteção de rotas privadas;
- Navegação entre módulos protegidos;
- CRUD de veículos e incidentes;
- Edição de perfil e ações da conta;
- Gestão de membros com listagem, busca e bloqueio de ações no próprio usuário;
- Jornada de mapa com validação de disponibilidade de veículo, fallback de rota e controles de planejamento;
- Atalhos e navegação da homepage/dashboard;
- Alternância de tema e logout.

Ferramenta adotada:

- **Cypress** (`pnpm cy:open` e `pnpm cy:run`).

Casos de teste E2E abordados (resumo):

- **`public-pages.cy.ts`**: valida acesso às páginas públicas e transição da landing para login/cadastro;
- **`full-journey.cy.ts`**: smoke test da área autenticada, cobrindo cadastro, login, navegação entre módulos principais, troca de tema e logout;
- **`auth-edge-cases.cy.ts`**: cobre senha divergente no cadastro, senha incorreta no login, tentativa de reutilizar e-mail já cadastrado e redirecionamento de rota protegida para `/login`;
- **`dashboard-home.cy.ts`**: valida atalhos da homepage, navegação para o dashboard e links principais entre módulos;
- **`vehicles-management.cy.ts`**: cobre criação, busca, edição e abertura do modal de telemetria/histórico de um veículo;
- **`incidents-management.cy.ts`**: valida criação, edição, atualização rápida de status, filtros, visualização de detalhes, seleção inválida de veículo e remoção;
- **`members-management.cy.ts`**: testa listagem e busca de membros, além do bloqueio das ações no próprio usuário;
- **`account-management.cy.ts`**: valida atualização de nome, descarte de alterações, visualização/cópia de identificadores e logout pela tela de conta;
- **`map-edge-cases.cy.ts`**: concentra os cenários do mapa, cobrindo bloqueio de início sem pré-requisitos, remoção de paradas, cópia do JSON da rota, limpeza do planejamento, fallback de OSRM e conclusão da jornada completa.

### Cobertura funcional por módulo

- **Páginas públicas**: landing page, login, signup, navegação entre páginas e validações de autenticação.
- **Homepage / Dashboard**: atalhos e links de navegação entre homepage, dashboard e veículos.
- **Veículos**: criação, edição, busca, telemetria, histórico e exclusão.
- **Incidentes**: criação, edição, filtros, atualização de status, detalhes e exclusão.
- **Membros**: listagem, busca e bloqueio de ações no próprio usuário.
- **Conta**: atualização de perfil, descarte de alterações, exposição controlada de identificadores e encerramento de sessão.
- **Mapa / Jornadas**: criação de rota, fallback visual sem OSRM, regras mínimas para iniciar jornada e utilitários do planejador.

### Observações de execução

- Os testes E2E assumem frontend e backend disponíveis, além das integrações já configuradas de Firebase e serviços de mapa.
- Para executar localmente, use `pnpm cy:open` ou `pnpm cy:run` dentro de `src/frontend`.
- Os cenários atuais de membros não exercitam fluxos administrativos felizes; a cobertura está concentrada em listagem, busca e restrição de ações no próprio usuário.
- A tipagem TypeScript do workspace ainda não está preparada para validar a pasta `cypress` via `tsc --noEmit`; atualmente a suíte é validada pela execução do Cypress.

### Evidências dos testes (Cypress)

<img width="345" height="511" alt="screenshot_2026-05-10_16-20-26" src="https://github.com/user-attachments/assets/cb001101-4a31-4b9e-b4a6-5725dbf2764c" />

<img width="369" height="465" alt="screenshot_2026-05-10_16-21-54" src="https://github.com/user-attachments/assets/51843358-0fba-485a-86b9-08c833dcac5f" />

<img width="350" height="518" alt="screenshot_2026-05-10_16-22-55" src="https://github.com/user-attachments/assets/97ab1026-38c6-4fc0-a154-11858395ae4d" />

<img width="353" height="530" alt="screenshot_2026-05-10_16-23-44" src="https://github.com/user-attachments/assets/8fe5b6a3-bfe0-4f8b-ba46-7eff8a5dfe0c" />

<img width="350" height="518" alt="screenshot_2026-05-10_16-28-46" src="https://github.com/user-attachments/assets/d11e036e-d1ec-4087-b805-93628e277165" />

<img width="365" height="302" alt="screenshot_2026-05-10_16-31-16" src="https://github.com/user-attachments/assets/cdff6d61-661b-4537-853f-263b63d949f4" />

<img width="351" height="522" alt="screenshot_2026-05-10_16-31-54" src="https://github.com/user-attachments/assets/b40b9d8a-eb07-481b-b866-b543421f6f06" />

<img width="363" height="357" alt="screenshot_2026-05-10_16-32-28" src="https://github.com/user-attachments/assets/c023f1e3-3d5d-4a54-bd0d-eff0a8bbd12f" />

<img width="355" height="499" alt="screenshot_2026-05-10_16-33-49" src="https://github.com/user-attachments/assets/072e21dd-d028-4d23-b04c-3011edd99003" />


# Referências

- Next.js Documentation: https://nextjs.org/docs
- React Documentation: https://react.dev
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- shadcn/ui Documentation: https://ui.shadcn.com
- Firebase Authentication Documentation: https://firebase.google.com/docs/auth
- Cypress Documentation: https://docs.cypress.io
- Leaflet Documentation: https://leafletjs.com
- LocationIQ API Documentation: https://locationiq.com/docs
- OSRM Project: https://project-osrm.org
