# Plan Detallado - Fase 3

## Objetivo de la fase

Convertir el MVP ya funcional en una version mas robusta para operacion, demo y validacion continua, enfocando la fase en hardening, reglas operativas faltantes, cobertura de regresion y refinamiento final de la experiencia.

## Resultado esperado de Fase 3

Al finalizar la fase, el sistema debe tener menos riesgo operativo, mejor cierre de reglas funcionales, mayor cobertura de verificacion y una presentacion mas lista para entrega o demo formal.

## Principio rector de Fase 3

No expandir alcance con features grandes nuevas. Priorizar estabilidad, claridad operativa, validacion y calidad final del MVP.

## Bloques de trabajo

### Bloque 3.1. Reglas operativas y guardrails

#### Objetivo
Cerrar reglas de negocio que aun pueden generar inconsistencias operativas o ambiguedades en uso real.

#### Tareas
1. Revisar si un departamento inactivo debe bloquear creacion de tickets nuevos.
2. Evaluar si puede desactivarse un departamento con tickets abiertos.
3. Verificar consistencia entre backend, reglas PocketBase y UI para esos casos.
4. Revisar permisos limite de agente y supervisor en tickets fuera de su contexto.
5. Documentar decisiones operativas finales del MVP.
6. Formalizar una matriz de permisos por accion para el MVP.

#### Entregables
- reglas operativas endurecidas
- mensajes funcionales claros para casos no permitidos
- documentacion actualizada de decisiones
- matriz de permisos por accion del MVP

#### Criterio de salida
- no quedan ambiguedades importantes en reglas operativas basicas del MVP

#### Decision aplicada en la iteracion actual
- los departamentos inactivos no aparecen en la creacion de tickets nuevos
- tampoco se permite crear tickets en backend si el departamento fue inactivado
- no se permite desactivar departamentos con tickets abiertos
- el detalle por URL directa ahora valida contexto explicito para cliente y agente
- comentar tickets tambien valida contexto explicito antes de persistir

#### Matriz de permisos por accion del MVP

Objetivo:
- hacer explicitas las acciones permitidas por rol para evitar reglas dispersas entre UI, backend y QA

Principios:
1. la UI no define permisos; solo los refleja
2. toda accion sensible debe validarse tambien en backend
3. cuando una accion depende de contexto, la regla debe expresarse de forma explicita
4. si una accion no esta permitida en esta matriz, se considera fuera del alcance del MVP o debe bloquearse

Convenciones:
- `Si`: permitido sin condicion adicional relevante para el MVP
- `No`: no permitido
- `Condicional`: permitido solo si se cumple la regla de contexto indicada

| Accion | Cliente | Agente | Supervisor | Regla de contexto / notas |
| --- | --- | --- | --- | --- |
| Registrarse | Si | No | No | Registro publico solo crea `cliente` |
| Iniciar sesion | Si | Si | Si | Requiere usuario activo |
| Ver workspace protegido | Si | Si | Si | Redireccion segun rol |
| Ver tickets propios / de contexto | Si | Condicional | Si | Agente opera tickets asignados a el o sin asignar de su departamento cuando aplica |
| Ver tickets ajenos por URL directa | No | No | Si | Cliente y agente deben recibir bloqueo/404 fuera de contexto |
| Crear ticket | Si | No | No | Solo con departamento activo |
| Ver detalle de ticket | Condicional | Condicional | Si | Cliente: solo tickets propios. Agente: asignados a el o sin asignar de su departamento |
| Agregar comentario publico | Condicional | Condicional | Si | Debe tener acceso valido al ticket |
| Agregar comentario interno | No | Condicional | Si | Solo agente/supervisor y con acceso valido al ticket |
| Ver comentarios internos | No | Condicional | Si | Cliente nunca los ve |
| Ver historial de ticket | Condicional | No | Si | En el MVP actual el historial detallado no esta expuesto en vista agente |
| Ver lista operativa de agente | No | Si | Si | Supervisor puede entrar a vista agente |
| Ver tickets sin asignar de un departamento | No | Condicional | Si | Agente solo de su propio departamento |
| Tomar ticket | No | Condicional | Si | Agente: ticket `new`, sin asignar y de su departamento |
| Cambiar estado | No | Condicional | Si | Agente: solo tickets asignados a el |
| Cerrar ticket manualmente | No | Condicional | Si | Solo desde `resolved -> closed` |
| Reasignar ticket | No | Condicional | Si | Agente: solo tickets asignados a el y dentro del mismo departamento |
| Reasignar a otro departamento | No | No | No | Fuera de alcance del MVP actual |
| Ver todos los tickets | No | No | Si | Vista global de supervision |
| Gestionar departamentos | No | No | Si | Crear y editar departamentos |
| Desactivar departamento | No | No | Condicional | Solo si no tiene tickets abiertos |
| Crear tickets en departamento inactivo | No | No | No | Debe bloquearse en UI y backend |
| Ver dashboard | No | No | Si | Solo supervisor |

