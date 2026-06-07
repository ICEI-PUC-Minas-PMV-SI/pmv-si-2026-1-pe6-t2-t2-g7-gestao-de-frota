# Error Feedback & Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preencher os gaps de feedback de erros e sucesso no frontend-mobile, usando exclusivamente a infraestrutura de toast existente (`toast.ts`).

**Architecture:** Todas as mudanças são pontuais — adicionar chamadas `notifySuccess`, `notifyApiError` ou `showToast` nos pontos onde `catch` estava silencioso ou operações de sucesso não tinham notificação. Nenhum novo componente ou abstração é criado.

**Tech Stack:** React Native / Expo, `src/components/ui/toast.ts` (sistema de toast existente), TypeScript.

---

## Auditoria pré-implementação (resultado real)

Estes arquivos já estão corretos e **não precisam de alteração**:
- `vehicles.tsx` — delete já tem `notifySuccess`
- `VehicleFormSheet.tsx` — criar/editar já tem `notifySuccess`
- `IncidentFormSheet.tsx` — criar/editar já tem `notifySuccess`
- `account.tsx` — salvar perfil já tem `notifySuccess` + toast de erro
- `dashboard.tsx` — já exibe Card com mensagem de erro
- `useMapJourney.ts` — `onStart` e `onStop` já delegam erros HTTP ao AxiosAdapter

**Arquivos com gaps reais (5 tarefas abaixo):**

---

## Task 1: `incidents.tsx` — toast de sucesso ao excluir incidente

**Files:**
- Modify: `app/(app)/incidents.tsx:111-122`

- [ ] **Step 1: Adicionar import de `notifySuccess`**

O arquivo já importa `getApiErrorMessage` mas não importa nada de `toast`. Adicionar import:

```typescript
// app/(app)/incidents.tsx — linha ~31, após imports existentes
import { notifySuccess } from "../../src/components/ui/toast";
```

- [ ] **Step 2: Adicionar `notifySuccess` em `onDelete`**

Substituir a função `onDelete` atual (linhas 111-122):

```typescript
// ANTES
async function onDelete(incident: Incident) {
  try {
    const idToken = await getToken();
    await incidentModule.gateways.delete.exec({
      idToken,
      incidentId: incident.id,
    });
    await load();
  } catch {
    // Toast no adapter.
  }
}

// DEPOIS
async function onDelete(incident: Incident) {
  try {
    const idToken = await getToken();
    await incidentModule.gateways.delete.exec({
      idToken,
      incidentId: incident.id,
    });
    notifySuccess("Incidente excluído com sucesso.");
    await load();
  } catch {
    // Toast exibido pelo AxiosAdapter.
  }
}
```

- [ ] **Step 3: Verificar manualmente**

Abrir a aba Incidentes, excluir um incidente e confirmar que o toast verde "Incidente excluído com sucesso." aparece no topo da tela.

- [ ] **Step 4: Commit**

```bash
git add src/frontend-mobile/app/(app)/incidents.tsx
git commit -m "feat(mobile): toast de sucesso ao excluir incidente"
```

---

## Task 2: `useFleetData.ts` — toast quando carregamento de dados falha

**Files:**
- Modify: `src/frontend-mobile/src/hooks/useFleetData.ts:1-8,48-53`

- [ ] **Step 1: Adicionar import de `notifyApiError`**

```typescript
// src/hooks/useFleetData.ts — adicionar após import de useAuthorizedToken
import { notifyApiError } from "../components/ui/toast";
```

- [ ] **Step 2: Chamar `notifyApiError` no catch de `load`**

Substituir o bloco catch (linhas 48-53):

```typescript
// ANTES
} catch (err: unknown) {
  const message =
    err instanceof Error ? err.message : "Erro ao carregar dados da frota.";
  setError(message);
}

// DEPOIS
} catch (err: unknown) {
  const message =
    err instanceof Error ? err.message : "Erro ao carregar dados da frota.";
  setError(message);
  notifyApiError(err, "Erro ao carregar dados da frota.");
}
```

- [ ] **Step 3: Verificar manualmente**

Desconectar da rede ou alterar temporariamente `EXPO_PUBLIC_API_URL` para uma URL inválida, abrir o Dashboard e confirmar que o toast de erro aparece além do Card de erro já existente. Restaurar a URL após o teste.

- [ ] **Step 4: Commit**

```bash
git add src/frontend-mobile/src/hooks/useFleetData.ts
git commit -m "feat(mobile): toast de erro ao falhar carregamento da frota"
```

