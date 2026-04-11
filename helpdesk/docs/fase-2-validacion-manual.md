# Validacion Manual - Fase 2

## Preparacion

Servicios requeridos:
- PocketBase en `http://127.0.0.1:8090`
- App en modo produccion en `http://127.0.0.1:3020`

Comandos utiles:
- `npm run pb:bootstrap`
- `npm run build`
- `npm run start -- --port 3020`

## Usuarios de prueba

- Supervisor: `supervisor@techsupport.local / ChangeMe123!`
- Agente IT: `ana.agente@techsupport.local / ChangeMe123!`
- Agente Redes: `luis.redes@techsupport.local / ChangeMe123!`
- Agente Campo: `mario.campo@techsupport.local / ChangeMe123!`
- Cliente: `cliente@acme.com / ChangeMe123!`

## Checklist de Fase 2

### 1. Consistencia de datos y numeracion global

1. Iniciar sesion como `cliente@acme.com`.
2. Ir a `/app/tickets/new`.
3. Crear un ticket con datos validos.
4. Verificar redireccion a `/app/tickets?created=1`.
5. Confirmar mensaje `El ticket se creo correctamente.`.
6. Abrir el ticket nuevo.

Resultado esperado:
- El ticket se crea sin error falso de guardado.
- El numero sigue formato `TKT-0000X`.
- La numeracion continua globalmente.
- `created_at` y `updated_at` quedan reflejados en la app.

### 2. Filtros y busqueda en listas

1. Como cliente, abrir `/app/tickets`.
2. Filtrar por `status`.
3. Filtrar por `priority`.
4. Filtrar por `category`.
5. Buscar por texto libre usando numero o titulo.
6. Confirmar que la URL conserva `q`, `status`, `priority`, `category` y `page`.
7. Repetir validacion en `/app/agent/tickets` como agente.
8. Repetir validacion en `/app/supervisor/tickets` como supervisor.

Resultado esperado:
- Las listas muestran solo registros compatibles con los filtros.
- La URL representa el estado actual de la lista.
- Los estados vacios son claros cuando no hay coincidencias.

### 3. Gestion de departamentos

1. Iniciar sesion como supervisor.
2. Abrir `/app/supervisor/departments`.
3. Crear un departamento nuevo.
4. Confirmar mensaje `Departamento creado correctamente.`.
5. Editar un departamento existente.
6. Confirmar mensaje `Departamento actualizado correctamente.`.
7. Forzar un error de validacion y verificar que el formulario conserve los datos capturados.

Resultado esperado:
- El supervisor puede crear y editar departamentos desde UI.
- Los cambios se persisten en PocketBase.
- El formulario da feedback claro de error/exito.

### 4. Comentarios y actividad del ticket

1. Abrir un ticket como cliente y agregar comentario publico.
2. Confirmar mensaje `Comentario agregado correctamente.`.
3. Abrir el mismo ticket como agente o supervisor.
4. Agregar comentario interno.
5. Volver como cliente.

Resultado esperado:
- Los comentarios publicos son visibles al cliente.
- Los comentarios internos no son visibles al cliente.
- La actividad del ticket se actualiza tras comentar.

### 5. Flujo operativo de agente

1. Iniciar sesion como `ana.agente@techsupport.local`.
2. Abrir un ticket `new` de `Soporte TI`.
3. Usar `Tomar ticket`.
4. Confirmar mensaje `Ticket tomado correctamente.`.
5. Cambiar estado a `resolved` o `waiting`.
6. Confirmar mensaje `Estado actualizado correctamente.`.
7. Reasignar a otro agente del mismo departamento si existe.

Resultado esperado:
- Solo puede tomar tickets de su departamento.
- El cambio de estado respeta transiciones validas.
- La reasignacion solo permite agentes del mismo departamento.
- El historial refleja cambios de estado y asignacion.

### 6. Cierre manual por agente y supervisor

1. Llevar un ticket a `resolved`.
2. Como agente asignado, cerrarlo.
3. Repetir con supervisor sobre otro ticket en `resolved`.

Resultado esperado:
- Agente y supervisor pueden ejecutar `resolved -> closed`.
- El cierre actualiza `closed_at`.
- El historial registra el cambio.

### 7. Robustez UX de formularios

1. Forzar errores de validacion en crear ticket.
2. Forzar errores de validacion en comentar.
3. Forzar errores de validacion en cambio de estado o reasignacion.
4. Forzar errores de validacion en departamentos.

Resultado esperado:
- Los formularios conservan los valores relevantes al fallar.
- Los mensajes de error y exito son visibles y consistentes.
- Los botones deshabilitados muestran estado claro cuando la accion no aplica.

## Criterio practico de cierre de Fase 2

La fase puede considerarse cerrada si estos bloques funcionan en interfaz:
- numeracion global y timestamps consistentes
- filtros, busqueda y paginacion operativa
- gestion de departamentos por supervisor
- feedback de exito/error en acciones principales
- formularios tolerantes a errores sin perdida innecesaria de datos
