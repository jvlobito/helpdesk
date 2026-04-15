# Roadmap del Proyecto HelpDesk

## Objetivo

Consolidar en un solo documento la evolucion del MVP por fases para que la planificacion no quede dispersa entre planes, cierres y estados de sesion.

## Situacion actual

- Fase 1: cerrada
- Fase 2: cerrada
- Fase 3: cerrada
- Fase 4: cerrada
- Fase 5: cerrada
- Fase 6: cerrada

## Roadmap consolidado

### Fase 1. Base tecnica y autenticacion

Estado: cerrada

Resultado principal:
- autenticacion por rol
- rutas base cliente, agente y supervisor
- tickets, comentarios, departamentos e historial como base operativa inicial

Artefactos clave:
- `fase-1-cierre.md`
- `fase-1-validacion-manual.md`

### Fase 2. Consistencia operativa y navegacion

Estado: cerrada

Resultado principal:
- consistencia de datos y reglas
- `ticket_number` global
- filtros y paginacion operativa
- gestion real de departamentos

Artefactos clave:
- `fase-2-plan.md`
- `fase-2-1-plan.md`
- `fase-2-cierre.md`

### Fase 3. Flujo operativo

Estado: cerrada

Resultado principal:
- toma, cambio de estado y reasignacion
- backend alineado por rol y reglas de transicion
- trazabilidad operativa mas consistente

Artefactos clave:
- `fase-3-plan.md`
- `fase-3-cierre.md`

### Fase 4. Visibilidad y cierre MVP

Estado: cerrada

Resultado principal:
- adjuntos
- notificaciones operativas
- administracion operativa de usuarios
- cierre y reapertura mejorados
- exportacion ligera y autocierre batch

Artefactos clave:
- `fase-4-plan.md`
- `fase-4-cierre.md`

### Fase 5. Reporting y analitica operativa avanzada

Estado: cerrada

Resultado principal:
- exportacion filtrada avanzada
- KPI ampliado del dashboard
- salida gerencial resumida

Artefactos clave:
- `fase-5-plan.md`
- `fase-5-cierre.md`

### Fase 6. Hardening operativo

Estado: en curso

Objetivo principal:
- volver el MVP mas confiable, observable, seguro y operable en uso sostenido

#### 6.1 Scheduler y jobs confiables

Estado: cerrado

Resultado principal:
- `job_runs`
- `job_locks`
- `DRY_RUN`
- estados operativos persistidos del autocierre

Artefactos:
- `fase-6.1-cierre.md`

#### 6.2 Observabilidad operativa

Estado: cerrado

Resultado principal:
- health real contra PocketBase
- `correlationId`
- resumen del ultimo autocierre
- logs estructurados en exports

Artefactos:
- `fase-6.2-cierre.md`

#### 6.3 Rendimiento y consultas

Estado: cerrado

Resultado principal:
- paginacion real en backend
- separacion de camino full dataset
- menos recomputo y menos fan-out en dashboard

Artefactos:
- `fase-6.3-cierre.md`

#### 6.4 Seguridad operativa

Estado: cerrado en primer corte

Resultado principal:
- guardas explicitas en paginas supervisor
- exports supervisor bloqueados por rol
- revalidacion de propiedad en accion sensible

Artefactos:
- `fase-6.4-cierre.md`

#### 6.5 Continuidad y recuperacion

Estado: cerrado en primer corte

Objetivo principal:
- backup
- restore
- checklist minimo de continuidad

Artefactos:
- `fase-6.5-cierre.md`

## Cierre del roadmap actual

Estado: completado hasta Fase 6.

El roadmap definido hasta ahora cubrio:
- construccion del MVP
- operacion real por roles
- reporting y salida gerencial
- hardening operativo inicial

Cualquier continuacion posterior ya implica una nueva etapa de roadmap y no la extension del cierre actual.

## Proximo paso recomendado

1. Definir si se abre una nueva fase posterior al roadmap actual.
2. Si se continua, decidir si el siguiente eje sera producto, automatizacion o despliegue real.

## Nota sobre el marco documental

Hasta ahora la planificacion existia de forma implicita y distribuida en:
- `mvp-plan.md`
- `estado-actual.md`
- `fase-*-plan.md`
- `fase-*-cierre.md`

Este archivo se agrega para convertir esa planificacion dispersa en un roadmap unico y facil de consultar.
