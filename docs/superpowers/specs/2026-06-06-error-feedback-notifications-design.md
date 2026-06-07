# Spec: Auditoria e Padronização de Feedback de Erros e Notificações — frontend-mobile

**Data:** 2026-06-06  
**Escopo:** `src/frontend-mobile`  
**Status:** Aprovado

---

## Contexto

O app já possui infraestrutura de notificação completa (`toast.ts`, `ToastViewport.tsx`) e tratamento automático de erros HTTP no `AxiosAdapter`. Contudo, há gaps pontuais: operações de exclusão sem toast de sucesso, erros de GPS/localização silenciosos, e algumas operações de jornada sem feedback ao usuário.

---

## Objetivo

Auditar todos os arquivos da camada `app/`, `src/hooks/`, `src/components/` e `src/screens/`, completando o feedback de notificações usando exclusivamente a infraestrutura existente (`notifySuccess`, `notifyApiError`, `showToast`). Nenhum novo componente ou abstração será criado.

---

## O que não muda

- `toast.ts` / `ToastViewport.tsx` — infraestrutura já adequada
- `Axios.adapter.ts` — erros HTTP já tratados automaticamente
- `auth-errors.ts` / `auth.context.tsx` — auth já tem feedback completo
- `apiError.ts` — utilitário já funcional
- Componentes de UI (`Button`, `Input`, `Card`, etc.)
- Sistema de tema, navegação e roteamento
- Testes Cypress

---

## Arquivos a modificar

### Hooks

| Arquivo | Gap | Correção |
|---|---|---|
| `src/hooks/useFleetData.ts` | Erro capturado mas não notificado | `notifyApiError` quando erro mudar |
| `src/hooks/useLiveLocation.ts` | Permissão negada / GPS falha silenciosos | `showToast` com `tone: "error"` |
| `src/hooks/useMapJourney.ts` | Erros em start/record/complete silenciosos | `notifyApiError` em cada operação |
| `src/hooks/useAccountProfile.ts` | Verificar se update notifica sucesso | `notifySuccess` se faltar |

### Pages / Screens

| Arquivo | Gap | Correção |
|---|---|---|
| `app/(app)/vehicles.tsx` | Delete sem toast de sucesso | `notifySuccess("Veículo excluído com sucesso")` |
| `app/(app)/incidents.tsx` | Delete sem toast de sucesso | `notifySuccess("Incidente excluído com sucesso")` |
| `app/(app)/account.tsx` | Verificar feedback de salvar | `notifySuccess` se faltar |
| `app/(app)/dashboard.tsx` | Verificar exibição de erro do useFleetData | Toast se não exibido |

### Components

| Arquivo | Gap | Correção |
|---|---|---|
| `src/components/vehicles/VehicleFormSheet.tsx` | Verificar criar/editar com sucesso | `notifySuccess` se faltar |
| `src/components/incidents/IncidentFormSheet.tsx` | Verificar criar/editar com sucesso | `notifySuccess` se faltar |
| `src/components/vehicles/VehicleDetailSheet.tsx` | Ações internas sem feedback | Verificar e completar |
| `src/components/vehicles/VehicleIncidentsSheet.tsx` | Idem | Verificar e completar |
| `src/components/vehicles/VehicleJourneysSheet.tsx` | Idem | Verificar e completar |

### Screens de Mapa

| Arquivo | Gap | Correção |
|---|---|---|
| `src/screens/MapJourneyScreen.native.tsx` | Erros de localização/jornada silenciosos | Toast para cada operação |
| `src/screens/map-screen.native.tsx` | Idem | Verificar e completar |

---

## Padrões de mensagem

| Operação | Tom | Mensagem |
|---|---|---|
| Veículo criado | success | "Veículo cadastrado com sucesso" |
| Veículo editado | success | "Veículo atualizado com sucesso" |
| Veículo excluído | success | "Veículo excluído com sucesso" |
| Incidente criado | success | "Incidente registrado com sucesso" |
| Incidente editado | success | "Incidente atualizado com sucesso" |
| Incidente excluído | success | "Incidente excluído com sucesso" |
| Perfil atualizado | success | "Perfil atualizado com sucesso" |
| GPS negado | error | "Permissão de localização negada" |
| GPS falha | error | "Não foi possível obter sua localização" |
| Jornada iniciada | success | "Jornada iniciada" |
| Jornada concluída | success | "Jornada concluída com sucesso" |
| Falha ao iniciar/concluir jornada | error | Via `notifyApiError` (mensagem da API) |
| Erro ao carregar dados | error | Via `notifyApiError` (mensagem da API) |

**Regra de uso das funções:**
- Erros de API → `notifyApiError(error, "fallback em português")`
- Erros locais (GPS, permissão) → `showToast({ message, tone: "error" })`
- Sucesso → `notifySuccess("mensagem")`

---

## Critérios de conclusão

1. Toda operação de criar, editar e excluir entidade tem toast de sucesso correspondente
2. Falhas de GPS/localização exibem toast de erro ao usuário
3. Erros em `startJourney` / `completeJourney` exibem toast
4. Nenhum `catch` silencioso (sem notificação ao usuário) nos arquivos auditados
5. Mensagens de sucesso seguem os textos definidos acima
6. Código passa por `/simplify` ao final

---

## Fora do escopo desta entrega

- Error boundaries React
- Detecção de conectividade offline
- Validação inline em campos de formulário
- Novos componentes de UI
