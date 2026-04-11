# PRD - Sistema de Gestión de Tickets (Help Desk)

## 1. Introducción y Contexto del Negocio

### 1.1 Organización

**TechSupport Solutions S.A.** es una empresa de servicios tecnológicos que brinda soporte técnico a múltiples clientes corporativos.

### 1.2 Problema Actual

La gestión de solicitudes de soporte se realiza mediante correos electrónicos y hojas de cálculo, lo cual genera:

- Pérdida de solicitudes por falta de seguimiento
- Duplicación de esfuerzos entre agentes de soporte
- Imposibilidad de medir tiempos de respuesta y resolución
- Clientes insatisfechos por falta de visibilidad del estado de sus solicitudes
- Supervisores sin métricas para evaluar el desempeño del equipo

### 1.3 Oportunidad de Mejora

La implementación de un sistema centralizado de gestión de tickets permitirá:

1. Centralizar todas las solicitudes de soporte en un único sistema
2. Asignar tickets a agentes de manera organizada
3. Dar seguimiento al ciclo de vida completo de cada solicitud
4. Proveer métricas y dashboards para supervisores
5. Ofrecer a los clientes visibilidad del estado de sus tickets

---

## 2. Objetivos del Producto

### 2.1 Objetivo Principal

Implementar un Sistema de Gestión de Tickets (Help Desk) que centralice y automatice la gestión de solicitudes de soporte, mejorando la eficiencia del equipo y la satisfacción de los clientes.

### 2.2 Objetivos Específicos

- Reducir el tiempo de respuesta y resolución de tickets
- Aumentar la visibilidad del estado de las solicitudes para clientes
- Proveer métricas en tiempo real para supervisores
- Estandarizar los procesos de gestión de soporte
- Mantener un historial completo de todas las interacciones

---

## 3. Stakeholders

| Rol | Descripción | Intereses |
|-----|-------------|-----------|
| **Clientes** | Usuarios corporativos que requieren soporte técnico | Visibilidad del estado de sus solicitudes, tiempos de respuesta rápidos |
| **Agentes de Soporte** | Empleados que atienden y resuelven tickets | Herramientas eficientes para gestión de tickets, asignaciones claras |
| **Supervisores** | Responsables de monitorear el desempeño del equipo | Métricas claras, visibilidad del rendimiento, capacidad de gestión |
| **Administradores** | Encargados de la configuración del sistema | Flexibilidad de configuración, seguridad, mantenimiento |

---

## 4. Alcance del Producto

### 4.1 Módulos Principales

1. **Gestión de Usuarios y Autenticación**
   - Registro de usuarios con roles (Cliente, Agente, Supervisor)
   - Autenticación y control de acceso
   - Gestión de perfiles

2. **Gestión de Departamentos**
   - Creación y administración de departamentos
   - Asignación de agentes a departamentos

3. **Gestión de Tickets**
   - Creación de tickets por parte de clientes
   - Asignación y reasignación de tickets
   - Ciclo de vida de tickets con estados definidos
   - Sistema de comentarios
   - Historial de cambios
   - Adjuntos

4. **Búsqueda y Filtrado**
   - Búsqueda avanzada de tickets
   - Filtros por múltiples criterios
   - Paginación

5. **Dashboard de Supervisor**
   - Métricas y KPIs en tiempo real
   - Gráficas de rendimiento
   - Análisis de cargas de trabajo

### 4.2 Fuera del Alcance

- Chat en tiempo real (websockets)
- Integración con pasarelas de pago
- Reportes en PDF (opcional)
- Notificaciones por email (opcional)
- Modo oscuro (opcional)

---

## 5. Requisitos Funcionales

### RF-01: Gestión de Usuarios

El sistema debe soportar tres tipos de usuarios con diferentes permisos:

| Rol | Permisos |
|-----|----------|
| **Cliente** | Crear tickets, ver sus propios tickets, agregar comentarios |
| **Agente** | Ver tickets asignados, cambiar estado, agregar comentarios, reasignar |
| **Supervisor** | Todas las anteriores + ver todos los tickets + dashboard + gestión de usuarios |

### RF-02: Gestión de Departamentos

- Crear, editar y eliminar departamentos (solo supervisores)
- Cada departamento tiene: nombre, descripción, email de contacto
- Los agentes pertenecen a un departamento

### RF-03: Creación de Tickets

