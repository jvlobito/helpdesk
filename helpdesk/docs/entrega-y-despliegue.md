# Entrega y Despliegue del Proyecto HelpDesk

## Estado de entrega

El roadmap actual del proyecto se considera cerrado hasta Fase 6.

Estado funcional al momento de entrega:
- MVP construido y validado por roles
- reporting operativo y salida gerencial disponibles
- hardening operativo inicial completado
- ultimo reporte automatizado disponible: `docs/reports/qa-verify-latest.md`

## Evidencia tecnica de entrega

- `npm run lint` OK
- `npm run build` OK
- `npm run qa:verify` OK
- cobertura automatizada vigente: 52 casos OK, 0 fallos

## Contenido entregable

### Codigo fuente

- app Next.js 16
- integracion PocketBase
- scripts operativos y QA
- documentacion de fases, cierres y roadmap

### Documentacion clave para la entrega

- `docs/roadmap.md`
- `docs/estado-actual.md`
- `docs/fase-6-cierre.md`
- `docs/operacion-y-demo.md`
- `docs/qa-verify-guia.md`
- `docs/reports/qa-verify-latest.md`

## Ruta minima para despliegue de entrega

### 1. Requisitos

- Node.js disponible en el servidor o entorno destino
- PocketBase disponible localmente junto al proyecto o en el mismo host de entrega
- acceso a variables de entorno minimas:
  - `NEXT_PUBLIC_POCKETBASE_URL`
  - `POCKETBASE_ADMIN_EMAIL`
  - `POCKETBASE_ADMIN_PASSWORD`

### 2. Preparacion del entorno

1. Clonar o copiar el proyecto.
2. Crear `.env.local` con credenciales y URL de PocketBase.
3. Confirmar que PocketBase use el directorio persistente esperado (`pocketbase/pb_data` en este entorno local de entrega).

### 3. Inicializacion recomendada

1. Ejecutar `npm install`.
2. Ejecutar `npm run pb:bootstrap`.
3. Ejecutar `npm run build`.

### 4. Validacion previa a entrega

1. Ejecutar `npm run lint`.
2. Ejecutar `npm run qa:verify`.
3. Revisar `docs/reports/qa-verify-latest.md`.
4. Ejecutar una demo corta por rol si la entrega lo requiere.

### 5. Ejecucion del sistema

1. Ejecutar `npm run start -- --port <puerto>`.
2. Verificar `GET /api/health`.
3. Confirmar acceso a:
   - `/login`
   - `/app/tickets`
   - `/app/agent/tickets`
   - `/app/supervisor/dashboard`

## Ruta minima de continuidad operativa

Antes de una entrega final o congelamiento de version:

1. Ejecutar `npm run pb:backup`.
2. Verificar respaldo con `PB_RESTORE_BACKUP_PATH=<ruta> npm run pb:restore:check`.
3. Conservar el respaldo junto con el paquete de entrega o en almacenamiento seguro.

## Ruta para subir codigo a repositorio Git

### Estado actual

- el repo local ya existe
- rama actual: `phase-5-reporting`
- aun no hay remoto configurado en este workspace

### Pasos recomendados

1. Confirmar que solo se versione codigo y documentacion, no artefactos runtime de PocketBase.
2. Hacer commit final de entrega.
3. Configurar remoto Git.
4. Hacer `push` de la rama.
5. Opcional: abrir PR o mergear a la rama objetivo.

## Criterio de aceptacion de entrega

La entrega puede considerarse lista si:

- el codigo compila y construye sin errores
- el reporte QA mas reciente esta en verde
- la documentacion de operacion y roadmap acompana el codigo
- existe respaldo valido de `pb_data`
- el codigo queda publicado en el repositorio remoto acordado

## Nota final

Este documento cierra la ruta del MVP actual como entregable. Cualquier evolucion futura debe arrancar como una nueva etapa del roadmap, no como extension abierta del cierre de entrega actual.
