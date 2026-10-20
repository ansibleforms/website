---
layout: default
title: "La página de un runner"
parent: Runners
nav_order: 4
translated_from: 4260f9b8ce60f26e8808cf17bf4a4c3993229c5d
---

# La página de un runner
{: .no_toc }

Las pestañas de un runner, el modo, la conexión y los ajustes de un RTE, y Probar conexión
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Pestañas

La página de un runner muestra los pasos de su diálogo como pestañas, más lo que se ejecuta en él:

| Pestaña | Qué contiene |
|---|---|
| Detalles | El nombre y la descripción, el interruptor **Predeterminado** y el interruptor **Activado**, iguales para todos los tipos de runner |
| Tipo | El producto, como en el diálogo. Para un RTE también su **Modo**: **Base de datos (obsoleto)**, **Entrante** o **Saliente**, el `RTE_MODE` con el que funciona su RTE (consulta [Modos](../rte/modes.html)) |
| RTE | Solo de un RTE: su **Modo** en palabras y, en un modo de socket, su **Conexión** y sus ajustes (consulta [Los ajustes de un RTE](#an-rtes-settings)) |
| Credenciales | La **Credencial** con la que inicia sesión, una credencial de Conexiones > Credenciales del tipo del runner, que contiene su token o su login y la dirección de su servidor. La de un RTE contiene su `RTE_TOKEN`, y la dirección del RTE salvo que sea saliente. **Proyecto** para Semaphore, Rundeck y Jenkins |
| Formularios | Los formularios que se ejecutan en él, y cómo: **Lo nombra** o **Como runner por defecto**. Una fila abre el formulario |
| Trabajos | Los últimos 100 trabajos que se ejecutaron en él, con su estado, inicio, final y duración. Una fila abre el trabajo |

Cada pestaña tiene su propia dirección, como `/settings/runners/<id>/rte`, así que un enlace o un marcador la abre. Un runner sin esa pestaña se abre en
Detalles.

Los dos interruptores de la pestaña Detalles se guardan al momento. **Predeterminado** convierte el runner en el predeterminado de su tipo; se desactiva
haciendo predeterminado a otro runner. **Activado** activa o desactiva el runner: desactivado, no le llega ningún trabajo, tampoco como predeterminado de su tipo (consulta
[Predeterminado y Activado](list.html#default-and-enabled)).

Un RTE que pidió unirse se abre con un recuadro amarillo, **Este RTE ha pedido unirse**, con su huella y lo que dijo de sí mismo, y
**Aprobar** y **Rechazar** (consulta [Aprobar un RTE](registration.html#approving-an-rte)). Un runner de la [semilla de configuración](../seed/) lo indica
en la parte superior de su página, y es de solo lectura.

---

## Los ajustes de un RTE

La pestaña RTE gestiona un RTE desde la aplicación, sin editar su entorno en la máquina en la que se ejecuta.

**Conexión.** Un RTE en un modo de socket muestra una etiqueta: **Conectado** o **No conectado**. Al pasar el ratón, **Conectado** muestra el nodo de la aplicación
que tiene su socket, la versión del RTE y cuántos de sus trabajos se están ejecutando. **No conectado** significa que ningún nodo de la aplicación tiene un socket con él:
comprueba que el RTE se está ejecutando, su dirección o `APP_URL`, y su token.

**Ajustes.** Un RTE en modo saliente o entrante tiene cuatro ajustes, todos vacíos por defecto:

| Ajuste | Equivale a | Qué hace |
|---|---|---|
| Máximo de trabajos simultáneos | [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Cuántos playbooks ejecuta a la vez, `10` por defecto; `0` no pone límite |
| Caché de archivos | [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Cuánto de los archivos de los trabajos que le envió la aplicación conserva, en MB, `1024` por defecto; `0` no conserva ninguno |
| Tiempo de espera al parar | [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | Cuánto espera un RTE que se detiene a sus playbooks en ejecución, `25` segundos por defecto |
| Archivos de trabajo | [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | **Transferencia**: la aplicación envía los archivos de un trabajo con el trabajo. **Local**: se ejecuta desde sus propias carpetas montadas |

**Qué valor prevalece.** Un valor en la página prevalece sobre la misma variable definida en el RTE. Un campo vacío usa la variable propia del RTE,
o si no el valor predeterminado. Bajo cada campo la página indica cuál: **Sustituye a RTE_MAX_JOBS definida en el RTE (3)**, o **Vacío: el RTE usa su
propia RTE_MAX_JOBS, 3**; el marcador de posición muestra el valor que representa un campo vacío.

**Cómo llegan al RTE.** Los ajustes se guardan con el runner en la base de datos de la aplicación. La aplicación los envía por el socket del RTE
cuando se conecta y cada vez que se guardan, y el RTE los aplica al momento: una caché más pequeña se recorta, un nuevo límite cuenta a partir del
siguiente trabajo. El RTE los guarda solo en memoria y no escribe ningún archivo: tras un reinicio los vuelve a recibir al conectarse, antes de su primer trabajo.

Un RTE en modo base de datos (obsoleto) no tiene socket: lee estos ajustes de sus propias variables, y la pestaña lo indica.

---

## Probar conexión

Los botones de arriba a la derecha actúan sobre el runner tal como está guardado.

Junto a **Guardar** están **Probar conexión** y **Eliminar**, y en la pestaña Credenciales **Añadir credencial**, que crea una credencial del
tipo del runner y la selecciona. Un token o una contraseña no se vuelven a mostrar una vez guardados: cámbialos en la credencial.

**Probar conexión** comprueba que el runner responde y acepta su token o su login, y lo indica en un mensaje: **La conexión con el runner es
correcta**, o por qué ha fallado. No ejecuta ningún trabajo. Para un RTE comprueba también el contrato que habla el RTE (consulta
[El contrato](../rte/images.html#the-contract)):

| RTE | Qué lee la prueba | Cuándo falla |
|---|---|---|
| Saliente o Entrante | Quién tiene su socket, según lo registra cada nodo de la aplicación, y lo que dijo el RTE al conectarse. No llama a nada | Ningún nodo de la aplicación tiene un socket con él: *the RTE '&lt;name&gt;' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app*, o para uno entrante, *no app node could dial it at &lt;address&gt;: check its RTE_URL, its token and the network from the app to the RTE*. O el RTE habla un contrato distinto de 3 |
| Base de datos (obsoleto) | El `/rte/v1/health` del RTE, llamado con su token | El RTE no responde en su dirección, rechaza el token, o habla un contrato distinto de 2 |

La etiqueta **Conexión** de la pestaña RTE muestra el mismo estado del socket sin necesidad de una prueba.
