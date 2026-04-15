# Cierre Formal - Bloque 6.4 Seguridad operativa

## Estado

Bloque 6.4 se considera cerrado en su primer corte.

## Objetivo cumplido

El bloque reforzo las superficies mas expuestas del MVP para reducir accesos indebidos y mutaciones fuera de contexto, priorizando guardas explicitas por rol, bloqueo de exports sensibles y revalidacion server-side de propiedad del recurso en acciones criticas.

## Alcance completado

### 1. Guardas explicitas en paginas supervisor

- dashboard, tickets, detalle, usuarios y departamentos del supervisor ya validan rol `supervisor` de forma explicita
- cliente y agente ya no dependen de comportamiento indirecto para ser expulsados de esas pantallas

### 2. Endurecimiento de exports supervisor

- las rutas `/app/supervisor/exports/tickets`, `/metrics` y `/summary` ya mantienen respuesta `403` para roles no autorizados
- se valido acceso indebido desde cliente y agente

### 3. Revalidacion de propiedad en accion sensible

- `markNotificationReadAction()` ya no confia solo en la regla de PocketBase
- la accion revalida en servidor que la notificacion pertenezca al usuario autenticado antes de mutar `read`
- se cubrio explicitamente el riesgo tipo IDOR sobre `notificationId`

## Evidencias de validacion

### Tecnica

- `npm run pb:bootstrap` OK
- `npm run lint` OK
- `npm run build` OK

### Automatizada

- `npm run qa:verify` OK
- `docs/reports/qa-verify-latest.md`
- estado final actual: `OK`
- cobertura actual: 49 casos OK, 0 fallos

Cobertura automatizada relevante del bloque:
- `QA-AUTO-41`: cliente no accede a paginas supervisor por URL directa
- `QA-AUTO-42`: agente no accede a paginas supervisor por URL directa
- `QA-AUTO-43`: exports supervisor responden `403` a cliente y agente
- `QA-AUTO-44`: accion de notificacion ignora `notificationId` ajeno y no modifica recurso ajeno

### Validacion funcional dirigida

Validaciones recientes sobre build fresca:
- `QA-50`: cliente bloqueado en paginas supervisor
- `QA-51`: agente bloqueado en paginas supervisor
- `QA-52`: exports supervisor bloqueados por rol
- `QA-53`: notificacion ajena no modificable

## Criterios de salida revisados

- paginas supervisor protegidas por rol explicito: cumplido
- exports sensibles protegidos para no supervisor: cumplido
- al menos una accion sensible revalida propiedad del recurso dentro de la action: cumplido
- existe cobertura QA automatizada para permisos clave: cumplido

## Riesgos residuales no bloqueantes

- no existe aun una auditoria exhaustiva formal que cruce cada regla PocketBase contra cada Server Action sensible
- el MVP no tiene todavia alertas o rate limiting sobre acciones privilegiadas
- puede quedar espacio futuro para endurecer mas logs y denegaciones en acciones de workflow si el sistema crece

## Conclusion

Bloque 6.4 deja razonablemente endurecidas las superficies mas expuestas del MVP actual. Con esto, Fase 6 puede avanzar a `6.5 Continuidad y recuperacion`, que es el ultimo bloque pendiente antes del cierre formal de la fase.
