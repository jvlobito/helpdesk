# Smoke Test 5 Minutos

## Objetivo

Validar rapido que el MVP sigue operativo tras cambios recientes.

## Precondiciones

- PocketBase activo
- App en produccion activa en `http://127.0.0.1:3020`
- Datos bootstrap cargados

## Prueba 1. Login por roles

1. Entrar como cliente.
2. Confirmar llegada a `/app/tickets`.
3. Entrar como agente.
4. Confirmar llegada a `/app/agent/tickets`.
5. Entrar como supervisor.
6. Confirmar llegada a `/app/supervisor/dashboard`.

## Prueba 2. Crear ticket como cliente

1. Entrar como cliente.
2. Crear ticket rapido en `/app/tickets/new`.
3. Confirmar redireccion a `/app/tickets?created=1`.
4. Confirmar mensaje de exito.

## Prueba 3. Operacion basica de agente

1. Entrar como agente IT.
2. Abrir un ticket `new` de `Soporte TI`.
3. Tomar ticket.
4. Cambiar estado.
5. Confirmar mensajes de exito.

## Prueba 4. Operacion basica de supervisor

1. Entrar como supervisor.
2. Abrir `/app/supervisor/departments`.
3. Crear o editar un departamento.
4. Confirmar mensaje de exito.

## Prueba 5. Visibilidad de comentarios

1. Crear comentario interno como agente o supervisor.
2. Reingresar como cliente al mismo ticket.
3. Confirmar que el comentario interno no aparece.

## Criterio de aprobacion

El smoke test pasa si:
- todos los logins funcionan,
- cliente crea ticket sin error falso,
- agente puede tomar y cambiar estado,
- supervisor puede operar departamentos,
- comentarios internos respetan visibilidad.
