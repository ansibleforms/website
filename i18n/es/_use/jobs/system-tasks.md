---
layout: default
title: Tareas del sistema
parent: Trabajos
nav_order: 7
translated_from: 3c7c5f9702fa19b6daa323c22d92feefd289dc54
---

# Tareas del sistema
{: .no_toc }

Las tareas de mantenimiento que AnsibleForms ejecuta por sí solo, y cuándo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: las limpiezas, la copia nocturna y el resto del trabajo de fondo del servidor, listados en **Trabajos** desde la 7.8.0.

---

## Las tareas

El servidor ejecuta estas tareas por sí solo, cada una con un cron en la zona horaria del servidor, definida con [`LOG_TZ`](../customization/logging.html#env_LOG_TZ):

| Tarea | Se ejecuta por defecto | Qué hace |
|---|---|---|
| **Jobs abandonados** | Cada hora | Termina los trabajos que llevan un día sin salida y que ningún runner tomó (consulta [Trabajos abandonados](cleanup.html#abandoned-jobs)) |
| **Nodos detenidos** | Cada minuto | Libera los trabajos, las reclamaciones y los runners que tenían los nodos de AnsibleForms y los RTE que dejaron de responder |
| **Fin de programaciones** | Cada minuto | Desactiva o elimina las [programaciones](schedules.html) que llegaron a su fin |
| **Resincronizar programaciones** | Cada 5 minutos | Vuelve a leer de la base de datos las programaciones y los pulls de repositorios, por si se perdió un aviso de cambio |
| **Tokens caducados** | Cada día a las 03:00 | Elimina los tokens de inicio de sesión caducados, las revocaciones de tokens y los tokens de API |
| **Limpieza de auditoría** | Cada día a las 03:30 | Elimina las entradas de auditoría más antiguas que `AUDIT_RETENTION_DAYS` |
| **Limpieza de jobs** | Cada día a las 02:30 | Elimina los trabajos terminados más antiguos que `JOB_RETENTION_DAYS`, con su salida |
| **Copia nocturna** | Cada día a medianoche | Hace una copia de la base de datos y elimina las copias nocturnas más antiguas que superan `NIGHTLY_BACKUP_RETENTION` |
| **Limpieza de jobs guardados** | Cada día a las 04:00 | Elimina los trabajos guardados caducados o sin usar durante `STORED_JOB_UNUSED_DAYS`, y olvida los nodos desaparecidos hace un día |
| **Recarga del config seed** | Cada minuto | Vuelve a aplicar la [semilla de configuración](../seed/reloading.html) cuando su archivo ha cambiado |

Los ajustes de retención se describen en [Copias de seguridad y retención](../customization/retention.html), y las copias en
[Copias de seguridad](../production/backups.html). La **Recarga del config seed** está desactivada sin [`CONFIG_SEED_PATH`](../customization/configuration.html#env_CONFIG_SEED_PATH).

Estas tareas se ejecutan en el nodo que hace el trabajo de fondo: el proceso sin `AF_ROLE`, o el `worker` que tiene el bloqueo del worker
cuando la aplicación se reparte en varios nodos (consulta [Escalado](../production/scaling.html#roles)).

---

## Los bucles del hub de runners

El hub de runners entrega los trabajos a los RTE, y tres bucles propios se ejecutan cada pocos segundos en lugar de con un cron:

| Bucle | Se ejecuta por defecto | Qué hace |
|---|---|---|
| **Envío a runners** | Cada 2 segundos | Entrega los trabajos en espera y las cancelaciones a sus runners; uno lanzado en otro nodo llega a su runner en la siguiente pasada |
| **Llamada a runners entrantes** | Cada 10 segundos | Llama a los runners [entrantes](../rte/modes.html#inbound) que este nodo puede tener, de nuevo para uno que perdió su socket |
| **Limpieza de jobs terminados** | Cada 60 segundos | Suelta lo que este nodo guardaba de trabajos que terminaron en otro nodo |

Los bucles se ejecutan en cada nodo que ejecuta la aplicación web, así que con varios nodos de aplicación cada uno tiene los suyos. Un minuto,
el paso más pequeño de un cron, es demasiado grueso para ellos: cada uno se ejecuta cada tantos segundos.

---

## La lista Sistema

La página [Trabajos](./) lista las tareas en **Futuro**, como **Sistema**, con el número de tareas, para los administradores (opción de rol `showSettings`).

La lista tiene una fila por tarea y por bucle, y se vuelve a leer cada minuto:

| Columna | Muestra |
|---|---|
| **Nombre** | El nombre de la tarea |
| **Programación** | Cuándo se ejecuta, en palabras (*Cada hora*, *Cada 2 segundos*), su cron al pasar el ratón, o **Desactivada** para una tarea que no se ejecuta |
| **Última ejecución** | Cuándo empezó la última ejecución, o un guion si nunca se ejecutó |
| **Próxima ejecución** | Cuándo se ejecuta la próxima vez |
| **Estado** | Cómo fue la última ejecución: `success` o `failed` |

**Columnas** ofrece también **Descripción**, lo que hace cada tarea. Un clic en una fila abre la página de la tarea. Las tareas son de la
propia aplicación: no se pueden añadir ni eliminar.

---

## La página de una tarea

La página de una tarea tiene tres pestañas, con **Ejecutar ahora** y **Guardar** encima, y un cuadro de búsqueda que filtra todas las pestañas a la vez.

| Pestaña | Qué muestra |
|---|---|
| **Detalles** | Su **Nombre** y su **Descripción**, su **Último lanzamiento** (el error al pasar el ratón cuando falló), el **Resultado** de la última ejecución, **Última ejecución**, **Próxima ejecución**, el **Nodo** que respondió para un bucle, y el **Ajuste aplicado** |
| **Programación** | Cuándo se ejecuta: un cron para una tarea, un **Intervalo** en segundos para un bucle |
| **Ejecuciones** | Cada ejecución registrada, la más reciente primero |

**Ajuste aplicado** nombra la variable y su valor, como `JOB_RETENTION_DAYS` 90, con **Cámbialo en Configuración** para abrir
la pestaña de configuración que lo cambia. Una tarea sin ese ajuste muestra un guion.

### La pestaña Programación
{: .no_toc }

El cron de una tarea se edita en el mismo editor que el de una programación: preajustes, la expresión en palabras y las tres próximas
ejecuciones, en la zona horaria del servidor. Admite 5 campos (minuto, hora, día, mes y día de la semana) y debe volver a ejecutarse. Un
bucle admite un número entero de segundos, dentro de sus límites, que indica la línea bajo el campo.

**Guardar** escribe el valor en el archivo de ajustes gestionado, como hacen las páginas de configuración, y lo aplica a la vez en todos los
nodos, sin reiniciar. Un valor definido en el entorno del proceso, o cualquier valor con [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0`,
se muestra de solo lectura, con la línea *Definido por la variable de entorno* y su nombre.

### La pestaña Ejecuciones
{: .no_toc }

Cada ejecución de una tarea es una fila, con estas columnas:

| Columna | Muestra |
|---|---|
| **Lanzado por** | El usuario que seleccionó **Ejecutar ahora**, como `admin (local)`, o **Programación** para una ejecución por su cron |
| **Hora de inicio**, **Hora de finalización** y **Duración** | Cuándo empezó y terminó la ejecución, y cuánto duró |
| **Estado** | `success` o `failed` |
| **Resultado** | Lo que hizo la ejecución, como *Removed 120 jobs*, o su error |
| **Nodo** | El nodo que la ejecutó |

Se conservan las ejecuciones de los últimos 30 días, hasta 1000 por tarea: para una tarea que se ejecuta cada minuto, unas 16 horas.

Un bucle se ejecuta demasiado a menudo para una fila por pasada. Su pestaña **Ejecuciones** muestra en su lugar, por nodo:

* un resumen de cada hora, como *1,800 passes, 0 failed*, `failed` cuando falló una pasada de esa hora;
* una fila por cada **Ejecutar ahora**, con *Run now: done* o el error;
* una fila `failed` cuando falla una pasada de su temporizador, como mucho una vez por minuto para el mismo error.

### Ejecutar ahora
{: .no_toc }

**Ejecutar ahora** ejecuta la tarea de inmediato, en el nodo que ejecuta las tareas, y registra la ejecución con tu nombre. Está desactivado
mientras hay una ejecución de la tarea en curso, y para una tarea **Desactivada**. Una ejecución larga, como la copia nocturna, sigue después de que la página responda.

**Ejecutar ahora** en un bucle ejecuta una pasada en el nodo que sirve la página, y se rechaza donde no se ejecuta el hub de runners. Cada
**Ejecutar ahora** se escribe en el registro de auditoría como `system.task.run`.

---

## Cambiar cuándo se ejecuta una tarea

Cada tarea y cada bucle tiene una variable de entorno para su horario, que escribe su pestaña **Programación**. Todas se aplican sin reiniciar.

| Variable | Por defecto | Tarea |
|---|---|---|
| [`ABANDONED_JOBS_CRON`](../customization/system-tasks.html#env_ABANDONED_JOBS_CRON) | `0 * * * *` | Jobs abandonados |
| [`DEAD_NODES_CRON`](../customization/system-tasks.html#env_DEAD_NODES_CRON) | `* * * * *` | Nodos detenidos |
| [`SCHEDULE_ENDS_CRON`](../customization/system-tasks.html#env_SCHEDULE_ENDS_CRON) | `* * * * *` | Fin de programaciones |
| [`SCHEDULE_RESYNC_CRON`](../customization/system-tasks.html#env_SCHEDULE_RESYNC_CRON) | `*/5 * * * *` | Resincronizar programaciones |
| [`TOKEN_CLEANUP_CRON`](../customization/system-tasks.html#env_TOKEN_CLEANUP_CRON) | `0 3 * * *` | Tokens caducados |
| [`AUDIT_CLEANUP_CRON`](../customization/system-tasks.html#env_AUDIT_CLEANUP_CRON) | `30 3 * * *` | Limpieza de auditoría |
| [`JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_JOB_CLEANUP_CRON) | `30 2 * * *` | Limpieza de jobs |
| [`NIGHTLY_BACKUP_CRON`](../customization/system-tasks.html#env_NIGHTLY_BACKUP_CRON) | `0 0 * * *` | Copia nocturna |
| [`STORED_JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_STORED_JOB_CLEANUP_CRON) | `0 4 * * *` | Limpieza de jobs guardados |
| [`CONFIG_SEED_RELOAD_CRON`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_CRON) | `* * * * *` | Recarga del config seed |
| [`RUNNER_DISPATCH_SECONDS`](../customization/system-tasks.html#env_RUNNER_DISPATCH_SECONDS) | `2` (de 1 a 60) | Envío a runners |
| [`RUNNER_DIAL_SECONDS`](../customization/system-tasks.html#env_RUNNER_DIAL_SECONDS) | `10` (de 2 a 300) | Llamada a runners entrantes |
| [`RUNNER_PRUNE_SECONDS`](../customization/system-tasks.html#env_RUNNER_PRUNE_SECONDS) | `60` (de 10 a 3600) | Limpieza de jobs terminados |

Un valor que no es un cron válido, o unos segundos fuera de los límites, definidos a mano en el entorno, se ignoran en favor del valor por defecto.

### CONFIG_SEED_RELOAD_SECONDS
{: .no_toc }

Antes de la 7.8.0 la semilla de configuración se comprobaba cada [`CONFIG_SEED_RELOAD_SECONDS`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_SECONDS).
Esa variable está obsoleta desde la 7.8.0, en favor de `CONFIG_SEED_RELOAD_CRON`, y se eliminará en la 8.0. Mientras
`CONFIG_SEED_RELOAD_CRON` no esté definida, se sigue leyendo como un cron, con un aviso en el registro al arrancar:

| `CONFIG_SEED_RELOAD_SECONDS` | Se lee como |
|---|---|
| `60` | `* * * * *`, cada minuto |
| Un múltiplo de 60 hasta `3600` | Cada tantos minutos, como `*/5 * * * *` para `300` (`3600` se lee como `0 * * * *`) |
| Un número menor que 60 que divide a 60 | Cada tantos segundos |
| `0` | La recarga está desactivada |
| Cualquier otro número | El más cercano de estos, que indica el registro |

La pestaña **Programación** de la tarea muestra ese cron con la línea *De CONFIG_SEED_RELOAD_SECONDS, obsoleta; un cron guardado aquí
la sustituye.* **Guardar** escribe `CONFIG_SEED_RELOAD_CRON`, que a partir de entonces prevalece sobre la variable antigua.
