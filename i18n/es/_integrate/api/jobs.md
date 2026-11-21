---
layout: default
title: Trabajos
parent: API REST
nav_order: 2
translated_from: 456fc5cc76acba8dff6c3595adb2e060cf839250
---

# Trabajos
{: .no_toc }

Lanza un formulario, sigue el trabajo, abórtalo, relánzalo o apruébalo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un trabajo es una ejecución de un formulario. Lánzalo con el nombre y los valores del formulario, y después síguelo por su ID.

---

## Lanzar un formulario

Envía el nombre del formulario y sus valores a `POST /api/v2/job`:

```bash
curl -X POST https://af.example.com/api/v2/job \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{
        "formName": "Create Virtual Machine",
        "extravars": { "vm_name": "test-vm", "datacenter": "dc1" },
        "rawFormData": { "vm_name": "test-vm", "datacenter": "dc1" }
      }'
```

La petición admite estas propiedades:

| Propiedad | Significado |
|---|---|
| `formName` | El nombre del formulario que se lanza. Obligatoria. |
| `extravars` | Las variables extra del trabajo. También se acepta `payload` como otro nombre para ella. |
| `rawFormData` | Los valores de los campos del formulario, tal como los tiene el navegador. La [validación del lanzamiento](../launch-validation/) los comprueba y construye a partir de ellos las extravars. |
| `credentials` | Credenciales que se pasan al trabajo, por nombre. |
| `files` | Las subidas de los campos de archivo del formulario (consulta [Subida de archivos](../launch-validation/file-uploads.html)). |

La respuesta contiene el ID del nuevo trabajo:

```json
{ "id": 42 }
```

Para ejecutar el trabajo en modo detallado, añade `"__verbose__": true` a las extravars. Necesita la opción de rol `allowVerboseMode`,
o el lanzamiento responde `403`.

---

## Subir un archivo

Un formulario con un campo de archivo necesita que el archivo se suba primero. Envíalo como la parte multipart `file` a `POST /api/v2/job/upload`:

```bash
curl -X POST https://af.example.com/api/v2/job/upload \
  -H "Authorization: Bearer <token>" -F "file=@firmware.bin"
```

La respuesta describe la subida guardada:

```json
{ "fieldname": "file", "originalname": "firmware.bin", "encoding": "7bit", "mimetype": "application/octet-stream",
  "destination": "<UPLOAD_PATH>", "filename": "3f9c...", "path": "<UPLOAD_PATH>/3f9c...", "size": 1048576 }
```

Pásala sin cambios en los `files` del lanzamiento, con el nombre del campo de archivo: `"files": { "firmware": { ... } }`. El servidor
la comprueba con su propio disco (consulta [Subida de archivos](../launch-validation/file-uploads.html)).

---

## Seguir el trabajo

Lee el trabajo por su ID:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

El trabajo contiene su `status`, sus `extravars` (también como `payload`, el mismo objeto), sus `subjobs` y su `output`. La
salida es HTML con los colores de la página del trabajo; añade `?text=true` para texto plano, que va mejor para un script o un log:

```bash
curl "https://af.example.com/api/v2/job/42?text=true" -H "Authorization: Bearer <token>"
```

Su `status` es `running` mientras se ejecuta, y `approve` mientras espera una aprobación. Un trabajo termina con uno de estos:

| Estado | Significado |
|---|---|
| `success` | El trabajo terminó sin errores |
| `failed` | El trabajo falló |
| `warning` | Un trabajo de varios pasos terminó, pero por el camino falló un paso que tiene `continue` |
| `aborted` | El trabajo se abortó |
| `rejected` | La aprobación se denegó, así que lo que la esperaba no se ejecutó |
| `abandoned` | El proceso que seguía el trabajo se detuvo (un reinicio, un contenedor sustituido) y el trabajo se dio por perdido |

Un trabajo que se ejecutaba en un runner cuando se abandonó todavía puede terminar con su resultado real, si ese runner lo acaba al final.

---

## Buscar trabajos

`GET /api/v2/job` lista primero los trabajos más recientes, como `{ "count": ..., "records": [ ... ] }`. Estos parámetros de consulta la acotan:

| Parámetro | Significado |
|---|---|
| `records` | Cuántos trabajos, como máximo. El valor predeterminado es [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE) (1000), y 5000 el máximo salvo que `JOBS_LIST_SIZE` sea mayor. |
| `user`, `user_type` | Solo los trabajos de este usuario. `user_type` es `local` si se omite (`ldap`, `azuread`, `oidc` para los demás). |
| `runner` | Solo los trabajos que se ejecutaron en este runner |

```bash
curl "https://af.example.com/api/v2/job?records=20&user=automation" -H "Authorization: Bearer <token>"
```

Un usuario ve sus propios trabajos y los trabajos que esperan una aprobación que puede dar alguno de sus roles. Un administrador, o un rol con la opción
`showAllJobLogs` o `manageAllJobs`, ve todos los trabajos. Un registro contiene el resumen del trabajo (`id`, `form`, `status`, `start`, `end`, `user`, `runner`, ...); lee
el propio trabajo para obtener sus extravars y su salida.

