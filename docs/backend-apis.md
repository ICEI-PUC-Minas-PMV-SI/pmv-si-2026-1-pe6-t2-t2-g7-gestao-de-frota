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

- Testes unitários de serviços para regras de negócio.
- Testes e2e para validar comportamento HTTP da aplicação.

Testes adicionados para Jornada:

- `CreateJourney.service.spec.ts`
  - Garante ordenação de paradas e mapeamento da resposta.
- `RecordJourneyPosition.service.spec.ts`
  - Cobre:
    - jornada inexistente (`NotFoundException`)
    - jornada não iniciada (`ForbiddenException`)
    - registro de posição com sucesso
- `GetLatestJourneyPosition.service.spec.ts`
  - Cobre:
    - jornada inexistente (`NotFoundException`)
    - retorno sem posição (`temPosicao: false`)
    - retorno da última posição (`temPosicao: true`)

Comandos úteis:

- `pnpm test`
- `pnpm test:e2e`

## Referências

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Swagger OpenAPI](https://swagger.io/specification/)