Un ticket debe contener:

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| Título | Texto (max 200 caracteres) | Sí |
| Descripción | Texto largo | Sí |
| Prioridad | Selección: Baja, Media, Alta, Crítica | Sí |
| Categoría | Selección: Hardware, Software, Red, Otros | Sí |
| Departamento destino | Selección | Sí |
| Archivos adjuntos | Archivos (max 3, max 5MB c/u) | No |

### RF-04: Estados del Ticket

El ciclo de vida de un ticket incluye los siguientes estados:

```
┌─────────┐     ┌────────────┐     ┌─────────────┐     ┌──────────┐
│  NUEVO  │────▶│ EN PROCESO │────▶│  RESUELTO   │────▶│ CERRADO  │
└─────────┘     └────────────┘     └─────────────┘     └──────────┘
                      │                   │
                      │                   │
                      ▼                   ▼
               ┌────────────┐     ┌─────────────┐
               │ EN ESPERA  │     │  REABIERTO  │
               └────────────┘     └─────────────┘
```

**Transiciones permitidas:**
- NUEVO → EN PROCESO (cuando un agente toma el ticket)
- EN PROCESO → EN ESPERA (esperando respuesta del cliente)
- EN PROCESO → RESUELTO (cuando el agente resuelve)
- EN ESPERA → EN PROCESO (cuando el cliente responde)
- RESUELTO → CERRADO (después de 48h o confirmación del cliente)
- RESUELTO → REABIERTO (si el cliente no está satisfecho)
- REABIERTO → EN PROCESO

### RF-05: Asignación de Tickets

- Los tickets nuevos se asignan automáticamente al departamento seleccionado
- Un supervisor o agente puede asignar/reasignar tickets a agentes específicos
- Un agente puede tomar tickets no asignados de su departamento

### RF-06: Sistema de Comentarios

- Clientes y agentes pueden agregar comentarios a un ticket
- Cada comentario registra: autor, fecha/hora, contenido
- Los comentarios pueden ser públicos (visibles para el cliente) o internos (solo agentes)

### RF-07: Historial de Cambios

El sistema debe registrar automáticamente:
- Cambios de estado
- Cambios de asignación
- Cambios de prioridad

Cada registro incluye: fecha/hora, usuario que realizó el cambio, valor anterior, valor nuevo.

### RF-08: Dashboard para Supervisores

El dashboard debe mostrar:

| Métrica | Descripción |
|---------|-------------|
| Tickets por estado | Gráfica o contadores de tickets en cada estado |
| Tickets por prioridad | Distribución de tickets por nivel de prioridad |
| Tickets por departamento | Cantidad de tickets por departamento |
| Tickets por agente | Carga de trabajo de cada agente |
| Tiempo promedio de resolución | Promedio de días desde creación hasta cierre |
| Tickets abiertos > 7 días | Lista de tickets antiguos sin resolver |

### RF-09: Búsqueda y Filtros

Los usuarios pueden filtrar tickets por:
- Estado
- Prioridad
- Categoría
- Departamento
- Agente asignado
- Rango de fechas
- Texto en título o descripción

### RF-10: Paginación

- Las listas de tickets deben estar paginadas (10 tickets por página)
- Mantener los filtros aplicados al navegar entre páginas

---

## 6. Historias de Usuario

### HU-01: Registro e Inicio de Sesión

**Como** usuario del sistema  
**Quiero** poder registrarme e iniciar sesión  
**Para** acceder a las funcionalidades según mi rol

**Criterios de Aceptación:**
- [ ] Formulario de registro con campos: email, username, first_name, last_name, password, password_confirm
- [ ] Validación: email único; password cumple la política mínima: 8+ caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo
- [ ] Al registrarse, el usuario recibe rol Cliente por defecto
- [ ] Login con email y password redirige al dashboard correspondiente por rol
- [ ] Existe mecanismo de "Olvidé mi contraseña"

---

### HU-02: Crear Ticket (Cliente)

**Como** cliente  
**Quiero** poder crear un ticket de soporte  
**Para** reportar un problema y recibir ayuda

