# Planejamento de Testes E2E - Módulo de Incidentes

## Visão Geral
Testes End-to-End para validar as operações CRUD e buscas do módulo de incidentes (sinistros e multas) da aplicação de gestão de frota.

## Escopo
- Endpoints REST do módulo de incidentes
- Validação de dados de entrada
- Persistência no banco de dados
- Relacionamento com veículos

---

## Casos de Teste

### 1. CREATE - Criar um novo incidente

#### 1.1 Criar incidente com dados válidos
- **ID**: INC-TC-001
- **Descrição**: Criar um novo registro de sinistro com todos os dados obrigatórios
- **Pré-requisitos**: Veículo deve existir no banco
- **Passos**:
  1. POST `/incident`
  2. Body: `{ vehicleId: "uuid-válido", tipo: "sinistro", descricao: "Colisão traseira", valor: 500.0, data: "2026-04-10T00:00:00.000Z" }`
- **Resultado Esperado**: 
  - Status: 201 Created
  - Response contém ID gerado, timestamps (createdAt, updatedAt)
  - Dados persistidos no banco

#### 1.2 Criar incidente com tipo "multa"
- **ID**: INC-TC-002
- **Descrição**: Criar um novo registro de multa
- **Passos**:
  1. POST `/incident`
  2. Body: `{ vehicleId: "uuid-válido", tipo: "multa", descricao: "Excesso de velocidade", valor: 250.0, data: "2026-04-10T00:00:00.000Z" }`
- **Resultado Esperado**: Status 201, incidente salvo com tipo "multa"

#### 1.3 Criar incidente sem valor (multa/sinistro sem valor informado)
- **ID**: INC-TC-003
- **Descrição**: Campo valor é opcional
- **Passos**:
  1. POST `/incident`
  2. Body: `{ vehicleId: "uuid-válido", tipo: "sinistro", descricao: "Dano leve", data: "2026-04-10T00:00:00.000Z" }`
- **Resultado Esperado**: Status 201, incidente criado com valor = null

#### 1.4 Criar incidente com data atual padrão
- **ID**: INC-TC-004
- **Descrição**: Se data não for informada, usar data atual
- **Passos**:
  1. POST `/incident`
  2. Body: `{ vehicleId: "uuid-válido", tipo: "sinistro", descricao: "Dano na lateral" }`
- **Resultado Esperado**: Status 201, data preenchida com data/hora atual

#### 1.5 Criar incidente com vehicleId inválido
- **ID**: INC-TC-005
- **Descrição**: Validação de referência estrangeira
- **Passos**:
  1. POST `/incident`
  2. Body: `{ vehicleId: "uuid-invalido-nao-existe", tipo: "sinistro", descricao: "Teste", data: "2026-04-10T00:00:00.000Z" }`
- **Resultado Esperado**: Status 400/500 com mensagem de erro

#### 1.6 Criar incidente sem campos obrigatórios
- **ID**: INC-TC-006
- **Descrição**: Validar campos obrigatórios (vehicleId, tipo, descricao, data)
- **Passos**:
  1. POST `/incident` com body vazio ou incompleto
- **Resultado Esperado**: Status 400, mensagem de erro sobre campos faltantes

#### 1.7 Criar incidente com descricao > 1024 caracteres
- **ID**: INC-TC-007
- **Descrição**: Validar limite de tamanho da descrição
- **Passos**:
  1. POST `/incident` com descricao contendo 1025 caracteres
- **Resultado Esperado**: Status 400, erro de validação

---

### 2. READ - Buscar incidentes

#### 2.1 Buscar incidente por ID
- **ID**: INC-TC-008
- **Descrição**: Obter um incidente específico pelo ID
- **Pré-requisitos**: Incidente deve existir
- **Passos**:
  1. GET `/incident/{incidentId}`
- **Resultado Esperado**: 
  - Status: 200 OK
  - Response contém todos os dados do incidente
  - Includes: id, vehicleId, tipo, descricao, valor, data, createdAt, updatedAt

#### 2.2 Buscar incidente inexistente
- **ID**: INC-TC-009
- **Descrição**: Tentar buscar incidente que não existe
- **Passos**:
  1. GET `/incident/uuid-nao-existe`
- **Resultado Esperado**: Status 200 com null/undefined ou 404 Not Found