Reglas de contexto consolidadas:

Cliente:
- puede operar solo tickets creados por si mismo
- puede ver lista, detalle, comentarios publicos e historial permitido
- no puede comentar interno, cambiar estado ni reasignar

Agente:
- puede operar tickets solo en su contexto operativo valido
- contexto valido: ticket asignado a el, o ticket sin asignar del mismo departamento cuando la accion lo permite
- puede ver cola operativa, tomar ticket `new`, comentar, cambiar estado y reasignar dentro de su contexto
- no puede ver tickets fuera de su contexto por URL directa
- no puede tomar tickets de otro departamento
- no puede reasignar fuera del mismo departamento

Supervisor:
- tiene visibilidad global del MVP
- puede operar tickets y departamentos sin la restriccion de contexto del agente
- no debe desactivar departamentos con tickets abiertos

Implicaciones para implementacion:
1. la matriz debe reflejarse en navegacion y pantallas visibles
2. la matriz debe reflejarse en server actions y backend
3. la matriz debe reflejarse en pruebas manuales y automatizadas

Implicaciones para QA:
1. cliente no accede a ticket ajeno por URL
2. agente no accede a ticket fuera de su contexto
3. cliente no puede comentar interno
4. agente no puede tomar ticket de otro departamento
5. agente no puede reasignar fuera del mismo departamento
6. supervisor no puede desactivar departamento con tickets abiertos
7. no se crean tickets en departamentos inactivos

Conclusión de ubicacion en el plan:
- la matriz pertenece a `Bloque 3.1. Reglas operativas y guardrails`
- no corresponde tratarla como aprovisionamiento
- aprovisionamiento resuelve setup, datos base, acceso inicial o bootstrap; la matriz resuelve contrato de autorizacion y comportamiento operativo
- aunque la implementacion de permisos quedo repartida entre Fase 1, Fase 2 y Fase 3, su formalizacion correcta pertenece a Fase 3.1 porque ahi se consolidan y endurecen reglas ya existentes

#### Auditoria rapida contra la implementacion actual

Estado general:
- la mayor parte de la matriz ya esta `cubierta`
- algunos puntos estan `parciales` por alcance del MVP actual
- no se detecto un hueco critico nuevo que obligue a reabrir Fase 1 o Fase 2

Cubierto:
- registro publico solo crea `cliente`
- login requiere rol valido y cuenta activa
- redireccion por rol
- cliente crea ticket solo en departamentos activos
- cliente no accede por URL a tickets ajenos
- agente no accede por URL a tickets fuera de su contexto
- cliente no puede comentar interno
- comentarios validan contexto antes de persistir
- agente solo toma tickets `new`, sin asignar y de su departamento
- agente solo cambia estado en tickets asignados a el
- cierre manual `resolved -> closed` para agente y supervisor
- reasignacion solo al mismo departamento
- supervisor gestiona departamentos
- supervisor no puede desactivar departamentos con tickets abiertos
- dashboard solo para supervisor

Parcial:
- `ver historial de ticket` para agente: la regla de contexto existe, pero la vista de historial detallado no esta expuesta al agente en este MVP
- `ver sus propios tickets / de contexto` para agente: cubierto en cola operativa y detalle, pero no como una vista separada de “mis tickets” distinta a la cola

Fuera de alcance actual del MVP:
- reasignacion a otro departamento
- cualquier elevacion de privilegios fuera de los tres roles definidos

