# Guia Operativa y Demo

## Objetivo

Tener una guia corta para levantar el MVP, entrar con usuarios de prueba y recorrer una demo funcional sin depender de contexto previo.

## Preparacion recomendada

1. Ejecutar `npm run pb:bootstrap`
2. Ejecutar `npm run build`
3. Ejecutar `npm run start -- --port 3020`
4. Abrir `http://127.0.0.1:3020`

## Usuarios de demo

- Cliente: `cliente@acme.com / ChangeMe123!`
- Agente IT: `ana.agente@techsupport.local / ChangeMe123!`
- Agente IT 2: `diego.soporte@techsupport.local / ChangeMe123!`
- Supervisor: `supervisor@techsupport.local / ChangeMe123!`

## Flujo sugerido de demo

### 1. Cliente

1. Iniciar sesion como cliente.
2. Ir a `Mis tickets`.
3. Crear un ticket nuevo.
4. Confirmar mensaje de exito.
5. Abrir el detalle.
6. Agregar comentario publico.

Puntos a remarcar:
- numeracion global de tickets
- visibilidad solo de tickets propios
- feedback claro en acciones

### 2. Agente

1. Cerrar sesion.
2. Iniciar sesion como agente.
3. Abrir `Cola agente`.
4. Buscar el ticket creado por el cliente.
5. Tomar el ticket.
6. Cambiar estado.
7. Agregar comentario interno.

Puntos a remarcar:
- el agente solo opera tickets de su contexto
- el comentario interno no es visible al cliente
- la actividad del ticket se actualiza

### 3. Supervisor

1. Cerrar sesion.
2. Iniciar sesion como supervisor.
3. Abrir `Dashboard`.
4. Revisar carga por agente, alertas y metricas por estado/prioridad/departamento.
5. Abrir `Tickets`.
6. Revisar el ticket creado en vista global.
7. Abrir `Departamentos` y crear o editar uno.

Puntos a remarcar:
- visibilidad global
- gestion de departamentos
- metricas basadas en datos reales

## Comandos utiles de verificacion

- `npm run lint`
- `npm run build`
- `npm run qa:verify`

## Evidencia automatizada

Tras ejecutar `npm run qa:verify` revisar:

- `docs/reports/qa-verify-latest.md`

Ese archivo deja evidencia automatizada de accesos por rol, filtros, comentarios internos, guardrails de acceso, departamentos y cierre manual.