#### 2.3 Listar todos os incidentes
- **ID**: INC-TC-010
- **Descrição**: Obter lista de todos os incidentes criados
- **Passos**:
  1. GET `/incident`
- **Resultado Esperado**: 
  - Status: 200 OK
  - Response é um array com todos os incidentes
  - Cada item contém dados completos

#### 2.4 Listar incidentes de um veículo específico
- **ID**: INC-TC-011
- **Descrição**: Buscar todos os incidentes relacionados a um veículo
- **Pré-requisitos**: Veículo com incidentes deve existir
- **Passos**:
  1. GET `/incident/vehicle/{vehicleId}`
- **Resultado Esperado**: 
  - Status: 200 OK
  - Array contém apenas incidentes daquele veículo
  - Ordenação consistente

#### 2.5 Listar incidentes de veículo sem incidentes
- **ID**: INC-TC-012
- **Descrição**: Veículo existe mas sem incidentes associados
- **Passos**:
  1. GET `/incident/vehicle/{vehicleId-sem-incidentes}`
- **Resultado Esperado**: Status 200, array vazio

#### 2.6 Listar incidentes com vehicleId inválido
- **ID**: INC-TC-013
- **Descrição**: Usar ID de veículo que não existe
- **Passos**:
  1. GET `/incident/vehicle/uuid-invalido`
- **Resultado Esperado**: Status 200, array vazio (ou 400/404 dependendo da implementação)

---

### 3. UPDATE - Atualizar incidentes

#### 3.1 Atualizar descrição de um incidente
- **ID**: INC-TC-014
- **Descrição**: Modificar descrição de um incidente existente
- **Pré-requisitos**: Incidente deve existir
- **Passos**:
  1. PATCH `/incident/{incidentId}`
  2. Body: `{ descricao: "Descrição atualizada" }`
- **Resultado Esperado**: 
  - Status: 200 OK
  - descricao atualizada
  - updatedAt modificado
  - createdAt não altera
  - outros campos mantêm valores antigos

#### 3.2 Atualizar tipo de incidente
- **ID**: INC-TC-015
- **Descrição**: Mudar tipo de "sinistro" para "multa"
- **Passos**:
  1. PATCH `/incident/{incidentId}`
  2. Body: `{ tipo: "multa" }`
- **Resultado Esperado**: Status 200, tipo atualizado

#### 3.3 Atualizar valor do incidente
- **ID**: INC-TC-016
- **Descrição**: Modificar valor monetário do incidente
- **Passos**:
  1. PATCH `/incident/{incidentId}`
  2. Body: `{ valor: 750.0 }`
- **Resultado Esperado**: Status 200, valor atualizado

#### 3.4 Atualizar data do incidente
- **ID**: INC-TC-017
- **Descrição**: Modificar data do incidente
- **Passos**:
  1. PATCH `/incident/{incidentId}`
  2. Body: `{ data: "2026-03-15T10:30:00.000Z" }`
- **Resultado Esperado**: Status 200, data atualizada

#### 3.5 Atualizar múltiplos campos
- **ID**: INC-TC-018
- **Descrição**: Atualizar vários campos simultaneamente
- **Passos**:
  1. PATCH `/incident/{incidentId}`
  2. Body: `{ tipo: "multa", descricao: "Multa nova", valor: 300.0 }`
- **Resultado Esperado**: Status 200, todos os campos atualizados

#### 3.6 Atualizar incidente inexistente
- **ID**: INC-TC-019
- **Descrição**: Tentar atualizar incidente que não existe
- **Passos**:
  1. PATCH `/incident/uuid-nao-existe`
  2. Body: `{ descricao: "Teste" }`
- **Resultado Esperado**: Status 404 Not Found com erro "Incidente não encontrado"

#### 3.7 Atualizar com valor inválido
- **ID**: INC-TC-020
- **Descrição**: Tentar atualizar valor com número negativo
- **Passos**:
  1. PATCH `/incident/{incidentId}`
  2. Body: `{ valor: -50.0 }`
- **Resultado Esperado**: Status 400, erro de validação