**Criterios de Aceptación:**
- [ ] Formulario de creación con campos obligatorios: title (max 200), description, category, priority, department
- [ ] Adjuntos: permitir hasta 3 archivos por ticket; tipos permitidos: image/png, image/jpeg, application/pdf, application/zip; máximo 5MB por archivo
- [ ] El sistema genera un ticket_number único y legible (formato TKT-YYYY-NNNNN)
- [ ] Al crear el ticket: estado inicial NUEVO, created_at y created_by correctamente registrados
- [ ] Feedback visual inmediato confirmando creación y enlace al detalle del ticket
- [ ] El ticket aparece inmediatamente en la vista "Mis Tickets" del cliente

---

### HU-03: Ver Mis Tickets (Cliente)

**Como** cliente  
**Quiero** ver la lista de mis tickets  
**Para** dar seguimiento a mis solicitudes

**Criterios de Aceptación:**
- [ ] La lista muestra por cada ticket: ticket_number, title, status, priority, created_at, updated_at
- [ ] Soporte de filtros: estado, prioridad, categoría
- [ ] Búsqueda por número y texto libre (título/descripcion)
- [ ] Paginación configurada a 10 tickets por página
- [ ] Indicadores visuales por prioridad y label de estado
- [ ] Al hacer clic en un registro se abre la vista de detalle del ticket

---

### HU-04: Ver Detalle de Ticket

**Como** usuario (cliente o agente)  
**Quiero** ver el detalle completo de un ticket  
**Para** conocer toda la información y el historial

**Criterios de Aceptación:**
- [ ] La vista muestra: ticket_number, title, description, category, priority, status, department, assigned_to, created_at, updated_at
- [ ] Historial de comentarios ordenado cronológicamente
- [ ] Historial de cambios (auditoría) que registra cambios en estado, asignación y prioridad
- [ ] Adjuntos listados con nombre, tamaño y botón de descarga
- [ ] Visibilidad: clientes solo ven comentarios públicos; agentes y supervisores ven públicos e internos

---

### HU-05: Agregar Comentario

**Como** usuario (cliente o agente)  
**Quiero** agregar comentarios a un ticket  
**Para** comunicarme sobre el avance de la solicitud

**Criterios de Aceptación:**
- [ ] Formulario de comentario con campo content y checkbox internal visible solo para agentes/supervisores
- [ ] Al enviar, el comentario queda persistido con author, created_at, is_internal
- [ ] El nuevo comentario aparece inmediatamente en la vista y actualiza updated_at del ticket
- [ ] Los comentarios internos no son visibles para el cliente en la vista detalle

---

### HU-06: Gestionar Tickets (Agente)

**Como** agente de soporte  
**Quiero** gestionar los tickets asignados a mí  
**Para** resolver las solicitudes de los clientes

**Criterios de Aceptación:**
- [ ] Lista de agente muestra tickets asignados al agente y tickets del departamento sin asignar
- [ ] Un agente puede "tomar" un ticket no asignado: acción que establece assigned_to y cambia estado a EN_PROCESO
- [ ] Permitir transiciones de estado válidas según el flujo definido
- [ ] El agente puede reasignar a un agente del mismo departamento
- [ ] Cambios de prioridad y asignación quedan registrados en el historial de auditoría
- [ ] Acciones rápidas desde la lista (cambiar estado, reasignar)

---

### HU-07: Dashboard de Supervisor

**Como** supervisor  
**Quiero** ver un dashboard con métricas  
**Para** monitorear el rendimiento del equipo

**Criterios de Aceptación:**
- [ ] Widgets con conteo por estado actualizados al recargar la página
- [ ] Gráfica/distribución de tickets por prioridad
- [ ] Tabla con carga por agente: agent_email, assigned_count, open_count, resolved_count, resolution_rate
- [ ] Cálculo del tiempo promedio de resolución mostrado en horas/días
- [ ] Lista de tickets abiertos > 7 días con enlace al detalle

---

### HU-08: Gestión de Departamentos (Supervisor)

**Como** supervisor  
**Quiero** gestionar los departamentos  
**Para** organizar el equipo de soporte

**Criterios de Aceptación:**
- [ ] Crear/editar departamentos con campos: name, description, contact_email, active (boolean)
- [ ] No permitir desactivar un departamento que tenga tickets con estado distinto de CERRADO
- [ ] Ver lista de agentes asignados por departamento y posibilidad de asignar/desasignar agentes

---

### HU-09: Búsqueda Avanzada

**Como** usuario  
**Quiero** buscar tickets con filtros avanzados  
**Para** encontrar rápidamente la información que necesito

