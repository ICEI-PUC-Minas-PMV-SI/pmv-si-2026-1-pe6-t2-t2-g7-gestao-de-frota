# Casos de Teste — Módulo de Telemetria

## Estratégia de Testes

Testes em dois níveis: unitários (validações isoladas) e integração (fluxo completo via HTTP).

---

## CT-TEL-001 — Registrar telemetria com dados válidos

**Tipo:** Integração
**Endpoint:** `POST /journey/:journeyId/telemetry`
**Pré-condições:** Usuário autenticado, jornada `in_progress` vinculada ao usuário, veículo existente.

**Entrada:**
```json
{
  "vehicleId": "<uuid-valido>",
  "kmRodados": 152.5,
  "combustivelGasto": 12.3,
  "nivelCombustivel": 45.0,
  "latitude": -19.8157,
  "longitude": -43.9542,
  "velocidadeMedia": 60
}
```

**Resultado esperado:** HTTP 201 com objeto de telemetria criado contendo todos os campos e `registradaEm`
**Resultado obtido:** a preencher
**Status:** ⬜ Não executado

---

## CT-TEL-002 — Registrar telemetria em jornada finalizada

**Tipo:** Integração
**Endpoint:** `POST /journey/:journeyId/telemetry`
**Pré-condições:** Jornada com status `completed` ou `cancelled`.

**Entrada:** body válido com `journeyId` de jornada não `in_progress`

**Resultado esperado:** HTTP 403 com mensagem `"Só é possível registar telemetria em jornadas em curso."`
**Resultado obtido:** a preencher
**Status:** ⬜ Não executado

---

## CT-TEL-003 — Registrar telemetria com campos inválidos

**Tipo:** Unitário
**Componente:** `RecordTelemetryRequest.dto.ts`

**Entradas testadas:**
- `latitude: -95` (fora do range -90 a 90)
- `longitude: 200` (fora do range -180 a 180)
- `velocidadeMedia: -10` (valor negativo)

**Resultado esperado:** Erro de validação HTTP 400 para cada caso
**Resultado obtido:** a preencher
**Status:** ⬜ Não executado

---

## CT-TEL-004 — Buscar último registro de telemetria

**Tipo:** Integração
**Endpoint:** `GET /journey/:journeyId/telemetry/latest`

**Cenário A — Jornada com registros:**
Resultado esperado: HTTP 200 com `temTelemetria: true` e o registro mais recente.

**Cenário B — Jornada sem registros:**
Resultado esperado: HTTP 200 com `{ "temTelemetria": false }`.

**Resultado obtido:** a preencher
**Status:** ⬜ Não executado

---

## CT-TEL-005 — Acessar endpoints sem autenticação

**Tipo:** Integração
**Endpoint:** qualquer endpoint de telemetria sem token Bearer

**Resultado esperado:** HTTP 401 ou 403
**Resultado obtido:** a preencher
**Status:** ⬜ Não executado

---

## Resumo de Execução

| ID | Descrição | Tipo | Status |
|----|-----------|------|--------|
| CT-TEL-001 | Registrar telemetria válida | Integração | ⬜ |
| CT-TEL-002 | Jornada finalizada | Integração | ⬜ |
| CT-TEL-003 | Campos inválidos | Unitário | ⬜ |
| CT-TEL-004 | Buscar último registro | Integração | ⬜ |
| CT-TEL-005 | Sem autenticação | Integração | ⬜ |