#### 3.8 Atualizar propriedades não fornecidas mantêm valores antigos
- **ID**: INC-TC-021
- **Descrição**: Validar que campos não atualizados preservam valores
- **Passos**:
  1. Criar incidente com tipo "sinistro", valor 500.0
  2. PATCH com apenas `{ descricao: "nova descricao" }`
  3. GET o mesmo incidente
- **Resultado Esperado**: tipo e valor mantém antigos valores, descricao atualizada

---

### 4. DELETE - Deletar incidentes

#### 4.1 Deletar incidente existente
- **ID**: INC-TC-022
- **Descrição**: Remover um incidente do banco
- **Pré-requisitos**: Incidente deve existir
- **Passos**:
  1. DELETE `/incident/{incidentId}`
- **Resultado Esperado**: 
  - Status: 204 No Content
  - GET do mesmo ID retorna 404/null após delete

#### 4.2 Deletar incidente inexistente
- **ID**: INC-TC-023
- **Descrição**: Tentar deletar incidente que não existe
- **Passos**:
  1. DELETE `/incident/uuid-nao-existe`
- **Resultado Esperado**: Status 204 (soft delete) ou 404

#### 4.3 Deletar incidente e confirmar remoção
- **ID**: INC-TC-024
- **Descrição**: Validar que incidente foi realmente removido
- **Passos**:
  1. DELETE `/incident/{incidentId}`
  2. GET `/incident/{incidentId}`
  3. GET `/incident/vehicle/{vehicleId}` - verificar se desapareceu
- **Resultado Esperado**: Incidente não aparece em nenhuma listagem

---

### 5. RELACIONAMENTOS - Testes com veículos

#### 5.1 Cascade delete - deletar veículo remove incidentes
- **ID**: INC-TC-025
- **Descrição**: Quando veículo é deletado, incidentes associados são removidos
- **Pré-requisitos**: Veículo com incidentes
- **Passos**:
  1. Criar veículo
  2. Criar 3 incidentes para este veículo
  3. DELETE veículo
  4. GET `/incident/vehicle/{vehicleId}`
- **Resultado Esperado**: Array vazio (todos os incidentes foram deletados em cascade)

#### 5.2 Incidentes persistem para diferentes veículos
- **ID**: INC-TC-026
- **Descrição**: Deletetar um veículo não afeta incidentes de outro veículo
- **Pré-requisitos**: 2 veículos com incidentes
- **Passos**:
  1. Criar veículo1 e incidente1 para ele
  2. Criar veículo2 e incidente2 para ele
  3. DELETE veículo1
  4. GET `/incident/vehicle/{veículo2}`
- **Resultado Esperado**: incidente2 ainda existe

---

### 6. INTEGRIDADE DE DADOS

#### 6.1 UUID é gerado automaticamente
- **ID**: INC-TC-027
- **Descrição**: ID do incidente é gerado em formato UUID válido
- **Passos**:
  1. POST `/incident` sem informar ID
  2. Validar resposta contém ID em formato UUID v4
- **Resultado Esperado**: ID válido, único para cada incidente

#### 6.2 Timestamps são preenchidos automaticamente
- **ID**: INC-TC-028
- **Descrição**: createdAt e updatedAt são preenchidos automaticamente
- **Passos**:
  1. POST `/incident`
  2. Verificar createdAt === updatedAt (em criação)
  3. PATCH e verificar updatedAt > createdAt
- **Resultado Esperado**: Timestamps gerenciados automaticamente

#### 6.3 Data de incidente é independente de createdAt
- **ID**: INC-TC-029
- **Descrição**: Campo 'data' (data do incidente) é independente de createdAt
- **Passos**:
  1. POST `/incident` com data: "2026-01-01"
  2. Verificar data !== createdAt
- **Resultado Esperado**: Dois timestamps diferentes - um da data do incidente, outro da criação no sistema

#### 6.3 Valor numérico com 2 casas decimais
- **ID**: INC-TC-030
- **Descrição**: Valor monetário preserva precisão
- **Passos**:
  1. POST `/incident` com valor: 1234.56
  2. GET `/incident/{id}`
- **Resultado Esperado**: valor returns como 1234.56 (não 1234.5 ou 1235)

---

## Matriz de Testes