**Criterios de Aceptación:**
- [ ] Búsqueda por texto en title y description y por ticket_number
- [ ] Filtros combinables: estado, prioridad, categoría, departamento, agente, rango de fechas
- [ ] Los filtros y la búsqueda se mantienen al paginar resultados
- [ ] Supervisores disponen de filtros adicionales por departamento y agente

---

## 7. Requisitos No Funcionales

### 7.1 Performance

- Tiempo de respuesta para listas de tickets: < 2 segundos
- Tiempo de carga de página: < 3 segundos
- Soporte para hasta 1000 usuarios concurrentes

### 7.2 Seguridad

- Autenticación segura para todos los usuarios
- Control de acceso basado en roles
- Encriptación de contraseñas
- Validación de todas las entradas del usuario
- No exponer información sensible en mensajes de error

### 7.3 Usabilidad

- Interfaz intuitiva y fácil de usar
- Diseño responsivo (funcional en móviles)
- Feedback visual claro para todas las acciones
- Mensajes de error amigables

### 7.4 Confiabilidad

- Disponibilidad del sistema: 99%
- Backup automático de datos
- Historial completo de cambios

### 7.5 Mantenibilidad

- Código organizado y modular
- Documentación completa
- Tipos de TypeScript explícitos
- Componentes reutilizables

---

## 8. Modelo de Datos Propuesto

### 8.1 Entidades

#### Users (Usuarios)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador único |
| email | string | Email del usuario (único) |
| username | string | Nombre de usuario (único) |
| first_name | string | Nombre |
| last_name | string | Apellido |
| role | enum | Rol: cliente, agente, supervisor |
| department_id | relation | Departamento asignado (solo para agentes) |
| created_at | datetime | Fecha de creación |
| updated_at | datetime | Fecha de actualización |

#### Departments (Departamentos)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador único |
| name | string | Nombre del departamento |
| description | text | Descripción |
| contact_email | string | Email de contacto |
| active | boolean | Estado activo/inactivo |
| created_at | datetime | Fecha de creación |
| updated_at | datetime | Fecha de actualización |

#### Tickets (Tickets)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador único |
| ticket_number | string | Número único de ticket (TKT-YYYY-NNNNN) |
| title | string | Título (max 200 caracteres) |
| description | text | Descripción detallada |
| priority | enum | Prioridad: low, medium, high, critical |
| category | enum | Categoría: hardware, software, network, other |
| status | enum | Estado: new, in_progress, waiting, resolved, reopened, closed |
| department_id | relation | Departamento destino |
| created_by | relation | Usuario creador |
| assigned_to | relation | Agente asignado (opcional) |
| created_at | datetime | Fecha de creación |
| updated_at | datetime | Fecha de última actualización |
| closed_at | datetime | Fecha de cierre (opcional) |

#### Comments (Comentarios)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador único |
| ticket_id | relation | Ticket asociado |
| content | text | Contenido del comentario |
| is_internal | boolean | Es comentario interno (solo visible para agentes) |
| author_id | relation | Autor del comentario |
| created_at | datetime | Fecha de creación |

#### TicketHistory (Historial de Cambios)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador único |
| ticket_id | relation | Ticket asociado |
| field_changed | string | Campo modificado |
| old_value | text | Valor anterior |
| new_value | text | Nuevo valor |
| changed_by | relation | Usuario que realizó el cambio |
| changed_at | datetime | Fecha del cambio |

#### Attachments (Adjuntos)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | string | Identificador único |
| ticket_id | relation | Ticket asociado |
| filename | string | Nombre del archivo |
| file_size | number | Tamaño en bytes |
| file_type | string | Tipo MIME |
| file_url | string | URL del archivo |
| uploaded_by | relation | Usuario que subió el archivo |
| uploaded_at | datetime | Fecha de subida |

### 8.2 Reglas de Negocio

1. **Política de Contraseñas**: 8 caracteres mínimo, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo
2. **Formato de Ticket**: TKT-YYYY-NNNNN (ej. TKT-2026-00001)
3. **Adjuntos**: Máximo 3 archivos por ticket, 5MB por archivo, tipos permitidos: image/png, image/jpeg, application/pdf, application/zip
4. **Auto-cierre**: Tickets en estado RESUELTO cierran automáticamente después de 48h
5. **Desactivación de Departamento**: No se puede desactivar un departamento con tickets abiertos

---

## 9. Requisitos Técnicos

