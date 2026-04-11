# Bloque Basico de Pruebas

## Objetivo

Validar de forma rapida la funcionalidad principal construida hasta ahora en el MVP HelpDesk.

## Condiciones de ejecucion

- PocketBase activo en `http://127.0.0.1:8090`
- App en produccion activa en `http://127.0.0.1:3020`
- Datos recargados con `npm run pb:bootstrap`
- Usar sesion fresca para cada rol
- Si se prueba desde navegador, cerrar sesion antes de cambiar de rol

## Usuarios de prueba

- Cliente: `cliente@acme.com / ChangeMe123!`
- Agente IT: `ana.agente@techsupport.local / ChangeMe123!`
- Agente IT 2: `diego.soporte@techsupport.local / ChangeMe123!`
- Supervisor: `supervisor@techsupport.local / ChangeMe123!`

## Casos basicos

### Caso 1. Login y redireccion por rol

Rol:
- Cliente
- Agente
- Supervisor

Datos:
- `cliente@acme.com / ChangeMe123!`
- `ana.agente@techsupport.local / ChangeMe123!`
- `supervisor@techsupport.local / ChangeMe123!`

Pasos:
1. Abrir `http://127.0.0.1:3020/login`.
2. Iniciar sesion con cada usuario en sesiones separadas.

Condiciones esperadas:
- Cliente redirige a `/app/tickets`.
- Agente redirige a `/app/agent/tickets`.
- Supervisor redirige a `/app/supervisor/dashboard`.

### Caso 2. Cliente crea ticket

Rol:
- Cliente

Datos:
- Titulo: `Prueba basica cliente`
- Prioridad: `high`
- Categoria: `software`
- Departamento: `Soporte TI`
- Descripcion: `Validacion simple de creacion de ticket desde cliente.`

Pasos:
1. Iniciar sesion como cliente.
2. Ir a `/app/tickets/new`.
3. Capturar los datos indicados.
4. Enviar el formulario.

Condiciones esperadas:
- La app redirige a `/app/tickets?created=1`.
- Se muestra `El ticket se creo correctamente.`.
- El ticket aparece en la lista del cliente.
- El numero sigue formato `TKT-0000X`.

### Caso 3. Cliente filtra y busca tickets

Rol:
- Cliente

Datos:
- Buscar por `TKT-00001` o por parte del titulo
- Filtro de estado: `in_progress`

Pasos:
1. Iniciar sesion como cliente.
2. Abrir `/app/tickets`.
3. Usar busqueda por numero o texto.
4. Aplicar filtro por estado.

Condiciones esperadas:
- La lista cambia segun los filtros.
- La URL conserva `q`, `status`, `priority`, `category` o `page` cuando aplique.
- Si no hay resultados, aparece un estado vacio claro.

### Caso 4. Cliente agrega comentario publico

Rol:
- Cliente

Datos:
- Comentario: `Comentario publico de validacion.`

Pasos:
1. Iniciar sesion como cliente.
2. Abrir un ticket propio.
3. Agregar el comentario.

Condiciones esperadas:
- Se muestra `Comentario agregado correctamente.`.
- El comentario aparece en el detalle.
- No existe opcion de comentario interno para cliente.

### Caso 5. Agente toma ticket y cambia estado

Rol:
- Agente IT

Datos:
- Ticket objetivo: uno `new` del departamento `Soporte TI`
- Estado destino: `waiting` o `resolved`

Pasos:
1. Iniciar sesion como agente IT.
2. Abrir `/app/agent/tickets`.
3. Entrar a un ticket `new` de `Soporte TI`.
4. Usar `Tomar ticket`.
5. Cambiar el estado.

Condiciones esperadas:
- Se muestra `Ticket tomado correctamente.`.
- El ticket pasa a `in_progress`.
- Se muestra `Estado actualizado correctamente.`.
- El agente solo puede operar tickets de su departamento o asignados a el.

### Caso 6. Supervisor crea y edita departamento

Rol:
- Supervisor

Datos:
- Nombre: `Calidad QA`
- Email: `calidad.qa@techsupport.local`
- Descripcion: `Departamento de validacion operativa.`
- Estado: `Activo`

