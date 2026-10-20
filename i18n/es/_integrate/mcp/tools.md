---
layout: default
title: Herramientas
parent: Servidor MCP
nav_order: 2
translated_from: a8c4d7ff425720a098c720cc1ade3629094bdb40
---

# Herramientas
{: .no_toc }

Las herramientas que usa un agente para rellenar, aprobar y relanzar formularios
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

El servidor MCP ofrece hasta 15 herramientas. Seis se ofrecen a todos los usuarios; las demás dependen de las opciones de rol del usuario, así que a un usuario
sin una opción no se le ofrecen sus herramientas en absoluto:

| Herramienta | Qué hace | Se ofrece con |
|---|---|---|
| `list_forms` | Los formularios que el usuario puede usar: nombre, descripción, categorías y `enableForChat` (si el asistente de chat lo ofrece). | siempre |
| `get_form` | La definición completa de un formulario. Cada campo lleva además `dynamic` (evaluado a partir de una expresión o consulta) y `dependsOn` (los campos que lee). | siempre |
| `resolve_field` | Evalúa el formulario con los valores rellenados hasta el momento. Consulta más abajo. | siempre |
| `launch_job` | Lanza el formulario con los valores dados, exactamente como lo haría un envío desde el navegador. Devuelve el id del trabajo. | siempre |
| `relaunch_job` | Vuelve a lanzar un trabajo con algunos campos cambiados. Consulta más abajo. | siempre |
| `get_job` | Estado y salida de un trabajo (`tail` limita la salida a las últimas líneas). | siempre |
| `plan_job` | Ejecuta el formulario una vez, más tarde, como el usuario: lo que hace **Ejecutar más tarde (una sola vez)** en el formulario. | `allowPlannedJobs` |
| `create_schedule` | Crea una programación, recurrente (`cron`) o de una sola vez (`run_at`), como en la página **Programaciones**. | `allowScheduledJobs` |
| `list_schedules` | Las programaciones que el usuario puede ver: todas con `allowScheduledJobs`, y si no, las ejecuciones que ha planificado. | `allowPlannedJobs` o `allowScheduledJobs` |
| `get_schedule` | Una programación, con sus extra vars (las que parecen secretos, enmascaradas) y la salida de su última ejecución. | `allowPlannedJobs` o `allowScheduledJobs` |
| `delete_schedule` | Cancela una ejecución planificada o elimina una programación que el usuario puede ver. | `allowPlannedJobs` o `allowScheduledJobs` |
| `list_stored_jobs` | Los [trabajos guardados](../jobs/stored-jobs.html) que el usuario puede ver, sin sus valores. | `allowStoredJobs` |
| `get_stored_job` | Un trabajo guardado con sus valores, por `id`, o por `form` y `name` entre los del propio usuario. | `allowStoredJobs` |
| `store_job` | Guarda valores de un formulario con un nombre, como hace **Almacén** en el formulario. | `allowStoredJobs` |
| `delete_stored_job` | Elimina un trabajo guardado que el usuario puede ver. | `allowStoredJobs` |

