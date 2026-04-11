# APIs e Web Services - Gestão de Frota

Este backend expõe serviços para autenticação/autorização, gestão de membros, CRUD de veículos e acompanhamento de jornadas com geolocalização.

## Objetivos da API

- Centralizar operações da aplicação de gestão de frota em uma API REST.
- Garantir controle de acesso por identidade autenticada e perfil de usuário.
- Registrar jornada e posição de deslocamento em tempo real.
- Disponibilizar documentação navegável via Swagger (`/docs` em ambiente não produção).

## Modelagem da Aplicação

Principais entidades de domínio:

- `User`: conta do sistema (email, provider, role, etc.).
- `Vehicle`: cadastro de veículos da frota.
- `Journey`: jornada de deslocamento (status, início, usuário).
- `JourneyStop`: paradas planejadas de uma jornada.
- `JourneyPosition`: posições geográficas registradas durante uma jornada.

![Arquitetura da Solução](../docs/img/Gestao-frotas-imagens/modulos-api.jpg)

## Tecnologias Utilizadas

- `NestJS` (framework principal da API)
- `TypeORM` (persistência e mapeamento objeto-relacional)
- `PostgreSQL` (banco de dados)
- `Firebase Admin` (validação de token de autenticação)
- `Swagger` (OpenAPI para documentação)
- `class-validator` e `class-transformer` (validação e transformação de DTOs)
- `Jest` e `Supertest` (testes)

## API Endpoints

Base URL local (padrão): `http://localhost:3030`

## Considerações de Segurança

- A API usa `AuthGuard` global para validar Bearer token.
- O token é validado via Firebase e o usuário é resolvido/sincronizado internamente.
- Há controle de permissão por papéis (`owner`, `admin`, `user`) em endpoints sensíveis.
- `ValidationPipe` global está ativo com:
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `forbidUnknownValues: true`

## Implantação

Fluxo recomendado:

1. Configurar variáveis de ambiente (`.env`, `.env.prod`), especialmente banco e Firebase.
2. Instalar dependências no backend.
3. Executar migrations:
   - `pnpm migrate:run`
4. Build e execução:
   - `pnpm build`
   - `pnpm start:prod`
5. Validar saúde dos endpoints e autenticação após deploy.

## Testes

Comandos úteis:

- `pnpm test`
- `pnpm test:e2e`

### Casos E2E de autenticação

Os cenários E2E de autenticação usam `@nestjs/testing` para subir uma instância global do `AppModule` em `beforeAll`, com todos os controllers carregados. Firebase, TypeORM e `UserRepo` são substituídos por mocks em memória para evitar dependência de serviços externos.

| Caso                             | Requisição                                       | Resultado esperado                                                                            |
| -------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Requisição sem Bearer token      | `GET /members`                                   | `403 Forbidden`; Firebase não deve ser chamado.                                               |
| Bearer token inválido            | `GET /members`                                   | `403 Forbidden`; validação de token deve ser chamada com `checkRevoked=true`.                 |
| Sincronização de usuário novo    | `POST /account/sync`                             | `201 Created`; cria usuário em memória e retorna `uid`, `email`, `name`, `provider` e `role`. |
| Atualização da conta autenticada | `PATCH /account/:id`                             | `200 OK`; atualiza o nome do usuário autenticado.                                             |
| Remoção da conta autenticada     | `DELETE /account/:id`                            | `204 No Content`; remove usuário no Firebase mockado e no repositório mockado.                |
| Listagem de membros              | `GET /members?limit=2`                           | `200 OK`; retorna lista paginada e total.                                                     |
| Busca de membro                  | `GET /member/:id`                                | `200 OK`; retorna o membro encontrado.                                                        |
| Alteração de cargo sem permissão | `PATCH /member/:id?role=admin` com usuário comum | `403 Forbidden`.                                                                              |
| Alteração de cargo com admin     | `PATCH /member/:id?role=admin` com admin         | `200 OK`; retorna membro com `role=admin`.                                                    |
| Remoção de owner                 | `DELETE /member/:id` para usuário `owner`        | `401 Unauthorized`; operação bloqueada pelo `PreventOwnerGuard`.                              |
| Remoção de membro por admin      | `DELETE /member/:id` com admin                   | `204 No Content`; remove usuário no Firebase mockado e no repositório mockado.                |

### Casos de teste de analytics

Os testes de analytics foram adicionados em duas camadas: unitária para validar o mapeamento dos serviços sobre as views e E2E para validar autenticação, contrato HTTP e shape final exposto pelos endpoints `/analytics`.