---

## Task 3: `useMapJourney.ts` — catch silencioso ao carregar veículos

**Files:**
- Modify: `src/frontend-mobile/src/hooks/useMapJourney.ts:1-16,44-58`

- [ ] **Step 1: Adicionar imports de `notifyApiError` e `notifySuccess`**

O arquivo já importa `showToast`. Adicionar `notifyApiError` e `notifySuccess`:

```typescript
// ANTES (linha 2)
import { showToast } from "../components/ui/toast";

// DEPOIS
import { notifyApiError, notifySuccess, showToast } from "../components/ui/toast";
```

- [ ] **Step 2: Adicionar toast no catch de carregamento de veículos**

Substituir o bloco useEffect de veículos (linhas 44-58):

```typescript
// ANTES
useEffect(() => {
  (async () => {
    setLoadingVehicles(true);
    try {
      const idToken = await getToken();
      const res = await vehicleModule.gateways.list.exec({ idToken });
      setVehicles(res.body);
      setVehicleId((current) => current ?? res.body[0]?.id ?? null);
    } catch {
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  })();
}, [getToken]);

// DEPOIS
useEffect(() => {
  (async () => {
    setLoadingVehicles(true);
    try {
      const idToken = await getToken();
      const res = await vehicleModule.gateways.list.exec({ idToken });
      setVehicles(res.body);
      setVehicleId((current) => current ?? res.body[0]?.id ?? null);
    } catch (err: unknown) {
      setVehicles([]);
      notifyApiError(err, "Não foi possível carregar os veículos.");
    } finally {
      setLoadingVehicles(false);
    }
  })();
}, [getToken]);
```

- [ ] **Step 3: Commit parcial**

```bash
git add src/frontend-mobile/src/hooks/useMapJourney.ts
git commit -m "feat(mobile): toast de erro ao falhar carregamento de veículos no mapa"
```

---

## Task 4: `useMapJourney.ts` — toasts de sucesso em `onStart` e `onStop`

**Files:**
- Modify: `src/frontend-mobile/src/hooks/useMapJourney.ts:182-254`

> **Pré-requisito:** Task 3 já adicionou `notifySuccess` no import.

- [ ] **Step 1: Adicionar `notifySuccess` em `onStart`**

Em `onStart`, após `setVehiclePosition(pathPoints[0] ?? null)` (linha ~227), adicionar:

```typescript
// Trecho de onStart — após setVehiclePosition e antes do catch:
      setJourneyId(res.body.id);
      setPlannedStops([]);
      setRoutePreview([]);
      setRoutePreviewStatus("idle");
      setSimulationPath(pathPoints);
      setTrail(pathPoints.length ? [pathPoints[0]!] : []);
      setVehiclePosition(pathPoints[0] ?? null);
      notifySuccess("Jornada iniciada.");   // <-- adicionar esta linha
    } catch {
      // Toast exibido pelo AxiosAdapter.
    } finally {
```

- [ ] **Step 2: Adicionar `notifySuccess` em `onStop`**

Em `onStop`, após `simIndexRef.current = 0` (linha ~248), adicionar:

```typescript
// Trecho de onStop — após zerar o estado e antes do catch:
      setJourneyId(null);
      setSimulationPath([]);
      setTrail([]);
      setVehiclePosition(null);
      setGeoHint(null);
      setPositionError(null);
      simIndexRef.current = 0;
      notifySuccess("Jornada concluída com sucesso.");   // <-- adicionar esta linha
    } catch {
      // Toast exibido pelo AxiosAdapter.
    } finally {
```

- [ ] **Step 3: Verificar manualmente**

Abrir a tela de Mapa, selecionar um veículo, marcar 2+ paradas e iniciar jornada. Confirmar toast "Jornada iniciada." Parar a jornada e confirmar toast "Jornada concluída com sucesso."

- [ ] **Step 4: Commit**

```bash
git add src/frontend-mobile/src/hooks/useMapJourney.ts
git commit -m "feat(mobile): toasts de sucesso ao iniciar e concluir jornada"
```

---

## Task 5: `useMapJourney.ts` — toasts para erros de posição, GPS e auto-complete

**Files:**
- Modify: `src/frontend-mobile/src/hooks/useMapJourney.ts:90-154`

> **Pré-requisito:** Tasks 3 e 4 já modificaram o arquivo e adicionaram os imports necessários.

