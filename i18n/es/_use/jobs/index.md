---
layout: default
title: Trabajos
nav_order: 3
has_children: true
has_toc: false
redirect_from:
  - /jobs.html
permalink: /jobs/
translated_from: 5ebe08c87f55b79169432884bb849e27dde03cb2
---

# Trabajos
{: .no_toc }

Sigue, aborta, relanza, aprueba y elimina los trabajos que inician tus formularios
{: .fs-6 .fw-300 }

---

Para todos los que lanzan formularios: qué es un trabajo, dónde encontrarlo y quién puede verlo.

---

## Qué es un trabajo

Un trabajo es una ejecución de un formulario: AnsibleForms lo registra con su estado, sus extravars y su salida en cuanto se envía el formulario.

Cada trabajo guarda:

* el **formulario** que ejecutó y el **usuario** que lo lanzó (con el tipo de usuario, como `local` o `ldap`);
* su **tipo de trabajo** y su **estado**, y su **hora de inicio** y **hora de finalización**;
* su **salida**, las extravars y credenciales con las que se ejecutó, y los valores de los campos introducidos en el formulario.

Un formulario multistep crea un trabajo para el formulario y un trabajo por paso. Los pasos están vinculados al trabajo principal y se listan debajo de él.

Los mismos trabajos se pueden lanzar, seguir y gestionar a través de la [API REST](../api/jobs.html).

---

## La página Trabajos

El enlace **Trabajos** de la cabecera abre la lista de todos los trabajos, los más recientes primero (`/jobs/all`). La página y su enlace se muestran a los usuarios
cuyo rol activa la [opción de rol](../config/roles.html#role-options) `showJobs`.

![La lista de trabajos](../assets/screenshots/job-log.jpg)

El menú de la izquierda ordena los trabajos en el tiempo, con el número de trabajos de cada entrada; una entrada de estado filtra la lista por ese estado:

| Sección | Entrada del menú | Muestra |
|---|---|---|
| **Pasado** | **Correcto** | Trabajos con estado `success` |
| | **Fallido** | Trabajos con estado `failed` |
| | **Cancelado** | Trabajos con estado `aborted` |
| | **Rechazado** | Trabajos con estado `rejected` |
| | **Abandonado** | Trabajos con estado `abandoned` |
| **Presente** | **En ejecución** | Trabajos con estado `running` |
| | **Esperando aprobación** | Trabajos con estado `approve`; el contador se vuelve naranja cuando uno está esperando |
| **Futuro** | **Programados** | La página de [Programaciones](schedules.html) (opción de rol `allowScheduledJobs`) |
| | **Guardados** | La página de [Trabajos almacenados](stored-jobs.html) (opción de rol `allowStoredJobs`) |

El menú no tiene una entrada para todos los trabajos: el enlace **Trabajos** de la cabecera los muestra todos, incluidos los trabajos `warning`.

Encima de la tabla, en la línea del título:

* el **cuadro de búsqueda** conserva los trabajos cuyas columnas visibles contienen el texto (sin distinguir mayúsculas), o alguno de cuyos pasos lo tiene como id
  o destino;
* **Eliminar** (con el número de trabajos marcados) elimina a la vez los trabajos marcados en la primera columna;
* **Columnas** muestra u oculta las columnas `id`, `form`, `job type`, `status`, `start time`, `end time`, `duration` y `user`;
  la duración de un trabajo en ejecución va aumentando;
* **Actualizar** recarga la lista.

La lista carga los trabajos más recientes, tantos como indique el ajuste [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE)
(**Configuración > Sistema > General**, pestaña **Trabajos**, `1000` por defecto); sus páginas, la búsqueda y los filtros abarcan esos trabajos.

Cada columna se puede ordenar y tiene su propio campo de filtro. Un trabajo multistep tiene una flecha justo antes de su `form` que despliega
sus pasos; un clic en el resto de la fila abre el trabajo.

La campana de la cabecera cuenta los trabajos que esperan tu aprobación y abre la lista en **Esperando aprobación**. Para los usuarios que pueden ver
los runners, cuenta también los [runners pendientes de aprobación](../runners/registration.html#approving-an-rte), RTE que pidieron unirse,
y abre **Conexiones > Runners** cuando solo esperan runners. Si esperan ambos, abre un menú, **Trabajos pendientes de aprobación** y
**Runners pendientes de aprobación**, cada uno con su contador.

---

## Quién ve qué trabajos

Los trabajos que ve un usuario dependen de sus roles:

| Usuario | Ve |
|---|---|
| Administrador (rol `admin`) | Todos los trabajos |
| Opción de rol `showAllJobLogs` | Todos los trabajos |
| Opción de rol `manageAllJobs` (desde 7.3.0) | Todos los trabajos, y puede abortarlos, eliminarlos y relanzarlos |
| Cualquier otro usuario | Sus propios trabajos, y los trabajos que esperan una aprobación que nombra uno de sus roles |

Hasta 7.2, cualquier usuario podía abrir cualquier trabajo pendiente de aprobación, incluidas sus extravars y su salida; desde 7.3.0 solo pueden su propietario y sus
aprobadores. Ver un trabajo no da todas las acciones sobre él: abortar, eliminar y relanzar el trabajo de otro usuario requiere ser administrador o tener
`manageAllJobs`, y `showAllJobLogs` solo muestra los trabajos. Eliminar también requiere `allowJobDeletion`, y relanzar `allowJobRelaunch`.

---

## En esta sección

Cada tema tiene su propia página:

| Página | Qué trata |
|---|---|
| [Estados y tipos](statuses.html) | Todos los estados que puede tener un trabajo, y los tipos de trabajo |
| [Seguir un trabajo](following.html) | Salida en directo, extravars, filtros y descargas |
| [Acciones de trabajo](actions.html) | Lanzar, abortar, relanzar, aprobar o rechazar, y eliminar un trabajo |
| [Programaciones](schedules.html) | Ejecutar un formulario más tarde o según una programación cron, y gestionar todas las programaciones |
| [Trabajos almacenados](stored-jobs.html) | Guardar los datos de un formulario para volver a cargarlos más tarde |
| [Limpieza](cleanup.html) | Trabajos cortados por un reinicio, y cuánto tiempo se conservan los trabajos terminados |
