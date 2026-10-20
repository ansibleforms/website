---
layout: default
title: Acciones de trabajo
parent: Trabajos
nav_order: 3
translated_from: 6014f8e14db84fca0d144f1d64232e50aa6cbec9
---

# Acciones de trabajo
{: .no_toc }

Lanza, aborta, relanza, aprueba o rechaza, y elimina un trabajo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Lanzar un trabajo

Todo trabajo empieza en un formulario. Ábrelo desde la página **Formularios**, rellena los campos y pulsa **Enviar**:

1. El formulario se valida en el navegador, y los valores de los campos se envían al servidor.
2. El servidor crea el trabajo y devuelve su número; se ejecutan las acciones [`onSubmit`](../forms/job-status-action.html) del formulario.
3. La salida del trabajo aparece bajo el formulario y se actualiza cada dos segundos hasta que el trabajo termina.

El trabajo aparece también en la página **Trabajos**, donde puedes seguirlo más tarde.

### Quién puede lanzar un formulario

Un formulario se lista, y se puede lanzar, para los usuarios que tienen uno de los [roles](../config/roles.html) de su lista `roles`.
El rol `default`, que tienen todos los usuarios, pone un formulario a disposición de todo el que pueda iniciar sesión.

### Antes de enviar

La barra que hay sobre los campos ofrece algunas herramientas, cada una visible solo cuando tu rol lo permite:

| Botón | Qué hace | Opción de rol |
|---|---|---|
| **Mostrar variables extra** | Muestra de antemano las extravars que recibirá el trabajo, a medida que rellenas los campos | `showExtraVars` |
| **verbose** | Ejecuta el trabajo en modo detallado | `allowVerboseMode` |
| **Cargar desde almacén** | Rellena los campos a partir de un [trabajo guardado](stored-jobs.html) | `allowStoredJobs` |
| **Recargar este formulario** | Vuelve a cargar el formulario, con sus valores por defecto | ninguna |

### Opciones al lanzar

Un formulario puede dejar que sus usuarios elijan algunas opciones de Ansible al lanzarlo, declarando un campo con un nombre reservado. El
valor del campo sustituye entonces el ajuste propio del formulario:

| Nombre del campo | Sustituye | Tipo de campo habitual |
|---|---|---|
| `__check__` | El modo check, una ejecución de prueba que no cambia nada | `checkbox` |
| `__diff__` | El modo diff, que muestra lo que cambiaría | `checkbox` |
| `__limit__` | Los hosts en los que se ejecuta el playbook | `text` o `enum` |
| `__tags__` | Los tags que se ejecutan | `text` o `enum` |
| `__inventory__` | El inventario | `enum` |
| `__playbook__`, `__template__` | El playbook, o la plantilla de AWX / AAP | `enum` |

Por ejemplo, un formulario que ofrece una ejecución de prueba y un límite de hosts:

```yaml
fields:
  - name: __check__
    type: checkbox
    label: Dry run (check mode)
  - name: __limit__
    type: text
    label: Limit to these hosts
```

El servidor solo acepta estos nombres de un formulario que los declara como campos, así que un lanzamiento desde la API no puede añadirlos por
su cuenta. Las propiedades que sustituyen se describen en [Formularios de Ansible](../forms/ansible.html) y [Formularios de AWX](../forms/awx.html).

### Qué puede detener un lanzamiento

Un lanzamiento no siempre se convierte enseguida en un trabajo en ejecución:

* **Campos no válidos** : el formulario no se envía, y cada campo que no supera su validación indica por qué.
* **Validación del lanzamiento** : con la [validación del lanzamiento](../launch-validation/) en `enforce`, el servidor vuelve a comprobar los valores
  y rechaza un lanzamiento que incumple las reglas del formulario.
