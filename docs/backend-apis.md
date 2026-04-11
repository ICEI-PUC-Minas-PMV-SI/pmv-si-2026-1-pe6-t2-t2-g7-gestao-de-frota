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

Relacionamentos relevantes:

- Um `User` pode criar várias `Journey`.
- Uma `Journey` possui várias `JourneyStop`.
- Uma `Journey` possui várias `JourneyPosition`.

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

### Autenticação e Conta

#### `POST /account/sync`

- Objetivo: sincronizar dados do usuário autenticado.
- Auth: Bearer token obrigatório.
- Body:
  ```json
  {
    "name": "John Doe"
  }
  ```
- Sucesso: `201 Created` com dados do usuário.

#### `PATCH /account/:id`

- Objetivo: atualizar dados do usuário atual.
- Auth: Bearer token obrigatório.
- Body:
  ```json
  {
    "name": "John Doe"
  }
  ```
- Sucesso: `200 OK`.

#### `DELETE /account/:id`

- Objetivo: remover conta do usuário atual.
- Auth: Bearer token obrigatório.
- Sucesso: `204 No Content`.

### Membros

#### `GET /members`

- Objetivo: listar membros.
- Auth: Bearer token obrigatório.
- Query params:
  - `limit` (obrigatório)
  - `last-item-id` (opcional, paginação)
- Sucesso: `200 OK`.

#### `GET /member/:id`

- Objetivo: buscar um membro por id.
- Auth: Bearer token obrigatório.
- Sucesso: `200 OK`.

#### `PATCH /member/:id?role=admin|user`

- Objetivo: alterar papel (`role`) de um membro.
- Auth: Bearer token obrigatório.
- Regras: protegido por guardas de membro/perfil.
- Sucesso: `200 OK`.

#### `DELETE /member/:id`

- Objetivo: remover membro.
- Auth: Bearer token obrigatório.
- Regras: protegido por guardas de membro/perfil.
- Sucesso: `204 No Content` (ou `404` se não encontrado).

### Veículos

#### `POST /vehicle`

- Objetivo: criar veículo.
- Auth: Bearer token obrigatório.
- Body:
  ```json
  {
    "marca": "Fiat",
    "modelo": "Uno",
    "ano": 2020,
    "placa": "ABC1D23"
  }
  ```
- Sucesso: `201 Created`.

#### `GET /vehicle`

- Objetivo: listar veículos.
- Auth: Bearer token obrigatório.
- Sucesso: `200 OK`.

#### `GET /vehicle/:id`

- Objetivo: buscar veículo por id.
- Auth: Bearer token obrigatório.
- Sucesso: `200 OK`.

#### `PATCH /vehicle/:id`

- Objetivo: atualizar veículo.
- Auth: Bearer token obrigatório.
- Body (campos opcionais):
  ```json
  {
    "marca": "Fiat",
    "modelo": "Uno Way"
  }
  ```
- Sucesso: `200 OK`.

#### `DELETE /vehicle/:id`

- Objetivo: remover veículo.
- Auth: Bearer token obrigatório.
- Sucesso: `204 No Content`.

### Jornada (Journey)

#### `POST /journey`

- Objetivo: iniciar jornada com paradas.
- Auth: Bearer token obrigatório.
- Body:
  ```json
  {
    "nome": "Entrega manhã - zona sul",
    "paradas": [
      { "ordem": 1, "latitude": -19.8157, "longitude": -43.9542 },
      { "ordem": 2, "latitude": -19.9123, "longitude": -43.8765 }
    ]
  }
  ```
- Sucesso: `201 Created`.

#### `POST /journey/:journeyId/positions`

- Objetivo: registrar posição atual de uma jornada em andamento.
- Auth: Bearer token obrigatório.
- Body:
  ```json
  {
    "latitude": -19.8157,
    "longitude": -43.9542
  }
  ```
- Sucesso: `201 Created`.
- Erros comuns:
  - `404 Not Found`: jornada inexistente.
  - `403 Forbidden`: jornada não está em andamento.

#### `GET /journey/:journeyId/positions/latest`

- Objetivo: obter última posição registrada.
- Auth: Bearer token obrigatório.
- Sucesso: `200 OK`.
- Resposta sem posição:
  ```json
  {
    "temPosicao": false
  }
  ```
- Resposta com posição:
  ```json
  {
    "temPosicao": true,
    "latitude": -19.8157,
    "longitude": -43.9542,
    "registradaEm": "2026-04-07T10:05:00.000Z"
  }
  ```

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

Estratégia atual:

- Testes unitários de serviços para regras de negócio (pasta `src/backend/test/unit/`, espelhando os módulos em `src/`).
- Testes e2e para validar comportamento HTTP da aplicação (`src/backend/test/**/*.e2e-spec.ts`).

Testes de jornada (`test/unit/modules/journey/services/`):

- `CreateJourney.service.spec.ts` — ordenação de paradas e mapeamento da resposta.
- `RecordJourneyPosition.service.spec.ts` — jornada inexistente, fora de andamento e registro de posição.
- `GetLatestJourneyPosition.service.spec.ts` — jornada inexistente, sem posição e última posição.

Testes de veículo (`test/unit/modules/vehicle/services/`):

- `CreateVehicle.service.spec.ts`, `FindAllVehicles.service.spec.ts`, `FindVehicle.service.spec.ts`, `UpdateVehicle.service.spec.ts`, `DeleteVehicle.service.spec.ts`.

Comandos úteis:

- `pnpm test`
- `pnpm test:e2e`
- `pnpm test:e2e:auth`

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

Status atual do relatório E2E:

- Comando principal: `pnpm test:e2e:auth`
- Status atual: suíte passando em ambiente com execução HTTP habilitada.
- Validação unitária complementar: `pnpm test -- --runInBand test/unit/modules/commons/auth` passou com 8 suítes e 27 testes.

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

Status atual do relatório E2E de veículos:

- Comando principal: `pnpm test:e2e -- --runInBand test/e2e/vehicle.e2e-spec.ts`
- Status atual: suíte documentada a partir dos cenários presentes em `test/e2e/vehicle.e2e-spec.ts`.
