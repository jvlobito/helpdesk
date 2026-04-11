# Plan Detallado - Fase 4

## Objetivo de la fase

Expandir el MVP con capacidades funcionales que quedaron fuera del alcance inicial, priorizando features que aumenten utilidad real sin romper la base ya endurecida en Fase 3.

## Principio rector de Fase 4

Agregar funcionalidad nueva solo cuando resuelva necesidades operativas claras y mantenga coherencia con la matriz de permisos, los flujos de soporte y la validacion ya existente.

## Secciones propuestas

### Bloque 4.1. Adjuntos en tickets y comentarios

#### Objetivo
Permitir evidencia operativa en tickets mediante archivos adjuntos.

#### Alcance sugerido
- adjuntar archivos al crear ticket
- adjuntar archivos en comentarios
- mostrar adjuntos en detalle
- validar tipo y tamano minimo seguro

#### Valor
- mejora trazabilidad de soporte
- permite capturas, evidencias y documentos de contexto

#### Decision aplicada en la iteracion actual
- se habilitan adjuntos opcionales en creacion de ticket y en comentarios
- el limite inicial es de hasta 3 archivos de 5 MB por envio
- los adjuntos quedan visibles en los detalles de ticket para los roles con acceso valido
- en esta iteracion no se agregan previews enriquecidos ni gestion avanzada de tipos de archivo

#### Cierre del bloque
- bloque 4.1 queda cerrado en esta primera iteracion
- la validacion funcional cubrio adjuntos validos, visibilidad por rol y control de error para archivos mayores a 5 MB

### Bloque 4.2. Notificaciones operativas

#### Objetivo
Dar visibilidad activa de cambios importantes sin depender de consulta manual constante.

#### Alcance sugerido
- notificar creacion de ticket
- notificar cambio de estado
- notificar reasignacion
- notificar comentario nuevo relevante

#### Valor
- reduce seguimiento manual
- mejora coordinacion entre cliente, agente y supervisor

#### Decision de alcance para iniciar el bloque
- en esta iteracion no se implementaran notificaciones por email
- la primera version sera de notificaciones internas dentro de la app
- los eventos candidatos minimos son: ticket creado, comentario publico relevante, cambio de estado y reasignacion

#### Decision aplicada en la iteracion actual
- se implementa un feed basico de notificaciones recientes en el header del workspace
- se generan notificaciones internas para comentario publico, cambio de estado, toma de ticket y reasignacion
- el destinatario inicial principal es el cliente creador del ticket y, en reasignacion, tambien el agente destino cuando aplica
- en esta iteracion no se agrega marcar como leida ni centro historico completo

#### Cierre del bloque
- bloque 4.2 queda cerrado en esta primera iteracion
- la validacion funcional confirmo notificaciones visibles para cliente y agente destino en los eventos probados
- se ajusto el `href` de las notificaciones para que cada destinatario navegue a la ruta correcta segun su rol

### Bloque 4.3. Administracion operativa de usuarios

#### Objetivo
Permitir gestionar usuarios internos sin salir del sistema.

#### Alcance sugerido
- listar usuarios internos
- activar/desactivar usuarios
- editar rol o departamento segun reglas definidas
- asignar agentes a departamentos desde UI

#### Valor
- reduce dependencia de carga manual en PocketBase
- mejora operacion continua del sistema

#### Decision aplicada en la iteracion actual
- se habilita una primera vista de supervisor para listar usuarios internos
- desde la UI se puede actualizar rol, departamento y estado activo de usuarios internos
- en esta iteracion no se crea alta completa de usuarios internos ni edicion de datos personales

#### Cierre del bloque
- bloque 4.3 queda cerrado en esta primera iteracion
- la validacion automatica confirmo carga de la vista y reflejo UI de cambios persistidos
- la validacion manual confirmo `QA-24`, `QA-25` y `QA-26`

### Bloque 4.4. Cierre y seguimiento mejorado de tickets

#### Objetivo
Completar el ciclo operativo con mejores mecanismos de cierre y reapertura.

#### Alcance sugerido
- motivo de cierre
- motivo de reapertura
- notas de resolucion visibles segun rol
- posible confirmacion final del cliente antes de cierre si se decide

