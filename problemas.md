# Problemas de Negocio Detectados en `prd-helpdesk-tecnico.md`

## Diagnostico rapido
- Objetivo afectado: operar soporte tecnico de forma ordenada, segura y visible para clientes, agentes y supervisores.
- Evidencia disponible: el documento describe muchas capacidades para controlar tickets, permisos, historial, asignacion, estados y visibilidad operativa, lo que sugiere fricciones actuales en esos puntos.
- Afectados: clientes, agentes de soporte, supervisores y, de forma indirecta, la operacion del negocio.
- Impacto: demoras, mala coordinacion, errores de atencion, baja trazabilidad, riesgo de acceso indebido a informacion y poca visibilidad para gestionar carga y prioridades.
- Riesgo de sesgo a solucion: alto. El PRD ya viene muy cargado de soluciones tecnicas (`Next.js`, `PocketBase`, rutas, componentes, servicios, dashboard, roles, etc.) y no explicita claramente los problemas de negocio ni su evidencia.

## Problemas de negocio identificados

### 1. Falta de trazabilidad del ciclo de soporte
**Business Problem Statement**  
El negocio necesita poder seguir el estado y los cambios de cada solicitud de soporte de punta a punta, pero hoy el problema subyacente parece ser que las incidencias no tienen suficiente trazabilidad sobre su estado, responsable y cambios realizados. Esto afecta a clientes, agentes y supervisores porque dificulta saber que paso, quien actuo y en que punto esta cada caso, lo que aumenta errores operativos, retrabajo y perdida de confianza.

**Senales en el PRD**
- Flujo completo de tickets y estados: lineas 5, 17-23, 150-162, 163-191.
- Historial obligatorio de cambios: lineas 23, 138-149, 159, 257-260.
- Criterio de salida sobre persistencia y visibilidad de cambios: lineas 382-385.

### 2. Baja visibilidad operativa para gestionar carga y prioridades
**Business Problem Statement**  
El negocio necesita visibilidad basica sobre volumen, prioridad, estado y antiguedad de tickets para poder gestionar la operacion, pero el problema implicito es que supervisores no cuentan con informacion suficiente para priorizar, detectar atrasos y balancear trabajo. Esto afecta principalmente a supervisores y al equipo de soporte, y termina impactando tiempos de respuesta y calidad del servicio.

**Senales en el PRD**
- Dashboard y metricas: lineas 26, 27, 363-376.
- Filtros, busqueda y paginacion: lineas 24-25, 347-361.
- Tickets abiertos por mas de 7 dias: linea 370.

### 3. Dificultad para asignar y coordinar el trabajo entre agentes y departamentos
**Business Problem Statement**  
El negocio necesita que los tickets lleguen al equipo correcto y sean tomados o reasignados bajo reglas claras, pero hoy el problema aparente es que la distribucion del trabajo no esta suficientemente estructurada por departamento, contexto operativo y responsable. Esto afecta a agentes y supervisores, generando demoras, tickets sin dueno claro o reasignaciones inconsistentes.

**Senales en el PRD**
- Gestion de departamentos: lineas 16, 217-221, 241-244.
- Toma, asignacion y reasignacion: lineas 22, 71-73, 157-159, 322-329.
- Duda abierta sobre reasignacion: linea 413.
- Riesgo tecnico por ambiguedad en permisos de reasignacion: linea 403.

### 4. Riesgo de acceso incorrecto a informacion y acciones segun rol
**Business Problem Statement**  
El negocio necesita que cada actor vea y haga solo lo que le corresponde, pero el problema subyacente es que sin reglas claras de acceso y permisos existe riesgo de que usuarios consulten tickets ajenos, vean comentarios internos o ejecuten acciones no autorizadas. Esto afecta a clientes, agentes, supervisores y al negocio por riesgo operativo y de confidencialidad.

**Senales en el PRD**
- Matriz de permisos: lineas 61-79.
- Reglas de seguridad: lineas 223-232.
- Reglas de acceso en PocketBase: lineas 234-260.
- Riesgo de fuga de comentarios internos: linea 407.

### 5. Falta de autoservicio y visibilidad del cliente sobre sus incidencias
**Business Problem Statement**  
El negocio necesita que el cliente pueda registrar, consultar y dar seguimiento a sus propios problemas de soporte sin depender de canales manuales o informales, pero el problema implicito es que actualmente el cliente no tendria un mecanismo suficientemente claro para crear tickets, revisar avances y comunicarse sobre el caso. Esto afecta la experiencia del cliente y puede incrementar friccion, consultas repetidas y percepcion de mala atencion.

**Senales en el PRD**
- Registro, login y creacion de tickets: lineas 13-18, 195-210, 313-320.
- Lista y detalle de tickets del cliente: lineas 18-19, 268-271, 390-394.
- Comentarios publicos para cliente: lineas 20, 74, 212-215, 252-255.

## Lo que el documento confunde con solucion
Estas partes no son problemas de negocio; son respuestas posibles:
- Stack tecnico: lineas 40-52.
- Arquitectura y modulos: lineas 53-60, 301-309.
- Rutas y componentes: lineas 262-299.
- Dashboard, comentarios internos, historial, control de acceso por rol: son funcionalidades, no el problema en si.

## Huecos o supuestos
- No hay evidencia cuantitativa real: volumen de tickets, tiempos de respuesta, SLA, backlog, errores, fuga de clientes, costos operativos.
- No se explicita el canal actual ni el dolor actual: email, WhatsApp, Excel, llamadas, etc.
- No queda claro cual es la meta principal del negocio: eficiencia operativa, mejor servicio al cliente, control interno, cumplimiento, reduccion de tiempos.
- No se define el impacto economico o reputacional de no resolverlo.
- Varias reglas clave aun son ambiguas:
  - reasignacion entre agentes
  - quien puede cerrar tickets
  - politica de numeracion
  - futura administracion de usuarios

## Reencuadre recomendado
**Problema principal**  
El proceso de soporte tecnico necesita una forma estructurada de registrar, asignar, seguir y controlar incidencias entre clientes y equipo interno, porque hoy la operacion corre riesgo de perder trazabilidad, visibilidad y control de acceso, afectando tiempos de atencion, coordinacion interna y experiencia del cliente.
