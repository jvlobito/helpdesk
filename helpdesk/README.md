# HelpDesk MVP

Implementacion funcional del MVP de HelpDesk construida a partir de `requerimientos.md`.

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS 4
- PocketBase
- Zod
- React Hook Form
- Recharts

## Instalacion

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abrir `http://localhost:3000`.

Nota:
- para validaciones funcionales de este proyecto se prefiere modo produccion por estabilidad en Windows.

## Variables de entorno

Crear `.env.local` a partir de `.env.local.example`:

```bash
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=change-me
```

## Rutas sembradas

- `/`
- `/login`
- `/register`
- `/app`
- `/app/tickets`
- `/app/tickets/new`
- `/app/tickets/[id]`
- `/app/agent/tickets`
- `/app/agent/tickets/[id]`
- `/app/supervisor/dashboard`
- `/app/supervisor/tickets`
- `/app/supervisor/tickets/[id]`
- `/app/supervisor/departments`
- `/api/health`

## Archivos clave

- `src/lib/helpdesk.ts`: tipos, reglas y datos de ejemplo del dominio.
- `src/lib/pocketbase.ts`: helper inicial para cliente PocketBase.
- `docs/mvp-plan.md`: plan de implementacion y fases recomendadas.

## Ejecucion recomendada para validacion

```bash
npm run pb:bootstrap
npm run build
npm run start -- --port 3020
```

## Estado actual

- autenticacion real por rol con PocketBase
- tickets, comentarios, historial y workflow operando sobre datos reales
- departamentos y dashboard conectados a datos reales
- smoke QA automatizado disponible con `npm run qa:verify`
- documentacion de validacion disponible en `docs/`

## Verificacion

```bash
npm run lint
npm run build
npm run qa:verify
```
