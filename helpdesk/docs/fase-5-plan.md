# Plan Detallado - Fase 5

## Objetivo de la fase

Profundizar el valor operativo y gerencial del sistema mediante reporting y analitica avanzada, aprovechando la base funcional ya cerrada en Fase 4.

## Principio rector de Fase 5

Agregar capacidad de lectura, analisis y exportacion util para supervision y gestion, sin convertir el MVP en una plataforma BI completa ni mezclar esta fase con hardening tecnico.

## Alcance propuesto

### 5.1 Exportacion filtrada de tickets

#### Objetivo
Permitir descargar tickets segun filtros operativos reales.

#### Alcance sugerido
- exportacion CSV respetando filtros activos
- filtros por `status`, `priority`, `category`, `department`, `assigned_to` y rango de fechas si ya existe soporte suficiente
- nombre de archivo con contexto minimo de fecha o tipo de exportacion

#### Valor
- mejora seguimiento semanal
- permite trabajo externo en hojas de calculo sin reprocesar manualmente la informacion

#### Primer corte recomendado
- extender la exportacion CSV actual para respetar filtros activos del supervisor
- incluir al menos `status`, `priority`, `category` y `q`
- validar que el archivo descargado refleje exactamente el universo filtrado en pantalla

#### Estado del primer corte
- implementado en la rama `phase-5-reporting`
- la exportacion CSV ya respeta `status`, `priority`, `category` y `q`
- el nombre del archivo refleja contexto minimo de filtros aplicados

#### Estado del segundo corte
- implementado en la rama `phase-5-reporting`
- la vista global del supervisor ya expone filtros por `departmentId`, `assignedToId`, `createdFrom` y `createdTo`
- la exportacion CSV ya respeta esos filtros adicionales y conserva nombre de archivo con contexto minimo
- validacion objetivo del bloque: el CSV debe reflejar el mismo universo visible cuando se combinan filtros operativos y rango de fechas

### 5.2 Metricas operativas ampliadas

#### Objetivo
Dar mayor profundidad a las metricas del dashboard para lectura de rendimiento y carga.

#### Alcance sugerido
- tickets abiertos por antiguedad
- tasa de tickets reabiertos
- tiempo promedio de cierre y tiempo promedio hasta resolucion
- carga comparativa por agente y por departamento

#### Valor
- ayuda a detectar cuellos de botella
- mejora visibilidad de calidad operativa

#### Primer corte recomendado
- agregar tasa de tickets reabiertos
- separar tiempo promedio hasta `resolved` y tiempo promedio hasta `closed`
- mostrar backlog envejecido con mayor detalle por estado o departamento

#### Estado del primer corte
- implementado en la rama `phase-5-reporting`
- el dashboard del supervisor ya muestra `tasa de reapertura`
- el dashboard ya separa `tiempo promedio hasta resolved` y `tiempo promedio hasta closed`
- el dashboard ya desglosa backlog envejecido por `estado` y por `departamento`
- la exportacion JSON de metricas ya expone estos nuevos campos para consumo externo

### 5.3 Analitica resumida para seguimiento gerencial

#### Objetivo
Ofrecer una vista mas ejecutiva sin salir del sistema.

#### Alcance sugerido
- resumen descargable o visual de KPIs principales
- distribucion por estado, prioridad y departamento con mayor claridad visual
- identificacion de tickets con riesgo operativo o backlog envejecido

#### Valor
- hace el dashboard mas util para seguimiento real
- reduce lectura manual de listados crudos

#### Primer corte recomendado
- agregar una salida descargable consolidada orientada a revision semanal
- resumir KPIs principales con texto claro y comparables entre si
- priorizar legibilidad y utilidad antes que visualizacion compleja

#### Estado del primer corte
- implementado en la rama `phase-5-reporting`
- el dashboard del supervisor ya muestra un bloque de `Resumen ejecutivo`
- existe una descarga `Descargar resumen gerencial` en formato Markdown
- el resumen reutiliza los KPIs ampliados de 5.2 para highlights y focos operativos

## Bloques ejecutables sugeridos

### Bloque 5.1. Exportacion filtrada

#### Objetivo
Hacer que la exportacion de tickets sea util para trabajo operativo real, respetando el contexto filtrado del supervisor.

