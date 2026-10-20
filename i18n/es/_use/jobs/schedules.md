---
layout: default
title: Programaciones
parent: Trabajos
nav_order: 4
redirect_from:
  - /schedules.html
  - /schedules/
  - /schedules/scheduling.html
  - /schedules/schedules-page.html
translated_from: 7ffab643975d7705375fbd02588c9db76e27f74f
---

# Programaciones
{: .no_toc }

Ejecuta un formulario más tarde o según una programación cron, y gestiona todas las programaciones
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Las acciones del formulario

Un formulario puede hacer algo más que ejecutarse de inmediato: el desplegable junto a su botón **Enviar** contiene tres acciones más.

| Acción | Qué hace | Opción de rol |
|---|---|---|
| **Programación (recurrente)** | Crea una programación que ejecuta el formulario según una expresión cron | `allowScheduledJobs` |
| **Ejecutar más tarde (una sola vez)** | Crea una programación que ejecuta el formulario una vez, en la fecha y hora que elijas | `allowPlannedJobs` |
| **Almacén** | Guarda los valores de los campos, para volver a cargarlos en el formulario más tarde | `allowStoredJobs` |

Una acción cuya opción de rol está desactivada no se muestra. El formulario se valida antes de cualquiera de ellas, igual que para **Enviar**. Ambas
acciones de programación crean una entrada en la página **Programaciones**; **Almacén** crea una entrada en la página **Trabajos almacenados**. La
barra lateral de la página [Trabajos](./) las abre bajo **Futuro**, como **Programados** y **Guardados**. Las opciones de rol se describen
en [Opciones de rol](../config/roles.html#role-options).

{: .warning }
> Trata `allowScheduledJobs` como una opción de nivel administrador. Sus programaciones no pertenecen al usuario que las creó: todo usuario
> con la opción ve y puede cambiar todas las programaciones. Además, una programación así se ejecuta con derechos de administrador, para cualquier formulario, sea cual sea
> el acceso propio de quien la creó. Concédela solo a roles en los que confiarías como administradores.

{: .note }
> **Ejecutar más tarde (una sola vez)** solo necesita `allowPlannedJobs`. Para un usuario sin `allowScheduledJobs`, planifica una ejecución **como ese
> usuario**: el servidor comprueba que el usuario puede ejecutar el formulario, y el trabajo se ejecuta como él, a su nombre, cuando llega su hora
> (consulta [Ejecuciones planificadas](#planned-runs)).

---

## Programar un formulario

Rellena el formulario, abre el desplegable junto a **Enviar** y elige una de las acciones de programación.

- **Programación (recurrente)** abre **Crear programación**: introduce un **Nombre** y una **Expresión Cron** (la predeterminada, `0 0 * * *`,
  se ejecuta cada día a medianoche), y luego selecciona **Crear programación**.
- **Ejecutar más tarde (una sola vez)** abre **Ejecutar más tarde**: introduce un **Nombre** y elige la fecha y hora de **Ejecutar en**, y luego selecciona
  **Programar trabajo**.

El nombre debe ser único entre todas las programaciones. La programación guarda el nombre del formulario y una copia de las extravars que el formulario produjo
en ese momento, escrita en YAML; cada ejecución usa esa copia, así que edítala en la página **Programaciones** para cambiar lo que recibe el trabajo.

![Programaciones](../assets/screenshots/schedules.jpg)

---

## La página Programaciones

La página **Programaciones** lista todas las programaciones, con su columna **Activado** desde 7.3.0, y necesita `allowScheduledJobs`. El menú de cada fila ofrece:

| Acción | Qué hace |
|---|---|
| **Editar** | Cambia el nombre, el tipo, la expresión cron o la hora de ejecución, el formulario y las variables extra |
| **Ejecutar ahora** | Ejecuta la programación ahora, sin esperar a su expresión cron ni a su hora de ejecución |
| **Activar** o **Desactivar** | Activa o desactiva la programación, según corresponda, como muestra su columna **Activado** (desde 7.3.0) |
| **Eliminar** | Elimina la programación; deja de ejecutarse al instante |
| **Última salida** | En la página de la programación, lo que informó la última ejecución, como el número del trabajo que inició |

Aquí también se puede crear una programación desde cero. Elige el **Formulario**, y después marca **Ejecución única** y define
**Ejecutar en**, o déjalo sin marcar y define un **Cron**. **Variables extra** es YAML sin formulario que lo rellene, así que añade tú mismo los
valores que necesita el playbook, como un diccionario (pares clave: valor).

El campo **Cron** es un editor de cron: describe la expresión con palabras, ofrece valores predefinidos y muestra las próximas
ejecuciones. El servidor rechaza una expresión que no puede ejecutar, o una que nunca puede darse.

Desde 7.3.0 cada programación tiene un interruptor **Activado**, para pausarla sin eliminarla. Una programación desactivada sigue en la página
con su configuración, pero no se ejecuta por sí sola: una recurrente se salta sus disparos de cron, y una de una sola vez espera más allá de su
**Ejecutar en** hasta que se vuelve a activar. **Ejecutar ahora** sigue ejecutándola a demanda. Una programación nueva está activada, y las programaciones
que existían antes de 7.3.0 quedan activadas tras la actualización.

---

## Expresiones cron y zona horaria

Una programación recurrente admite una expresión cron estándar de 5 campos: minuto, hora, día del mes, mes y día de la semana.

| Expresión | Se ejecuta |
|---|---|
| `*/15 * * * *` | Cada 15 minutos |
| `0 2 * * *` | Cada día a las 02:00 |
| `30 7 * * 1-5` | De lunes a viernes a las 07:30 |
| `0 0 1 * *` | A medianoche del primer día de cada mes |

Hay más ejemplos, y las funciones de cron que el editor no acepta, en las preguntas frecuentes, en
[¿Qué expresiones cron puedo usar?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Las programaciones cron se ejecutan en la zona horaria del servidor, definida con [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (por defecto `UTC`),
> no en la zona horaria de tu perfil ni de tu navegador. El editor de cron muestra las próximas ejecuciones en esa misma zona.

---

## Cómo se ejecuta una programación

Cuando le toca a una programación, se pone en cola, y el servidor inicia las programaciones en cola de una en una, revisando la cola cada 10 segundos.

- Las programaciones **recurrentes** se saltan un disparo mientras la ejecución anterior sigue en cola o en ejecución, así que las ejecuciones nunca se solapan.
- Las programaciones **de una sola vez** se ejecutan en el minuto siguiente a **Ejecutar en**, y después se eliminan, también cuando se inician con **Ejecutar ahora**.
- **Estado** es `success` cuando el trabajo se inició y `failed` cuando no se pudo. Un `success` solo indica que el trabajo se
  lanzó: abre el trabajo para ver cómo terminó.

Una programación creada con `allowScheduledJobs` se ejecuta como el usuario integrado `Schedule Service` (tipo `schedule`) con el
rol `admin`. Puede ejecutar cualquier formulario, sea cual sea el acceso de la persona que creó la programación, y `ansibleforms_user` en
sus extravars describe a ese usuario. Una [ejecución planificada](#planned-runs) se ejecuta en cambio como el usuario que la planificó.

El trabajo recibe además un objeto `schedule` (con su `id`, `name` y `form`), para que un playbook sepa que lo inició una programación:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  form: Cleanup servers
```

---

## Ejecuciones planificadas

**Ejecutar más tarde (una sola vez)** por parte de un usuario sin `allowScheduledJobs` crea una ejecución planificada: una programación de una sola vez ligada a ese usuario.

- **Al planificarla**, el servidor comprueba que el usuario puede ejecutar el formulario (sus `roles`), y el modo detallado necesita
  `allowVerboseMode`. Una ejecución planificada es siempre de una sola vez; una expresión cron se rechaza.
- **Con la validación del lanzamiento en `enforce`**, los valores de los campos se comprueban al planificarla, así que una ejecución que se rechazaría se
  rechaza mientras el usuario aún está mirando.
- **Al ejecutarse**, el trabajo se ejecuta como ese usuario, a su nombre, pasando por las mismas comprobaciones que un lanzamiento desde el navegador: los
  roles del formulario tal como estén entonces, las extravars reservadas eliminadas, y la validación del lanzamiento. `ansibleforms_user` lo describe.

Quien la planifica no ve la página **Programaciones**, que necesita `allowScheduledJobs`; el trabajo aparece en su propio historial de trabajos.

---

## Cuando el formulario cambia

Una programación se refiere a su formulario por el nombre y lo ejecuta tal como esté definido en el momento de cada ejecución.

- **Se edita el formulario**: la siguiente ejecución usa la nueva definición (playbook, plantilla, inventario) con las extravars guardadas en
  la programación. El formulario no se renderiza, así que no se recalcula ningún campo; edita las variables extra de la programación para que coincidan.
- **Se renombra o se elimina el formulario**: la ejecución falla, **Estado** pasa a `failed` y **Última salida** muestra
  `Failed to launch : No such form '<name>'`. Edita la programación y elige el formulario correcto, o elimínala.

---

## Trabajos programados en el historial de trabajos

Cada ejecución de una programación crea un trabajo normal, listado en la página [Trabajos](./) con `Schedule Service` como usuario o,
en una ejecución planificada, con el usuario que la planificó.

Un trabajo de `Schedule Service` no pertenece a la persona que creó la programación, así que solo lo ven los administradores y los
usuarios con `showAllJobLogs`; el trabajo de una ejecución planificada también lo ve su usuario. La **Última salida** de la programación nombra el trabajo que inició, para que puedas encontrarlo en la lista.