- [ ] **Step 1: Adicionar toast no erro de `recordPosition` dentro de `advance`**

Substituir o catch dentro da função `advance` (linhas ~116-120):

```typescript
// ANTES
      } catch (err: unknown) {
        setPositionError(
          err instanceof Error ? err.message : "Erro ao registrar posição.",
        );
      }

// DEPOIS
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro ao registrar posição.";
        setPositionError(msg);
        showToast({ message: msg, tone: "error" });
      }
```

- [ ] **Step 2: Adicionar toasts no auto-complete da simulação**

Substituir os dois branches do bloco async de auto-complete (linhas ~127-145):

```typescript
// ANTES
        void (async () => {
          try {
            const idToken = await getToken();
            await journeyModule.gateways.complete.exec({
              idToken,
              journeyId: activeJourneyId,
            });
            setGeoHint(
              "Simulação concluída e jornada finalizada automaticamente.",
            );
            setJourneyId(null);
            setSimulationPath([]);
            setVehiclePosition(null);
          } catch {
            setGeoHint(
              "Simulação concluída, mas não foi possível finalizar a jornada na API.",
            );
          }
        })();

// DEPOIS
        void (async () => {
          try {
            const idToken = await getToken();
            await journeyModule.gateways.complete.exec({
              idToken,
              journeyId: activeJourneyId,
            });
            setGeoHint(
              "Simulação concluída e jornada finalizada automaticamente.",
            );
            notifySuccess("Jornada concluída com sucesso.");
            setJourneyId(null);
            setSimulationPath([]);
            setVehiclePosition(null);
          } catch (err: unknown) {
            const msg = "Simulação concluída, mas não foi possível finalizar a jornada na API.";
            setGeoHint(msg);
            notifyApiError(err, msg);
          }
        })();
```

- [ ] **Step 3: Adicionar useEffect para toast em erro/negação de GPS**

Adicionar após os `useState` declarations, antes do primeiro `useEffect` (após linha ~40):

```typescript
  // Emite toast quando localização é negada ou falha após já estar em uso.
  useEffect(() => {
    if (live.status === "denied") {
      showToast({ message: "Permissão de localização negada.", tone: "error" });
    } else if (live.status === "error" && live.error) {
      showToast({ message: live.error, tone: "error" });
    }
  }, [live.status, live.error]);
```

- [ ] **Step 4: Verificar manualmente**

- Revogar permissão de localização no dispositivo/simulador e abrir o mapa → confirmar toast "Permissão de localização negada."
- Para testar o auto-complete: iniciar uma jornada com paradas muito próximas (simulação termina rapidamente) e confirmar toast de sucesso.

- [ ] **Step 5: Commit**

```bash
git add src/frontend-mobile/src/hooks/useMapJourney.ts
git commit -m "feat(mobile): toasts para erros de posição, GPS e auto-complete de jornada"
```

---

## Task 6: Simplify

- [ ] **Step 1: Executar `/simplify` sobre os arquivos modificados**

Após todas as tarefas anteriores completas, executar o skill `/simplify` para revisar e simplificar o código modificado.

- [ ] **Step 2: Verificar que nenhuma funcionalidade foi alterada**

Rodar o app e confirmar que todos os toasts ainda aparecem corretamente após o simplify.

- [ ] **Step 3: Commit final**

```bash
git add src/frontend-mobile/app/(app)/incidents.tsx \
        src/frontend-mobile/src/hooks/useFleetData.ts \
        src/frontend-mobile/src/hooks/useMapJourney.ts
git commit -m "refactor(mobile): simplify após auditoria de feedbacks"
```

---

## Checklist de conclusão

- [ ] Toast de sucesso ao excluir incidente (`incidents.tsx`)
- [ ] Toast de erro ao falhar carregamento da frota (`useFleetData.ts`)
- [ ] Toast de erro ao falhar carregamento de veículos no mapa (`useMapJourney.ts`)
- [ ] Toast "Jornada iniciada." ao iniciar jornada (`useMapJourney.ts`)
- [ ] Toast "Jornada concluída com sucesso." ao parar jornada (`useMapJourney.ts`)
- [ ] Toast de erro em `recordPosition` (`useMapJourney.ts`)
- [ ] Toast de sucesso/erro no auto-complete da simulação (`useMapJourney.ts`)
- [ ] Toast ao GPS ser negado ou falhar (`useMapJourney.ts`)
- [ ] `/simplify` executado e código verificado