#### Alcance minimo
- exportacion CSV usando filtros de `status`, `priority`, `category` y `q`
- extension de filtros por `departmentId`, `assignedToId`, `createdFrom` y `createdTo`
- nombre de archivo mas descriptivo
- validacion automatica y manual del universo exportado

#### Casos QA del bloque
- `QA-35`: exportacion CSV filtrada de tickets con filtros operativos activos
- `QA-36`: exportacion CSV filtrada con `departmentId`, `assignedToId` y rango de fechas

#### Cobertura automatizada esperada
- `QA-AUTO-27`: exportacion CSV filtrada con `status`, `priority` y `q`
- `QA-AUTO-28`: exportacion CSV filtrada con `departmentId`, `assignedToId`, `createdFrom` y `createdTo`

### Bloque 5.2. KPIs ampliados del dashboard

#### Objetivo
Profundizar el dashboard actual con metricas que ayuden a detectar calidad de atencion, backlog y reincidencia.

#### Alcance minimo
- tasa de reapertura
- tiempo promedio hasta `resolved`
- tiempo promedio hasta `closed`
- mayor contexto de tickets envejecidos

#### Casos QA del bloque
- `QA-37`: dashboard supervisor muestra KPIs ampliados de reapertura y tiempos separados
- `QA-38`: exportacion JSON de metricas incluye KPIs ampliados y desglose de backlog envejecido

#### Cobertura automatizada esperada
- `QA-AUTO-29`: dashboard supervisor muestra KPIs ampliados con valores esperados del dataset bootstrap
- `QA-AUTO-30`: exportacion JSON de metricas incluye `reopenedRatePercent`, tiempos separados y desgloses de backlog envejecido

### Bloque 5.3. Salida gerencial resumida

#### Objetivo
Entregar una vista o descarga resumida para seguimiento ejecutivo semanal.

#### Alcance minimo
- resumen descargable de KPIs principales
- bloque visual resumido en dashboard
- lenguaje orientado a toma de decision y no solo a volumen crudo

#### Casos QA del bloque
- `QA-39`: dashboard supervisor muestra bloque visual de resumen ejecutivo
- `QA-40`: descarga gerencial en Markdown resume KPIs y focos operativos

#### Cobertura automatizada esperada
- `QA-AUTO-31`: dashboard supervisor muestra bloque de resumen ejecutivo y acceso a descarga gerencial
- `QA-AUTO-32`: exportacion Markdown gerencial devuelve resumen ejecutivo, highlights y focos operativos

## Fuera de alcance de Fase 5

- hardening tecnico profundo
- scheduler y operacion de jobs mas alla del autocierre ya implementado
- observabilidad avanzada o monitoreo externo
- optimizacion de performance a gran escala
- refactor tecnico amplio sin valor funcional visible
- BI completo o reportes complejos tipo data warehouse

## Fase 6 reservada

La profundizacion de hardening operativo se reserva para `Fase 6`.

Temas candidatos para esa fase:
- ejecucion programada y operacion robusta de jobs batch
- observabilidad y monitoreo
- endurecimiento de performance y consultas
- backup, recuperacion y operacion recurrente
- refinamiento de seguridad y permisos avanzados

## Orden recomendado de implementacion en Fase 5

1. Bloque 5.1. Exportacion filtrada
2. Bloque 5.2. KPIs ampliados del dashboard
3. Bloque 5.3. Salida gerencial resumida
4. refinamiento visual adicional solo si aporta lectura real

## Criterios de salida sugeridos

- supervisor puede exportar tickets con filtros utiles
- dashboard muestra metricas mas profundas y accionables
- existe al menos una salida descargable adicional de metricas
- la validacion automatizada cubre exportaciones y respuestas clave
- la validacion manual confirma utilidad operativa del dashboard ampliado

## Riesgos a vigilar

- agregar demasiada complejidad visual sin mejorar decisiones reales
- introducir metricas poco confiables si no se define bien la fuente o formula
- mezclar analitica con hardening tecnico y diluir el objetivo de la fase

## Direccion recomendada

Fase 5 debe priorizar valor visible para supervisor y gestion operativa.

Si durante la implementacion aparecen necesidades de scheduler, performance o robustez de infraestructura, deben registrarse como backlog de `Fase 6` y no expandir el alcance de esta fase.