`GET /api/v2/job/approvals` responde con un número: cuántos trabajos esperan una aprobación que puede dar el usuario.

---

## Más sobre un trabajo

Estos endpoints leen más datos de un trabajo:

| Llamada | Qué devuelve |
|---|---|
| `GET /api/v2/job/{id}/rawformdata` | Los valores de los campos con los que se lanzó el trabajo, tal como los tenía el formulario. Se aplican los mismos permisos que en un relanzamiento: tu propio trabajo (o cualquier trabajo para un administrador o un rol con `manageAllJobs`), un formulario que permita relanzar, y la opción de rol `allowJobRelaunch`. |
| `GET /api/v2/job/{id}/events` | Los eventos estructurados de un trabajo de playbook (desde la 7.3.0, para un playbook en un RTE de la 7.3.0 o posterior): cada play, tarea, resultado de host y el resumen final, con su `order`, `type`, `play`, `task`, `host`, `duration` y `time` |
| `GET /api/v2/job/{id}/events/{order}` | Uno de esos eventos con todo su `result`, tal como lo muestra el diálogo **Resultado de la tarea**; `400` si `order` no es un número entero, `404` si el trabajo no tiene ese evento |
| `GET /api/v2/job/{id}/node/{nodeId}` | Un nodo de un trabajo de workflow: `{ "node", "job", "extravars", "artifacts" }`, donde `job` es el ID del propio trabajo del nodo, o `null` si el nodo no se ejecutó. |
| `GET /api/v2/job/{id}/relaunch-options` | Desde 7.7.0, lo que puede ser un relanzamiento además del completo: `{ "failedHosts", "fromFailedNode" }` (ver abajo); `403` para un usuario que no puede relanzar el trabajo |

---

## Otras acciones

Estos endpoints actúan sobre un trabajo existente:

| Llamada | Acción |
|---|---|
| `POST /api/v2/job/{id}/abort` | Abortar un trabajo en ejecución |
| `POST /api/v2/job/{id}/relaunch` | Relanzar un trabajo, tal como se ejecutó o con cambios (consulta [Relanzar](../launch-validation/relaunching.html)) |
| `POST /api/v2/job/{id}/approve` | Aprobar un trabajo que espera aprobación; tu propio trabajo responde `403`, salvo que su aprobación tenga `allowSelf: true` o seas administrador |
| `POST /api/v2/job/{id}/reject` | Rechazar un trabajo que espera aprobación |
| `GET /api/v2/job/{id}/download` | Descargar la salida del trabajo |
| `DELETE /api/v2/job/{id}` | Eliminar un trabajo |

Abortar, aprobar, rechazar y eliminar responden con un mensaje, y un relanzamiento también con el ID del nuevo trabajo:

```json
{ "message": "Job has been relaunched with job id 43", "id": 43 }
```

Añade `?verbose=true` a un relanzamiento para ejecutar el nuevo trabajo en modo detallado, con la opción de rol `allowVerboseMode`. Un trabajo que
está en un estado que no admite la acción, por ejemplo abortar un trabajo que ya ha terminado, responde `409`.

### Relanzar parte de un trabajo

Desde 7.7.0 el cuerpo de un relanzamiento puede pedir solo una parte del trabajo, con uno de dos indicadores, nunca ambos:

| Cuerpo | El trabajo nuevo |
|---|---|
| `{ "failedHostsOnly": true }` | Se ejecuta solo en los hosts en los que falló el trabajo, como hace **En los hosts fallidos** (ver [Relanzar en los hosts fallidos](../jobs/actions.html#relaunch-on-the-failed-hosts)) |
| `{ "fromFailedNode": true }` | Relanza un trabajo de workflow fallido desde su nodo fallido (ver [Relanzar desde el nodo fallido](../workflows/running.html#relaunch-from-the-failed-node)) |

Cualquiera de los dos va con o sin `values`. Una nueva ejecución en los hosts fallidos también responde con los hosts:

```json
{ "message": "Job 44 re-runs the 2 failed host(s)", "id": 44, "failedHosts": ["web07", "web19"] }
```

Un trabajo sin hosts fallidos que volver a ejecutar, o uno que no se puede relanzar desde su nodo fallido, responde `400` con el motivo. Los
dos indicadores juntos también responden `400`.

Para saber de antemano qué indicador acepta un trabajo, `GET /api/v2/job/{id}/relaunch-options` responde tal como lo lee la página del trabajo:

```json
{ "failedHosts": ["web07", "web19"], "fromFailedNode": false }
```

`failedHosts` es `null` cuando el trabajo no ofrece una nueva ejecución en sus hosts fallidos, también cuando falló en todos los hosts, y
`fromFailedNode` es `true` para un trabajo de workflow fallido que puede volver a ejecutarse desde su nodo fallido. `GET /api/v2/job/{id}`
incluye la misma respuesta como `relaunchOptions` para un trabajo terminado, `null` para un usuario que no puede relanzarlo.