Interpretacion recomendada:
- no mover la matriz a otra fase ni dividirla por fases
- usar `Bloque 3.1` como fase de consolidacion del contrato de permisos
- tratar los puntos `parciales` solo como backlog si aportan valor real y no como deuda critica obligatoria

Decision operativa confirmada:
- se mantiene la regla actual del MVP: el ticket nace asignado al departamento seleccionado, no necesariamente a un agente
- por eso el agente puede ver tickets asignados a si mismo y tickets no asignados de su departamento
- la accion `Tomar ticket` sigue siendo valida dentro de esa regla
- no se abre por ahora una vista separada de “mis tickets” para agente porque la cola operativa actual cubre el flujo definido

### Bloque 3.2. Cobertura automatizada de regresion

#### Objetivo
Reducir riesgo de regresion en flujos criticos del MVP.

#### Tareas
1. Consolidar y estabilizar `qa:verify` como smoke automatizado principal.
2. Extender cobertura a casos faltantes de mayor valor si es necesario.
3. Mejorar trazabilidad de reportes y formato de salida.
4. Documentar como ejecutar y leer la verificacion automatizada.

#### Entregables
- verificacion automatizada mas util y mantenible
- reportes claros para QA o demo

#### Criterio de salida
- los flujos criticos del MVP tienen verificacion automatizada util y repetible

#### Decision aplicada en la iteracion actual
- `qa:verify` ahora cubre guardrails de acceso por URL directa para cliente y agente
- cada ejecucion deja reporte historico y tambien `qa-verify-latest.md`
- existe una guia dedicada para ejecutar e interpretar la verificacion automatizada

### Bloque 3.3. Dashboard y visibilidad operativa

#### Objetivo
Mejorar el valor operativo del dashboard sin abrir alcance descontrolado.

#### Tareas
1. Revisar si ya existe base suficiente para mostrar carga por agente.
2. Evaluar metrica simple de tiempo promedio de resolucion si los datos actuales lo permiten.
3. Mejorar legibilidad de secciones del dashboard existentes.
4. Mantener el dashboard dentro del alcance de recarga bajo demanda.

#### Entregables
- dashboard mas util para supervisor
- metricas o vistas adicionales solo si salen naturalmente de los datos actuales

#### Criterio de salida
- el dashboard agrega valor operativo sin introducir complejidad fuera del MVP

#### Decision aplicada en la iteracion actual
- el dashboard ya no calcula metricas sobre una lista paginada, sino sobre el universo completo de tickets
- se agrego vista de carga por agente activo
- se agrego tiempo promedio de resolucion usando tickets cerrados disponibles
- se agrego una seccion corta de alertas operativas

### Bloque 3.4. Refinamiento final de UX y entrega

#### Objetivo
Dejar el producto mas claro y presentable para validacion final.

#### Tareas
1. Revisar copys residuales provisionales.
2. Afinar estados vacios, errores y mensajes en pantallas clave.
3. Revisar experiencia movil en vistas principales.
4. Completar documentacion operativa minima para uso y demo.

#### Entregables
- pantallas principales mas pulidas
- documentacion operativa lista para uso interno o demo

#### Criterio de salida
- el MVP puede presentarse y validarse con menos friccion y menos dudas funcionales

#### Decision aplicada en la iteracion actual
- se mejoro usabilidad movil basica en tablas principales mediante scroll horizontal claro
- se mejoro disposicion de acciones de filtros en pantallas pequenas
- existe una guia operativa corta para levantar el entorno y ejecutar una demo por rol

## Orden recomendado de ejecucion

1. Bloque 3.1. Reglas operativas y guardrails
2. Bloque 3.2. Cobertura automatizada de regresion
3. Bloque 3.3. Dashboard y visibilidad operativa
4. Bloque 3.4. Refinamiento final de UX y entrega

## Fuera de alcance de Fase 3

Se mantienen fuera salvo cambio de decision:

- adjuntos
- recuperacion de contrasena
- notificaciones por email
- tiempo real
- exportacion CSV o PDF
- chat
- integraciones externas
- administracion completa de usuarios

## Checklist de salida de Fase 3

- reglas operativas del MVP endurecidas
- smoke QA automatizado consolidado
- dashboard revisado y mejorado donde aporte valor real
- UX final mas clara en flujos clave
- documentacion suficiente para validacion final o demo