`launch_job`, `relaunch_job` y `plan_job` aceptan `verbose: true` para ejecutar el trabajo en modo detallado, lo que requiere la
opción de rol `allowVerboseMode`. Con [`MCP_READ_ONLY`](setup.html#limiting-what-agents-can-do) no se ofrecen las herramientas que lanzan, planifican o
modifican (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job` y `delete_stored_job`).

No hay ninguna herramienta para ejecutar una expresión, consulta, playbook o extravars arbitrarios. Las expresiones
y consultas solo se ejecutan tal y como las define el formulario.

El [Asistente de chat](../chat) también usa estas herramientas, con un botón **Lanzar** en lugar de `launch_job`.

---

## Rellenar un formulario

Llama a `resolve_field` con el nombre del formulario y los valores que tienes hasta el momento, y otra vez después de cada respuesta. Recorre
los campos en orden de dependencias e informa de cada uno:

- `status`: `resolved`, `waiting` (con `waitingFor`), `hidden` o `error` (el campo vuelve a su valor predeterminado);
- `value`, `default` y, en los campos de elección, `options` (como mucho `maxOptions`, por defecto 200);
- `needsInput`: un campo obligatorio sin valor, o una elección que sigue en `__auto__`;
- `validationErrors`: las reglas que incumple el valor, como `[{type, description}]`, con el mensaje del navegador.

Para el formulario completo, `missing` e `invalid` listan lo que aún hay que corregir; `launch_job` lo rechaza hasta que `complete` sea true.

La validación es el propio código del navegador, compartido con la [validación del lanzamiento](../launch-validation). Los campos ocultos no se
validan, y un campo opcional vacío es válido.

---

## Programaciones y ejecuciones planificadas

`plan_job` acepta los mismos `form`, `values` y `expectedPayloadHash` que `launch_job`, con un `name` para la ejecución y `run_at`, una
hora ISO 8601 con su desfase o `Z` (`2026-10-15T22:00:00+02:00`); se rechaza una hora sin zona. Los valores se resuelven
y validan en ese momento, y se vuelven a comprobar cuando se dispara la ejecución, como en una [ejecución planificada](../jobs/schedules.html#planned-runs) en el
navegador. La respuesta da la hora de ejecución en UTC y en el reloj de la aplicación.

`create_schedule` acepta un `form`, un `name`, o bien `cron` (cinco campos, como `0 22 * * 1-5`) o bien `run_at`, y las
`extraVars` que recibe el trabajo. Una programación así se ejecuta como el `Schedule Service`, sin la validación del formulario; para ejecutar un formulario una vez como
el usuario, usa `plan_job`. Los nombres de las programaciones son únicos.

---

## Trabajos guardados

Un trabajo guardado son los valores de un formulario guardados con un nombre; las herramientas actúan sobre los mismos trabajos guardados que el navegador.

`list_stored_jobs` lista los trabajos guardados del propio usuario, o los de todos para un usuario con `showSettings`, con su nombre, descripción,
formulario, creación y caducidad. Uno marcado como `usable` (del propio usuario, de un formulario que puede lanzar) se puede pasar como `storedJob`
(`{ "id": 7 }`, o `{ "name": "..." }` entre los del propio usuario para ese formulario) a `resolve_field`, `launch_job` o `plan_job`: sus
valores son el punto de partida y `values` se aplican encima. Los campos Password no se guardan, así que proporciónalos en `values`.
`launch_job` y `plan_job` a partir de un trabajo guardado necesitan el `expectedPayloadHash` que devolvió `resolve_field` para él, y
`resolve_field` rechaza `storedJob` junto con `subform`.

`store_job` acepta el `form`, un `name` único entre los trabajos guardados del usuario para ese formulario, los `values` y, opcionalmente, una
`description` y `expires_at` (ISO 8601 con su desfase o `Z`). Su respuesta indica qué campos Password se han dejado fuera.

---

## Pasar valores

Pasa `field` para resolver solo ese campo y aquello de lo que depende. Para una fila de lista o un paso de un asistente, pasa `subform` (y,
opcionalmente, `parent`, los valores del formulario padre).

Envía los valores tal como los tiene el navegador. Un campo de elección acepta también un registro parcial o su valor de `valueColumn`
(`"vol1"`), y un array cuando es `multiple`. Los campos calculados ignoran los valores enviados salvo que sean `editable`.

---

## Aprobar el payload exacto

Cuando el formulario está completo, `resolve_field` devuelve también lo que enviará `launch_job`:

- `modeledExtravars`: las extravars después de aplicar `model`, `valueColumn` y `output`,
  con los campos Password enmascarados;
- `credentials`: las credenciales de AnsibleForms que usará el trabajo (nombres, no secretos);
- `payloadHash`: un hash SHA-256 del nombre del formulario, las extravars reales y las credenciales.

Muestra `modeledExtravars` al operador y pasa el `payloadHash` que ha aprobado a
`launch_job` como `expectedPayloadHash`. El lanzamiento vuelve a resolver el formulario y se rechaza
cuando el payload es distinto, por ejemplo porque una consulta ahora responde otra cosa.
`ansibleforms_user`, `__jobid__` y `__verbose__` se añaden en el lanzamiento y no forman parte del hash.

`launch_job` solo comprueba el payload. Una edición del formulario que deja el payload igual no hace que se rechace el lanzamiento.
Cada respuesta de `resolve_field` lleva además un `formFingerprint`, un hash SHA-256 de la definición del formulario: para rechazar un
lanzamiento tras cualquier edición del formulario, compáralo tú mismo antes de llamar a `launch_job`, como hace el botón
**Lanzar** del asistente de chat.

---

## Relanzar con cambios

`relaunch_job` acepta el `id` de un trabajo y `values`: solo los campos que cambian, como valores en bruto.
`values` se aplica encima de los valores con los que se lanzó originalmente el trabajo, y el resultado se
resuelve y valida exactamente como con `launch_job`, filas de lista incluidas, y después se lanza como un
trabajo nuevo a tu nombre (`ansibleforms_user` eres tú, no quien lo envió originalmente). Se reutilizan los archivos subidos
del trabajo original.

Sin `values`, es un relanzamiento **tal como se ejecutó el trabajo**: sus extravars guardadas se reproducen en
el servidor, contraseñas incluidas (la vista previa las enmascara). Sin embargo, si el formulario está bajo la validación
del lanzamiento `enforce`, el relanzamiento pasa por la misma comprobación que un relanzamiento con
cambios.

**Las contraseñas nunca se guardan con los valores de los campos**, así que un relanzamiento que pasa por la
comprobación se rechaza cuando el formulario muestra un campo Password, en el nivel superior o en una fila de lista
(`unsupported`, con los `passwordFields`). Un campo Password oculto por sus dependencias no
bloquea el relanzamiento. Consulta [Validación del lanzamiento](../launch-validation).

Llámala primero con `preview: true`: devuelve `modeledExtravars` (con las contraseñas enmascaradas),
`credentials` y un `payloadHash` sin lanzar nada. Confírmalos con el usuario y después llámala
otra vez con `expectedPayloadHash`. Se aplican los mismos permisos que a un relanzamiento en el navegador:
el formulario debe permitir el relanzamiento y tus roles necesitan la opción `allowJobRelaunch`. Un
trabajo sin datos de formulario guardados (lanzado antes de que existiera el relanzamiento) y un formulario Wizard no se pueden
relanzar con cambios.

La API REST ofrece lo mismo mediante `POST /api/v2/job/{id}/relaunch` con el cuerpo
`{ "values": { ... } }`; sin cuerpo, reproduce el trabajo tal como se ejecutó.

---

## Errores

Una llamada rechazada es un error de la herramienta cuyo contenido estructurado lleva un `code` y los detalles:

| Código | Cuándo |
|---|---|
| `form_incomplete` | `launch_job` o `relaunch_job` sobre un formulario que no está completo, con `missing`, `invalid`, `waiting`, `validationErrors` y `rowErrors` |
| `payload_mismatch` | el payload es distinto de `expectedPayloadHash`, con ambos hashes |
| `access_denied` | los roles del usuario no le dan acceso al formulario, trabajo, programación o trabajo guardado, o al modo detallado, o el servidor es de solo lectura |
| `not_found` | no existe ese formulario, subform o trabajo |
| `unsupported` | un formulario Wizard, un subform por sí solo, un campo File, o un `relaunch_job` que necesitaría un campo Password visible |
| `no_form_data` | `relaunch_job` con cambios para un trabajo que no guardó valores de formulario, como uno lanzado por una programación; relánzalo sin cambios |
| `invalid_request` | una petición que el servidor rechaza por estar mal formada |
| `internal_error` | cualquier otra cosa |