| ID | Caso de Teste | Status | Resultado | Observações |
|:---|:---|:---:|:---|:---|
| INC-TC-001 | Criar incidente com dados válidos | ❌ Não executado | - | - |
| INC-TC-002 | Criar incidente com tipo "multa" | ❌ Não executado | - | - |
| INC-TC-003 | Criar incidente sem valor | ❌ Não executado | - | - |
| INC-TC-004 | Criar incidente com data atual padrão | ❌ Não executado | - | - |
| INC-TC-005 | Criar incidente com vehicleId inválido | ❌ Não executado | - | - |
| INC-TC-006 | Criar incidente sem campos obrigatórios | ❌ Não executado | - | - |
| INC-TC-007 | Criar incidente com descricao > 1024 caracteres | ❌ Não executado | - | - |
| INC-TC-008 | Buscar incidente por ID | ❌ Não executado | - | - |
| INC-TC-009 | Buscar incidente inexistente | ❌ Não executado | - | - |
| INC-TC-010 | Listar todos os incidentes | ❌ Não executado | - | - |
| INC-TC-011 | Listar incidentes de um veículo | ❌ Não executado | - | - |
| INC-TC-012 | Listar incidentes de veículo sem incidentes | ❌ Não executado | - | - |
| INC-TC-013 | Listar incidentes com vehicleId inválido | ❌ Não executado | - | - |
| INC-TC-014 | Atualizar descrição | ❌ Não executado | - | - |
| INC-TC-015 | Atualizar tipo | ❌ Não executado | - | - |
| INC-TC-016 | Atualizar valor | ❌ Não executado | - | - |
| INC-TC-017 | Atualizar data | ❌ Não executado | - | - |
| INC-TC-018 | Atualizar múltiplos campos | ❌ Não executado | - | - |
| INC-TC-019 | Atualizar incidente inexistente | ❌ Não executado | - | - |
| INC-TC-020 | Atualizar com valor inválido | ❌ Não executado | - | - |
| INC-TC-021 | Atualizar preserva valores antigos | ❌ Não executado | - | - |
| INC-TC-022 | Deletar incidente existente | ❌ Não executado | - | - |
| INC-TC-023 | Deletar incidente inexistente | ❌ Não executado | - | - |
| INC-TC-024 | Deletar e confirmar remoção | ❌ Não executado | - | - |
| INC-TC-025 | Cascade delete de veículo | ❌ Não executado | - | - |
| INC-TC-026 | Deletar veículo não afeta outros incidentes | ❌ Não executado | - | - |
| INC-TC-027 | UUID gerado automaticamente | ❌ Não executado | - | - |
| INC-TC-028 | Timestamps preenchidos automaticamente | ❌ Não executado | - | - |
| INC-TC-029 | Data independente de createdAt | ❌ Não executado | - | - |
| INC-TC-030 | Valor com 2 casas decimais | ❌ Não executado | - | - |

---

## Estrutura de Teste Recomendada

```typescript
// test/incident.e2e-spec.ts
describe('Incident Module (e2e)', () => {
  let app: INestApplication<App>;
  let vehicleId: string;

  beforeAll(async () => {
    // Setup
    // Criar veículo de teste
  });

  describe('POST /incident (CREATE)', () => {
    it('should create incident with valid data', () => {
      // INC-TC-001
    });
    // ... outros testes
  });

  describe('GET /incident/:id (READ)', () => {
    it('should retrieve incident by id', () => {
      // INC-TC-008
    });
    // ... outros testes
  });

  describe('GET /incident/vehicle/:vehicleId (READ)', () => {
    it('should retrieve all incidents for vehicle', () => {
      // INC-TC-011
    });
    // ... outros testes
  });

  describe('PATCH /incident/:id (UPDATE)', () => {
    it('should update incident description', () => {
      // INC-TC-014
    });
    // ... outros testes
  });

  describe('DELETE /incident/:id (DELETE)', () => {
    it('should delete incident', () => {
      // INC-TC-022
    });
    // ... outros testes
  });
});
```

---

## Notas

- **Erro atual**: O projeto possui erro pré-existente com módulo Firebase que impede execução dos testes. Corrigir antes de executar testes E2E.
- **Ambiente de teste**: Use .env.test para configurações de banco de dados de testes
- **Dados de teste**: Limpar dados de teste após cada execução (tearDown)
- **Isolamento**: Cada teste deve ser independente
- **Mock**: Considerar mock do módulo de autenticação se necessário