Pasos:
1. Iniciar sesion como supervisor.
2. Ir a `/app/supervisor/departments`.
3. Crear un departamento con los datos indicados.
4. Editar la descripcion del mismo departamento.

Condiciones esperadas:
- Se muestra `Departamento creado correctamente.`.
- Se muestra `Departamento actualizado correctamente.`.
- El departamento queda visible en la lista.

### Caso 7. Supervisor reasigna ticket dentro del mismo departamento

Rol:
- Supervisor

Datos:
- Ticket del departamento del agente destino
- Agente destino del mismo departamento

Pasos:
1. Iniciar sesion como supervisor.
2. Abrir un ticket en `/app/supervisor/tickets`.
3. Usar el formulario de reasignacion.
4. Elegir un agente del mismo departamento.

Condiciones esperadas:
- Se muestra `Ticket reasignado correctamente.`.
- Solo aparecen agentes del mismo departamento.
- No se permiten reasignaciones cross-department.

### Caso 8. Comentario interno no visible al cliente

Rol:
- Supervisor o agente
- Cliente

Datos:
- Comentario interno: `Nota interna de validacion.`

Pasos:
1. Como supervisor o agente, abrir un ticket.
2. Crear un comentario interno.
3. Cerrar sesion.
4. Entrar como cliente al mismo ticket.

Condiciones esperadas:
- Agente o supervisor ven el comentario marcado como `Interno`.
- El cliente no ve ese comentario.

### Caso 9. Administracion operativa de usuarios internos

Rol:
- Supervisor

Datos:
- Usuario interno: `diego.soporte@techsupport.local`
- Departamento destino: `Redes` o `Soporte TI` segun lo que quieras revertir despues

Pasos:
1. Iniciar sesion como supervisor.
2. Abrir `/app/supervisor/users`.
3. Ubicar a `diego.soporte@techsupport.local`.
4. Cambiar su departamento y guardar.
5. Cambiar su estado a `Inactivo` y guardar.
6. Volverlo a `Activo` y guardar.
7. Intentar dejar rol `agente` con departamento vacio.

Condiciones esperadas:
- La pantalla carga usuarios internos reales.
- Los cambios de departamento y estado se guardan correctamente.
- La UI refleja el nuevo estado del usuario.
- Si un usuario queda como `agente` sin departamento, aparece el error `Los agentes deben quedar asignados a un departamento.`.

### Caso 10. Exportacion CSV de tickets

Rol:
- Supervisor

Datos:
- Dataset bootstrap

Pasos:
1. Iniciar sesion como supervisor.
2. Abrir `/app/supervisor/dashboard`.
3. Usar el acceso `Exportar tickets CSV`.
4. Abrir el archivo descargado o inspeccionar su contenido.

Condiciones esperadas:
- La descarga responde correctamente.
- El archivo tiene extension `.csv`.
- El encabezado incluye al menos `ticket_number`, `status`, `priority`, `category`.
- El contenido incluye tickets reales del sistema.

### Caso 11. Exportacion JSON de metricas

Rol:
- Supervisor

Datos:
- Dataset bootstrap

Pasos:
1. Iniciar sesion como supervisor.
2. Abrir `/app/supervisor/dashboard`.
3. Usar el acceso `Descargar metricas JSON`.
4. Revisar la respuesta descargada.

Condiciones esperadas:
- La descarga responde correctamente.
- La respuesta es JSON valido.
- Incluye `counts`.
- Incluye `agedTickets`.
- Incluye `generatedAt`.

## Criterio rapido de aprobacion

El bloque queda aprobado si:
- cada rol entra a su vista correcta,
- cliente puede crear y consultar tickets,
- agente puede tomar y avanzar tickets,
- supervisor puede gestionar departamentos y reasignar,
- supervisor puede gestionar usuarios internos segun el alcance actual,
- supervisor puede exportar tickets CSV y metricas JSON,
- comentarios internos respetan visibilidad,
- mensajes de exito y error aparecen de forma consistente.