| Tipo     | Arquivo                                                                 | Caso                                                                 | Resultado esperado                                                                                  |
| -------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Unitário | `test/unit/modules/analytics/services/GetDashboard.service.spec.ts`     | Conversão dos campos do dashboard                                    | `totalUsers`, `totalVehicles`, `totalJourneys`, `journeysInProgress` e `journeysFinished` como `number`. |
| Unitário | `test/unit/modules/analytics/services/GetUsersAnalytics.service.spec.ts` | Mapeamento da lista de usuários                                      | `userId` convertido para `number`; `name`, `email` e `role` preservados; totais expostos como `number`. |
| Unitário | `test/unit/modules/analytics/services/GetJourneysAnalytics.service.spec.ts` | Mapeamento de jornadas com campos preenchidos                        | `userId` convertido para `number`; `journeyId`, `journeyName`, `status`, `startedAt`, `userName` e `userEmail` preservados. |
| Unitário | `test/unit/modules/analytics/services/GetJourneysAnalytics.service.spec.ts` | Tratamento de campos opcionais nulos                                 | `journey_name` e `user_name` nulos são retornados como campos opcionais ausentes (`undefined`).    |
| E2E      | `test/e2e/analytics.e2e-spec.ts`                                        | Acesso sem Bearer token ao dashboard                                 | `403 Forbidden`; validação de token não deve ser chamada.                                           |
| E2E      | `test/e2e/analytics.e2e-spec.ts`                                        | `GET /analytics/dashboard` autenticado                               | `200 OK`; retorna objeto único com campos numéricos no formato do DTO.                              |
| E2E      | `test/e2e/analytics.e2e-spec.ts`                                        | `GET /analytics/users` autenticado                                   | `200 OK`; retorna array com `userId`, `name`, `email`, `role`, `totalJourneys`, `journeysInProgress` e `journeysFinished`. |
| E2E      | `test/e2e/analytics.e2e-spec.ts`                                        | `GET /analytics/journeys` autenticado                                | `200 OK`; retorna array com campos do DTO e omite opcionais ausentes em jornadas sem nome/usuário. |

### Casos E2E de veículos

Os cenários E2E de veículos usam a mesma infraestrutura de `setup.ts`, com autenticação, Firebase e repositórios substituídos por mocks em memória para validar o comportamento HTTP do módulo sem dependências externas.

| Caso                                      | Requisição                                  | Resultado esperado                                                                 |
| ----------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Listagem sem autenticação                 | `GET /vehicle`                              | `403 Forbidden`; Firebase não deve ser chamado.                                    |
| Listagem autenticada de veículos          | `GET /vehicle` com usuário autenticado      | `200 OK`; retorna os veículos mockados com `id`, `marca`, `modelo`, `ano` e `placa`. |
| Busca de veículo por id                   | `GET /vehicle/:id`                          | `200 OK`; retorna o veículo correspondente ao identificador informado.             |
| Criação de veículo com payload válido     | `POST /vehicle`                             | `201 Created`; cria veículo e retorna dados persistidos, incluindo timestamps.     |
| Criação de veículo com placa inválida     | `POST /vehicle` com `placa` fora do padrão  | `400 Bad Request`; payload rejeitado pela validação.                               |
| Atualização de veículo existente          | `PATCH /vehicle/:id`                        | `200 OK`; atualiza os campos enviados e retorna o veículo atualizado.              |
| Atualização de veículo inexistente        | `PATCH /vehicle/:id` com id inexistente     | `404 Not Found`; atualização rejeitada por ausência do registro.                   |
| Remoção de veículo existente              | `DELETE /vehicle/:id`                       | `204 No Content`; aciona a exclusão no repositório mockado.                        |

### Casos E2E de incidentes

Os cenários E2E de incidentes usam a mesma infraestrutura de `setup.ts`, com autenticação, Firebase e repositório de incidentes substituídos por mocks em memória para validar o comportamento HTTP do módulo sem dependências externas.

| Caso                                       | Requisição                                               | Resultado esperado                                                                                  |
| ------------------------------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Listagem sem autenticação                  | `GET /incident`                                          | `403 Forbidden`; Firebase não deve ser chamado.                                                     |
| Listagem autenticada de incidentes         | `GET /incident` com usuário autenticado                  | `200 OK`; retorna os incidentes mockados com `id`, `vehicleId`, `tipo`, `descricao`, `valor` e datas. |
| Busca de incidente por id                  | `GET /incident/:id`                                      | `200 OK`; retorna o incidente correspondente ao identificador informado.                             |
| Listagem de incidentes por veículo         | `GET /incident/vehicle/:vehicleId`                       | `200 OK`; retorna apenas os incidentes vinculados ao `vehicleId` informado.                         |
| Criação de incidente com payload válido    | `POST /incident`                                         | `201 Created`; cria incidente e retorna dados persistidos, incluindo timestamps.                    |
| Criação de incidente com descrição inválida | `POST /incident` com `descricao` acima de 1024 caracteres | `400 Bad Request`; payload rejeitado pela validação.                                                |
| Atualização de incidente existente         | `PATCH /incident/:id`                                    | `200 OK`; atualiza os campos enviados e retorna o incidente atualizado.                             |
| Atualização de incidente inexistente       | `PATCH /incident/:id` com id inexistente                 | `404 Not Found`; atualização rejeitada por ausência do registro.                                    |
| Remoção de incidente existente             | `DELETE /incident/:id`                                   | `204 No Content`; aciona a exclusão no repositório mockado.                                         |