#### Valor
- mejora calidad de trazabilidad
- reduce ambiguedad al cerrar o reabrir casos

#### Decision aplicada en la iteracion actual
- marcar un ticket como `resolved` ahora exige nota de resolucion
- el cierre final `resolved -> closed` ahora lo confirma el cliente con motivo de cierre
- la reapertura `resolved -> reopened` ahora la solicita el cliente con motivo de reapertura
- ambos motivos usan catalogo con opcion `otro` y detalle libre cuando aplica
- cliente, agente y supervisor pueden ver el contexto formal de cierre y reapertura en el detalle
- `closed` se mantiene como estado final del flujo

#### Cierre del bloque
- bloque 4.4 queda cerrado en esta primera iteracion
- la validacion tecnica confirmo `lint` y `build` en verde luego del ajuste de UX del formulario
- la validacion funcional confirmo `QA-27`, `QA-28`, `QA-29` y `QA-30`
- el formulario de workflow interno ahora se concentra en resolver el ticket y ya no ofrece cierre/reapertura manual normal
- el cliente responde tickets `resolved` desde su propio detalle para cerrar o reabrir

### Bloque 4.5. Exportacion y analitica operativa ligera

#### Objetivo
Permitir consumo operativo externo de informacion del sistema.

#### Alcance sugerido
- exportacion CSV de tickets filtrados
- metricas descargables basicas para supervisor
- vistas resumidas para seguimiento semanal

#### Valor
- mejora seguimiento gerencial
- ayuda a adopcion sin exigir tiempo real o BI completo

#### Decision aplicada en la iteracion actual
- se agrega exportacion CSV de tickets para supervisor
- se agrega descarga JSON con metricas basicas del dashboard
- ambas salidas quedan disponibles desde el dashboard de supervisor
- en esta iteracion no se implementan filtros avanzados de exportacion ni BI adicional

#### Cierre del bloque
- bloque 4.5 queda cerrado en esta primera iteracion
- la validacion tecnica confirmo `lint` y `build` en verde
- la validacion dirigida confirmo dashboard con accesos de descarga, export CSV y export JSON de metricas

### Bloque 4.6. Autocierre de tickets resueltos

#### Objetivo
Cerrar automaticamente tickets `resolved` que superen la ventana de confirmacion sin respuesta del cliente.

#### Alcance sugerido
- registrar `resolved_at` al resolver
- cerrar automaticamente tickets vencidos por tiempo
- registrar motivo `sin_respuesta_cliente`
- emitir historial y notificaciones al cliente y al agente asignado

#### Valor
- alinea la operacion al requerimiento original sin depender de cierre manual permanente
- evita acumulacion indefinida de tickets resueltos sin respuesta

#### Decision aplicada en la iteracion actual
- se agrega `resolved_at` al modelo de tickets
- se implementa un script batch `npm run tickets:auto-close`
- el autocierre aplica sobre tickets `resolved` vencidos y los lleva a `closed`
- el motivo de cierre usado es `sin_respuesta_cliente`
- se registran historial y notificaciones para cliente y agente asignado
- `closed` se refuerza como estado final: ya no permite comentarios, reasignacion ni nuevas transiciones internas

#### Cierre del bloque
- bloque 4.6 queda cerrado en esta primera iteracion
- la validacion tecnica confirmo `lint` y `build` en verde
- la validacion automatica confirmo ticket cerrado como estado final y el autocierre por vencimiento

## Orden recomendado de exploracion

1. Bloque 4.1. Adjuntos
2. Bloque 4.3. Administracion operativa de usuarios
3. Bloque 4.2. Notificaciones operativas
4. Bloque 4.4. Cierre y seguimiento mejorado
5. Bloque 4.5. Exportacion y analitica ligera
6. Bloque 4.6. Autocierre de tickets resueltos

## Notas de planeacion

- Fase 4 ya no es hardening; es expansion funcional.
- Cada bloque requiere revisar impacto en permisos, QA y experiencia de uso.
- No conviene arrancar todos los bloques a la vez; debe seguirse validacion por secciones.