### 9.1 Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Framework frontend | Next.js (App Router) | 14+ |
| Lenguaje | TypeScript | 5+ |
| Componentes UI | shadcn/ui | Última |
| Estilos | Tailwind CSS | 3+ |
| Backend / Base de datos | PocketBase | 0.22+ |
| Validación de formularios | Zod + React Hook Form | Últimas |
| Gráficas (dashboard) | Recharts | Última |

### 9.2 Estructura del Proyecto

```
helpdesk/
├── pocketbase/
│   ├── pocketbase
│   ├── pb_data/
│   └── pb_migrations/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── tickets/
│   │   │   └── departments/
│   │   └── api/
│   ├── components/
│   │   ├── ui/
│   │   ├── tickets/
│   │   ├── dashboard/
│   │   └── layout/
│   ├── lib/
│   │   ├── pocketbase.ts
│   │   ├── auth.ts
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   └── use-tickets.ts
│   └── types/
│       ├── ticket.ts
│       ├── user.ts
│       └── department.ts
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local.example
```

### 9.3 Variables de Entorno

- `NEXT_PUBLIC_POCKETBASE_URL` (URL de PocketBase)
- `POCKETBASE_ADMIN_EMAIL` (email administrador PocketBase)
- `POCKETBASE_ADMIN_PASSWORD` (contraseña admin)
- `NEXTAUTH_SECRET` (si se usa NextAuth)

---

## 10. Restricciones

### 10.1 Restricciones Técnicas

- Stack tecnológico definido (Next.js + shadcn/ui + PocketBase)
- Máximo 3 archivos adjuntos por ticket, 5MB por archivo
- Tipos de archivos permitidos: png, jpeg, pdf, zip

### 10.2 Restricciones de Negocio

- Solo supervisores pueden gestionar departamentos
- No se puede desactivar un departamento con tickets abiertos
- Los comentarios internos no son visibles para clientes

### 10.3 Restricciones de Tiempo

- Tiempo estimado MVP: 8-10 horas
- Tiempo máximo (incluye extras): 12 horas

---

## 11. Métricas de Éxito

### 11.1 Métricas de Adopción

- Número de usuarios activos por semana
- Porcentaje de usuarios que registran tickets
- Tasa de uso de funcionalidades clave

### 11.2 Métricas de Desempeño

- Tiempo promedio de primera respuesta
- Tiempo promedio de resolución
- Tasa de tickets resueltos
- Número de tickets reabiertos

### 11.3 Métricas de Satisfacción

- Encuestas de satisfacción de clientes (opcional)
- Feedback de agentes de soporte
- Número de quejas o escalaciones

---

## 12. Roadmap

### Fase 1: MVP (8-10 horas)

**Historias de Usuario:**
- HU-01: Registro e Inicio de Sesión
- HU-02: Crear Ticket (Cliente)
- HU-03: Ver Mis Tickets (Cliente)
- HU-04: Ver Detalle de Ticket
- HU-05: Agregar Comentario
- HU-06: Gestionar Tickets (Agente)
- HU-09: Búsqueda Avanzada

### Fase 2: Funcionalidades Adicionales (2 horas)

**Historias de Usuario:**
- HU-07: Dashboard de Supervisor
- HU-08: Gestión de Departamentos (Supervisor)

### Fase 3: Mejoras Opcionales (Tiempo adicional)

- Tests automatizados
- Modo oscuro
- Notificaciones por email
- Exportación de reportes en CSV
- Animaciones y transiciones pulidas

---

## 13. Riesgos y Mitigaciones

### Riesgo 1: Resistencia al cambio por parte de los agentes

**Mitigación**: Capacitación exhaustiva, documentación clara, fase de prueba piloto

### Riesgo 2: Problemas de performance con gran cantidad de tickets

**Mitigación**: Implementar paginación desde el inicio, optimizar queries, considerar caché

### Riesgo 3: Complejidad en la gestión de permisos

**Mitigación**: Usar el sistema de roles y permisos de PocketBase, documentar claramente cada permiso

### Riesgo 4: Migración de datos desde el sistema actual

**Mitigación**: Desarrollar scripts de migración, validar datos antes de cargar, mantener backup

---

## 14. Aprobación

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Product Owner | | | |
| Lead Developer | | | |
| Stakeholder Principal | | | |

---

**Versión del Documento:** 1.0  
**Última Actualización:** 2026  
**Estado:** Aprobado para desarrollo