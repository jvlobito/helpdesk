# Plan Detallado - Fase 2

## Objetivo de la fase

Fortalecer el MVP ya funcional para que la operacion diaria sea mas consistente, navegable y administrable, cerrando huecos no bloqueantes de Fase 1 relacionados con consistencia de datos, filtros, paginacion, gestion de departamentos y pulido de experiencia.

## Resultado esperado de Fase 2

Al finalizar la fase, el sistema debe permitir operar tickets con datos mas consistentes, localizar informacion con filtros reales, navegar listas paginadas, gestionar departamentos desde la interfaz y ofrecer una experiencia mas clara en acciones, errores y estados vacios.

## Decisiones congeladas para Fase 2

1. `ticket_number`: secuencia global.
2. cierre manual de tickets: agente y supervisor.
3. reasignacion: solo dentro del mismo departamento.

## Implicaciones de estas decisiones

### `ticket_number` global
- El contador no se reinicia por anio.
- Se simplifica la generacion y evita reglas adicionales de reinicio anual.
- La implementacion actual de numeracion debe adaptarse para dejar de depender del anio como prefijo operativo.

### cierre manual por agente y supervisor
- Ambos roles podran ejecutar la transicion `resolved -> closed`.
- El backend debe validarlo explicitamente y el historial debe reflejar quien realizo el cierre.
- La UI no debe esconder la opcion de cierre al agente cuando el ticket este en `resolved` y cumpla reglas de acceso.

### reasignacion solo mismo departamento
- Se mantiene la regla actual del MVP como decision estable de Fase 2.
- No se permiten excepciones cross-department en esta fase.
- Los selectores y queries de reasignacion deben limitar agentes al departamento del ticket.

## Bloques de trabajo

### Bloque 1. Consistencia de datos y reglas

#### Objetivo
Eliminar workarounds actuales y alinear schema, backend y UI para que el sistema refleje actividad y ordenacion reales.

#### Tareas
1. Revisar el schema actual de PocketBase y detectar diferencias contra `requerimientos.md`.
2. Definir y aplicar timestamps consistentes para colecciones clave:
   - `tickets`
   - `comments`
   - `departments`
   - `ticket_history` si aplica
3. Ajustar `helpdesk-server.ts` para usar esos campos de manera consistente.
4. Actualizar el ticket ante actividad relevante:
   - comentario nuevo
   - cambio de estado
   - toma de ticket
   - reasignacion
5. Implementar `ticket_number` con secuencia global.
6. Ajustar reglas para que agente y supervisor puedan cerrar tickets manualmente.
7. Revisar y endurecer reglas de acceso en PocketBase para que reflejen el comportamiento de UI y la reasignacion dentro del mismo departamento.

#### Entregables
- schema actualizado
- bootstrap/migracion actualizado
- helpers de servidor simplificados
- ordenacion por actividad real

#### Riesgos
- migraciones incompatibles con datos ya sembrados
- reglas de acceso demasiado restrictivas o permisivas

#### Criterio de salida
- ya no dependemos de fallback defensivo para fechas inexistentes
- las pantallas ordenan por actividad real
- las acciones actualizan correctamente la actividad del ticket

### Bloque 2. Busqueda, filtros y paginacion

#### Objetivo
Hacer operativos los controles de busqueda y filtrado para cliente, agente y supervisor.

#### Tareas
1. Definir contrato de query params para listas:
   - `q`
   - `status`
   - `priority`
   - `category`
   - `page`
2. Implementar filtros reales en `/app/tickets`.
3. Implementar filtros reales en `/app/agent/tickets`.
4. Implementar filtros reales en `/app/supervisor/tickets`.
5. Implementar paginacion real con tamano de pagina configurable para MVP (`10`).
6. Mantener filtros y pagina en URL.
7. Mostrar estados vacios coherentes para resultados sin coincidencias.

#### Entregables
- filtros funcionales
- busqueda funcional
- paginacion real
- URLs compartibles con estado de lista

#### Riesgos
- complejidad en combinacion de filtros con reglas por rol
- queries PocketBase con rendimiento o sintaxis frágil

#### Criterio de salida
- un usuario puede buscar y filtrar tickets sin perder contexto al navegar

### Bloque 3. Gestion real de departamentos

#### Objetivo
Dar al supervisor una gestion basica real de departamentos desde la interfaz, sin depender del panel admin para la operacion normal.

#### Tareas
1. Diseñar formulario de alta/edicion de departamentos.
2. Implementar creacion de departamentos.
3. Implementar edicion de departamentos.
4. Definir si `active` puede editarse en esta fase.
5. Agregar validaciones funcionales y mensajes de error claros.
6. Refrescar la vista de supervisor tras cambios.
7. Opcional de la fase: mostrar agentes asociados por departamento si ya existe base suficiente.

#### Entregables
- formulario funcional de departamentos
- persistencia real desde UI
- feedback basico de exito/error

#### Riesgos
- si tambien se quiere gestionar asignacion de agentes, el alcance crece

#### Criterio de salida
- un supervisor puede crear y editar departamentos desde la interfaz del producto

### Bloque 4. Pulido UX y cierre operativo

#### Objetivo
Reducir friccion residual y mejorar claridad operativa del producto.

#### Tareas
1. Agregar mensajes de exito para acciones principales:
   - crear ticket
   - comentar
   - tomar ticket
   - cambiar estado
   - reasignar
   - crear/editar departamento
2. Conservar valores del formulario cuando hay error de validacion o error funcional.
3. Unificar mensajes vacios y errores de operacion.
4. Revisar copys finales de pantallas para eliminar lenguaje provisional.
5. Revisar affordances visuales de botones deshabilitados y acciones no disponibles.

#### Entregables
- feedback positivo consistente
- formularios mas tolerantes a errores
- lenguaje de UI mas final

#### Riesgos
- dispersion de cambios pequeños en demasiados componentes

#### Criterio de salida
- las interacciones principales comunican mejor que ocurrio y que debe hacer el usuario a continuacion

## Orden recomendado de ejecucion

1. Bloque 1. Consistencia de datos y reglas
2. Bloque 2. Busqueda, filtros y paginacion
3. Bloque 3. Gestion real de departamentos
4. Bloque 4. Pulido UX y cierre operativo

## Dependencias entre bloques

- Bloque 2 depende parcialmente del Bloque 1 porque los filtros y la paginacion deben operar sobre datos consistentes.
- Bloque 3 puede empezar en paralelo con el final del Bloque 2 si el schema ya esta estabilizado.
- Bloque 4 debe correr al final para evitar retrabajo visual y de mensajes.

## Fuera de alcance de Fase 2

Se mantienen fuera de Fase 2 salvo cambio de decision:

- adjuntos
- recuperacion de contrasena
- notificaciones por email
- tiempo real
- exportacion CSV o PDF
- chat
- integraciones externas
- modo oscuro
- administracion completa de usuarios

## Checklist de salida de Fase 2

- schema y reglas alineados con el comportamiento real
- listados con filtros, busqueda y paginacion
- supervisor gestiona departamentos desde UI
- feedback de exito/error claro en acciones criticas
- estados vacios y formularios mas robustos
- pruebas manuales de los flujos afectados actualizadas

## Forma de trabajo sugerida para esta fase

Trabajar esta fase en subentregas cortas:

1. Fase 2.1: consistencia de datos y reglas
2. Fase 2.2: filtros y paginacion
3. Fase 2.3: departamentos
4. Fase 2.4: pulido UX

Cada subentrega debe cerrar con:
- implementacion
- validacion tecnica (`lint` y `build`)
- checklist manual del bloque
- decision explicita de pasar al siguiente bloque
