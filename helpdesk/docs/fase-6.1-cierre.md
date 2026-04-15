# Cierre Formal - Bloque 6.1 Scheduler y jobs confiables

## Estado

Bloque 6.1 se considera cerrado en su primer corte.

## Objetivo cumplido

El bloque formalizo la operacion del autocierre batch para que deje de depender solo de ejecucion manual ciega y pase a ser un proceso trazable, bloqueable, inspeccionable y verificable.

## Alcance completado

### 1. Persistencia operativa de corridas

- se agrego la coleccion `job_runs`
- cada corrida de `tickets:auto-close` registra inicio, fin, source, cutoff y conteos operativos
- se soportan estados `running`, `success`, `partial_failure`, `failed` y `skipped`

### 2. Proteccion contra doble ejecucion

- se agrego la coleccion `job_locks`
- el lock protege por `job_name`
- una corrida concurrente o solapada queda registrada como `skipped`

### 3. Operacion segura del batch

- se agrego `DRY_RUN` para inspeccion sin mutacion real
- se agrego `JOB_SOURCE` para distinguir origen manual, scheduler o QA
- se agrego helper `npm run tickets:auto-close:last-run` para revisar la ultima corrida persistida

### 4. Cobertura de estados operativos reales

- `success` validado con corrida y cierre real
- `skipped` validado con lock activo
- `dry-run` validado sin modificar tickets
- `partial_failure` validado con falla controlada sobre un ticket especifico

## Evidencias de validacion

### Tecnica

- `npm run pb:bootstrap` OK
- `npm run lint` OK
- `npm run build` OK

### Automatizada

- `npm run qa:verify` OK
- `docs/reports/qa-verify-latest.md`
- estado final actual: `OK`
- cobertura actual: 43 casos OK, 0 fallos

Cobertura automatizada relevante del bloque:
- `QA-AUTO-33`: corrida `success` con `job_run` y lock liberado
- `QA-AUTO-34`: corrida `skipped` por lock activo
- `QA-AUTO-35`: `DRY_RUN` sin cambios persistidos en tickets
- `QA-AUTO-36`: corrida `partial_failure` con cierres parciales y error resumido

### Validacion funcional dirigida

Validaciones recientes sobre builds frescas:
- `QA-41`: job run exitoso de autocierre
- `QA-42`: lock activo en autocierre
- `QA-43`: dry-run de autocierre
- `QA-44`: partial failure de autocierre

## Criterios de salida revisados

- jobs criticos dejan evidencia persistente de corrida: cumplido
- se evita doble ejecucion accidental del mismo job: cumplido
- existe modo seguro de inspeccion sin mutacion: cumplido
- la operacion puede revisar rapidamente el ultimo resultado: cumplido

## Riesgos residuales no bloqueantes

- el scheduler externo aun no esta materializado en un entorno real; solo quedo definido el contrato operativo
- no existe todavia alerta automatica fuera del sistema para `failed` o `partial_failure`
- el bloqueo actual es suficiente para el MVP, pero no reemplaza una orquestacion distribuida mas robusta

## Conclusion

Bloque 6.1 deja el autocierre en una base mucho mas operable y auditable. Con esto, Fase 6 puede avanzar hacia `6.2 Observabilidad operativa`, donde toca mejorar health checks, logs y diagnostico rapido de fallos.