* **Aprobación** : un formulario con un [punto de aprobación](../forms/approval.html) crea el trabajo, que entonces espera en el estado
  `approve`; consulta [Aprobar o rechazar un trabajo](#approve-or-reject-a-job).

Cuando el trabajo termina, las [notificaciones](../forms/notifications.html) del formulario envían sus correos y mensajes de canal, y se ejecutan sus
acciones según el estado del trabajo.

### Otras formas de iniciar un trabajo

Un formulario también puede iniciar un trabajo sin que una persona pulse **Enviar**:

| Iniciado por | Cómo | Página |
|---|---|---|
| Ejecución posterior o programación cron | **Ejecutar más tarde (una sola vez)** o **Programación (recurrente)** junto a **Enviar** | [Programaciones](schedules.html) |
| Un script o un pipeline | `POST /api/v2/job` con un token de API | [Trabajos en la API REST](../api/jobs.html) |
| Un agente de IA | La herramienta `launch_job` del servidor MCP | [Herramientas MCP](../mcp/tools.html) |
| Una conversación | El asistente de chat rellena el formulario y lo lanza | [Asistente de chat](../chat/) |
| Un trabajo anterior | **Relanzar**, más abajo | [Relanzar un trabajo](#relaunch-a-job) |

---

## Abortar un trabajo

**Abortar** en el menú de la fila (⋮) de la lista, o **Abortar trabajo** en la página del trabajo, detiene un trabajo con estado `running`. Tras confirmar,
AnsibleForms marca el trabajo para abortarlo:

* **`ansible`**: el RTE detiene el proceso del playbook (con todos sus workers), y el trabajo termina como `aborted` con
  `... was aborted by the operator`. Un trabajo que aún espera un RTE libre se aborta antes de empezar.
* **Un trabajo de plantilla** (AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins): AnsibleForms pide al runner que cancele o detenga
  el trabajo, y el trabajo termina como `aborted`. Cuando el runner se niega, la salida muestra `Abort request denied`, seguido de
  `reverting abort request`, y el trabajo sigue ejecutándose. Un build de Jenkins que aún está en la cola se saca de ella.
* **`workflow`**: se abortan los trabajos de los nodos en ejecución y no se inicia nada más (consulta
  [Ejecutar un workflow](../workflows/running.html#abort)).
* **`multistep`**: los pasos que aún no han empezado se omiten (`skipping: [Abort is requested]`), y el trabajo principal
  termina como `aborted`. Un paso que ya se está ejecutando es un trabajo propio: ábrelo y abórtalo para detenerlo también.

Puedes abortar tus propios trabajos; un administrador, o desde 7.3.0 un usuario cuyo rol activa `manageAllJobs`, puede abortar cualquier trabajo. `showAllJobLogs` permite a un
usuario ver los trabajos de otros usuarios, no abortarlos.

---

## Relanzar un trabajo

**Relanzar** en el menú de la fila (⋮) de la lista, o **Relanzar trabajo** en la página del trabajo, inicia un nuevo trabajo a partir de uno terminado. Se ofrece en cualquier
trabajo que no esté en `running` ni esperando aprobación, a los usuarios cuyo rol activa la opción de rol `allowJobRelaunch`.

El diálogo ofrece:

* **Relanzar**: vuelve a ejecutar el trabajo con los valores con los que se ejecutó, como un trabajo nuevo a tu nombre.
* **Modo detallado**: relanza en modo detallado; se muestra con la opción de rol `allowVerboseMode`.
* **Editar valores antes de relanzar**, y luego **Editar y relanzar**: abre el formulario rellenado con los valores del trabajo, para que
  puedas cambiarlos antes de enviarlo.

Un relanzamiento también requiere que el formulario lo permita (`allowRelaunch`, true por defecto) y que el trabajo sea **tuyo**, salvo que
seas administrador o, desde 7.3.0, tengas `manageAllJobs`; `showAllJobLogs`, que hasta 7.2 relanzaba cualquier trabajo, ya no lo hace. Cómo se comprueba un relanzamiento frente a las reglas del formulario, y por qué un formulario con un
campo de contraseña puede rechazarlo, se describe en [Relanzar](../launch-validation/relaunching.html).

### Relanzar con datos rellenados

**Editar y relanzar** abre el formulario con el parámetro de URL `prefillJobId`, que también puedes usar en un enlace propio:

```text
https://af.example.com/form?form=New%20Virtual%20Machine&prefillJobId=61
```

El formulario carga los valores de los campos guardados con el trabajo `61` y muestra `Formulario rellenado con los datos del trabajo anterior #61`.
Al enviarlo se inicia un trabajo nuevo, comprobado como cualquier otro lanzamiento. El rellenado sigue las mismas reglas que un relanzamiento:

* **Los campos de contraseña nunca se guardan**, así que nunca se rellenan: vuelve a introducirlos. Las constantes tampoco se guardan.
* Se requiere la opción de rol `allowJobRelaunch`, y el trabajo debe ser tuyo (o debes ser administrador o tener `manageAllJobs`).
* Un formulario con `allowRelaunch: false` no se puede relanzar ni rellenar:

```yaml
- name: New Virtual Machine
  type: ansible
  playbook: create-vm.yaml
  allowRelaunch: false
```

Un trabajo de antes de que se guardaran los valores de los campos no se puede rellenar, y el formulario muestra un error en su lugar:

```text
No saved form data found for job <id>. This job may have been created before the relaunch feature was enabled.
```

---

## Aprobar o rechazar un trabajo

Un trabajo con un [punto de aprobación](../forms/approval.html) se detiene en el estado `approve` y espera. Aparece en la página Trabajos de
sus aprobadores, los usuarios con uno de los roles de la aprobación, para que puedan encontrarlo; desde 7.3.0 los demás usuarios ya no lo ven.

**Revisar aprobación** se ofrece a los administradores y a los usuarios que tienen uno de los roles de la aprobación: un clic en la fila del trabajo,
**Revisar aprobación** en el menú de la fila, o el botón **Revisar aprobación** de la página del trabajo. El diálogo muestra el
mensaje de la aprobación, con los valores del trabajo ya rellenados (o una línea genérica si no lo tiene), y el formulario, el id del trabajo, quién lo lanzó y
cuándo, con un enlace al trabajo; **Rechazar** y **Aprobar** le dan respuesta:

* **Aprobar**: el trabajo continúa y su estado vuelve a `running`.
* **Rechazar**: el trabajo termina como `rejected`, y su salida registra `rejected by <username>`.

Un trabajo que espera aprobación no se puede relanzar ni eliminar desde la página Trabajos; apruébalo o recházalo primero.

Desde 7.3.0 el usuario que lanzó un trabajo no puede aprobarlo, para que siempre lo revise una segunda persona, aunque aún puede rechazarlo para
retirarlo. Un administrador siempre puede aprobar, incluidos sus propios trabajos. Un formulario cuyo punto de aprobación define
[`allowSelf: true`](../forms/approval.html#approving-your-own-job) permite también que quien lo lanza apruebe su propio trabajo.

---

## Eliminar un trabajo

**Eliminar** en el menú de la fila (⋮) de la lista, o **Eliminar trabajo** en la página del trabajo, elimina un trabajo con su salida tras confirmar.
Eliminar un trabajo multistep elimina también sus pasos. Para eliminar varios trabajos a la vez, márcalos en la primera columna de la lista y
haz clic en **Eliminar (n)** encima de ella.

Puedes eliminar tus propios trabajos. Los administradores y, desde 7.3.0, los usuarios con la opción de rol `manageAllJobs` pueden eliminar cualquier trabajo; `showAllJobLogs`
ya no puede. Un rol que define `allowJobDeletion: false` no elimina ningún trabajo, ni siquiera los suyos, para que el historial de trabajos quede completo. En la página
del trabajo el botón se oculta mientras el trabajo se ejecuta o se está abortando (salvo para los administradores y `manageAllJobs`) y mientras espera aprobación; en la lista, la
entrada del menú y la casilla aparecen en gris para un trabajo que no puedes eliminar.
