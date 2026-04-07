# API Backend - Gestao de Frota

Backend da aplicacao de gestao de frota, desenvolvido com NestJS.

## Requisitos

- Node.js 20+
- pnpm 9+
- PostgreSQL

## Configuracao

Na pasta `src/backend`, crie os arquivos de ambiente conforme necessidade:

- `.env` (desenvolvimento)

As variaveis devem contemplar, no minimo, conexao com banco e credenciais do Firebase usadas na validacao de token.

## Instalacao

```bash
pnpm install
```

## Execucao da API

```bash
# modo desenvolvimento
pnpm start:dev

# modo debug
pnpm start:debug

# modo producao (apos build)
pnpm build
pnpm start:prod
```

A API inicia por padrao na porta `3030` (ou `PORT` definida no ambiente).

## Documentacao Swagger

Em ambiente nao-producao, a documentacao OpenAPI fica disponivel em:

- `http://localhost:3030/docs`

## Scripts de banco (TypeORM)

```bash
# gerar migration
pnpm migrate:generate

# aplicar migrations
pnpm migrate:run

# reverter ultima migration
pnpm migrate:revert
```

## Testes

```bash
# todos os testes unitarios
pnpm test

# testes em watch
pnpm test:watch

# cobertura
pnpm test:cov

# testes e2e
pnpm test:e2e
```

### Executar testes por modulo

```bash
# jornada (services)
pnpm test -- --runInBand modules/journey/services

# veiculos (services)
pnpm test -- --runInBand modules/vehicle/services
```

## Principais modulos

- `auth` e `member`: autenticacao, usuarios e perfis de acesso.
- `vehicle`: cadastro e manutencao de veiculos.
- `journey`: criacao de jornada, paradas e registro de posicoes.

## Endpoints principais

- `/account/*`
- `/members` e `/member/:id`
- `/vehicle/*`
- `/journey/*`

Para detalhes de payloads e respostas, consulte `docs/backend-apis.md`.
