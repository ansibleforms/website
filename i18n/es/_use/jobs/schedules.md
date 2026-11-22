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
translated_from: 57383a13d04c8157937b3c6caa33ad7af84c93b7
---

# Programaciones
{: .no_toc }

Ejecuta un formulario más tarde, según un cron o una rrule, y gestiona todas las programaciones
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
acciones de programación crean una entrada en **Trabajos > Programados**; **Almacén** crea una entrada en la página **Trabajos almacenados**. La
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
en ese momento, escrita en YAML; cada ejecución usa esa copia, así que edítala en la página de la programación para cambiar lo que recibe el trabajo. Para
temporizarla con una rrule, o darle un fin, abre su página y cambia su pestaña **Programación**.

![Programaciones](../assets/screenshots/schedules.jpg)

---

## La lista de programaciones

**Trabajos > Programados** lista todas las programaciones y necesita `allowScheduledJobs`; una fila abre la página propia de la programación.

| Columna | Muestra |
|---|---|
| **Activado** | Si la programación se ejecuta según su propia temporización |
| **Nombre** y **Formulario** | La programación, y el formulario que ejecuta |
| **Programación** | Su temporización en lenguaje llano, como *At 02:00 AM*; pasa el ratón por encima para ver el cron o la propia regla |
| **Última ejecución** | Cuándo se ejecutó por última vez |
| **Próxima ejecución** | Cuándo se ejecuta la próxima vez, un guion cuando no tiene ninguna ejecución por delante |
| **Estado** | Su último lanzamiento: si inició un trabajo, o **Iniciando…** mientras lanza uno |

La columna **Programación** muestra una programación de una sola vez como **Ejecución única**. Una rrule que el lenguaje llano no
puede describir se muestra tal cual. El menú de cada fila ofrece:

| Acción | Qué hace |
|---|---|
| **Editar** | Abre la página de la programación |
| **Ejecutar ahora** | Ejecuta la programación ahora, sin esperar a su temporización |
| **Activar** o **Desactivar** | Activa o desactiva la programación, según corresponda, como muestra su columna **Activado** |
| **Eliminar** | Elimina la programación; deja de ejecutarse al instante |

**Nueva programación** crea una desde cero, en tres pasos: **Detalles** (su **Nombre**, **Descripción** y **Formulario**),
**Programación** (su temporización y su fin) y **Variables extra**. **Variables extra** es YAML sin formulario que lo rellene, así que añade tú mismo
los valores que necesita el playbook, como un diccionario (pares clave: valor).

---

## La página de una programación

La página de una programación muestra los pasos de su diálogo como pestañas, con **Ejecutar ahora**, **Eliminar** y **Guardar** arriba a la derecha.

| Pestaña | Qué contiene |
|---|---|
| **Detalles** | Su origen, **Nombre**, **Descripción**, **Formulario**, y luego **Último lanzamiento**, **Job iniciado**, **Última ejecución**, **Próxima ejecución** y **Activado** |
| **Programación** | Cómo se temporiza (consulta [Temporizar una programación](#timing-a-schedule)) y cómo termina (consulta [El fin de una programación](#the-end-of-a-schedule)) |
| **Variables extra** | El YAML que recibe el trabajo; para una programación guardada en git, también los prompts de su archivo |
| **Ejecuciones** | Los trabajos que inició, el más reciente primero; una fila abre el trabajo |

**Último lanzamiento** indica cómo fue su último lanzamiento, como un estado: uno fallido dice por qué al pasar el ratón. **Job iniciado**
enlaza con el trabajo que inició, para que puedas abrirlo y ver cómo terminó. La pestaña **Ejecuciones** lista los trabajos que puedes ver, con el usuario
con el que se ejecutaron, su inicio, fin, duración y estado; su número aparece en el título de la pestaña.

El interruptor **Activado** pausa una programación sin eliminarla, y se guarda con **Guardar**, como todos los campos de la página. Una
programación desactivada sigue en la lista con su configuración, pero no se ejecuta por sí sola: una recurrente se salta sus ejecuciones, y una
de una sola vez espera más allá de su momento hasta que se vuelve a activar. **Ejecutar ahora** sigue ejecutándola a demanda. Una programación nueva está activada.

---

## Temporizar una programación

Una programación se temporiza de una de tres formas, elegida en **Tipo de programación** en su pestaña **Programación**; la rrule es nueva en 7.8.0.

| Temporización | Se ejecuta | Consulta |
|---|---|---|
| **Cron** | De forma recurrente, según una expresión cron en la zona horaria del servidor | [Expresiones cron y zona horaria](#cron-expressions-and-time-zone) |
| **Regla de recurrencia (rrule)** | De forma recurrente, según una regla iCal en su propia zona horaria | [Reglas de recurrencia](#recurrence-rules) |
| **Ejecución única** | Una vez, en una fecha y hora | [Cómo se ejecuta una programación](#how-a-schedule-runs) |

Con un cron o una rrule, el editor muestra las tres próximas ejecuciones, y las detiene en el fin de la programación. Cambiar la temporización
conserva solo la elegida: una programación que pasa de un cron a una rrule pierde su cron.

---

## Expresiones cron y zona horaria

Una programación recurrente admite una expresión cron estándar de 5 campos: minuto, hora, día del mes, mes y día de la semana.

| Expresión | Se ejecuta |
|---|---|
| `*/15 * * * *` | Cada 15 minutos |
| `0 2 * * *` | Cada día a las 02:00 |
| `30 7 * * 1-5` | De lunes a viernes a las 07:30 |
| `0 0 1 * *` | A medianoche del primer día de cada mes |

El editor de cron describe la expresión con palabras, ofrece valores predefinidos y muestra las próximas ejecuciones. El servidor rechaza una
expresión que no puede ejecutar, o una que nunca puede darse. Hay más ejemplos, y las funciones de cron que el editor no acepta, en las preguntas
frecuentes, en [¿Qué expresiones cron puedo usar?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Las programaciones cron se ejecutan en la zona horaria del servidor, definida con [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (por defecto `UTC`),
> no en la zona horaria de tu perfil ni de tu navegador. El editor de cron muestra las próximas ejecuciones en esa misma zona.

---

## Reglas de recurrencia

Desde 7.8.0 una programación recurrente puede usar en su lugar una regla de recurrencia iCal (rrule), que se ejecuta en una zona horaria propia.

```text
DTSTART;TZID=Europe/Brussels:20261020T020000 RRULE:FREQ=DAILY;INTERVAL=1
DTSTART:20261019T060000Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO
DTSTART;TZID=America/New_York:20261101T073000 RRULE:FREQ=MONTHLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1
```

La primera se ejecuta cada día a las 02:00 en Bruselas, la segunda cada lunes a las 06:00 UTC, la tercera el último día laborable de
cada mes a las 07:30 en Nueva York. Una regla ocupa una línea, con sus partes separadas por espacios:

| Parte | Qué indica |
|---|---|
| `DTSTART` | La primera ejecución, con un `TZID` (una zona IANA como `Europe/Brussels`, o un desfase como `UTC+5` o `GMT-3`), o en UTC terminada en `Z` |
| `RRULE` | Cuándo se repite: `FREQ` con un `INTERVAL` de al menos 1, y `BYDAY`, `BYHOUR`, `BYMONTHDAY`, `COUNT`, `UNTIL` … según haga falta; una o más |
| `EXRULE` | Opcional: una regla de ejecuciones que se saltan |

El servidor rechaza una regla que no puede ejecutar, y dice por qué:

- ningún `DTSTART`, más de uno, o uno sin zona horaria, y `EXDATE` o `RDATE`;
- una regla sin `INTERVAL`, `FREQ=SECONDLY`, `BYDAY` con un número (`5MO`), o `COUNT` junto con `UNTIL`;
- `COUNT` por encima de 999, un número `BYxxx` fuera de su rango (`BYHOUR` de 0 a 23, `BYSETPOS` de 1 a 366 o de -366 a -1 …), un `WKST`
  que no es un día de la semana, un `DTSTART` o `UNTIL` que no es una fecha real (`20300230`), o una parte dada dos veces en una regla;
- una regla que nunca se dispara: ninguna ejecución en los 50 años siguientes a su `DTSTART`, como `FREQ=HOURLY;INTERVAL=2;BYHOUR=1` desde
  medianoche, que solo alcanza horas pares.

El editor es un cuadro de texto: una rrule nueva empieza como cada día a medianoche en la zona horaria de tu navegador. Dice al instante por qué
se rechazaría una regla, o si no muestra sus tres próximas ejecuciones en la zona horaria de la propia regla, o **Esta rrule no tiene más ejecuciones
por delante.** cuando su `UNTIL` o `COUNT` ya ha pasado. Una hora que un cambio de horario de verano se salta se ejecuta cuando el reloj la alcanza
(las 02:30 se ejecutan a las 03:30 la noche en que el reloj pasa de las 02:00 a las 03:00), igual que un cron; una hora que el reloj muestra dos veces
se ejecuta una vez, en la primera.

---

## El fin de una programación

Desde 7.8.0 una programación temporizada por un cron o una rrule puede terminar; en **Termina**, en su pestaña **Programación**, elige una opción.

| Termina | La programación termina |
|---|---|
| **Nunca** | Nunca: el valor predeterminado, y el de toda programación anterior a 7.8.0 |
| **En una fecha** | En la fecha y hora elegidas: ninguna ejecución después |
| **Tras** … **ejecuciones** | Cuando ha iniciado ese número de trabajos en total, los que lista su pestaña **Ejecuciones**; el campo indica cuántos lleva |

**Al terminar**, se desactiva (**Desactivarla**, el valor predeterminado) o se elimina (**Eliminarla**). La tarea del sistema
**Fin de programaciones** aplica los fines cada minuto, y una programación que alcanza su número de ejecuciones termina justo después de la última. El
propio `UNTIL` o `COUNT` de una rrule sigue aplicándose; el fin se añade a él.

Una programación de una sola vez no tiene fin: termina con su ejecución. Su interruptor **Eliminar tras ejecutarse**, activado por defecto, la elimina tras
su ejecución; desactivado, la programación se desactiva tras su ejecución y se conserva con su resultado.

---

## Cómo se ejecuta una programación

Cuando le toca a una programación, se pone en cola, y el servidor inicia las programaciones en cola de una en una, revisando la cola cada 10 segundos.

- Las programaciones **recurrentes** se saltan una ejecución mientras la anterior sigue en cola o en ejecución, así que las ejecuciones nunca se solapan.
- Las programaciones **de una sola vez** se ejecutan en el minuto siguiente a su momento, y después se eliminan (o se conservan, desactivadas, cuando
  **Eliminar tras ejecutarse** está desactivado), también cuando se inician con **Ejecutar ahora**.
- **Estado** es `success` cuando el trabajo se inició y `failed` cuando no se pudo. Un `success` solo indica que el trabajo se
  lanzó: abre el trabajo para ver cómo terminó.

Una programación creada con `allowScheduledJobs` se ejecuta como el usuario integrado `Schedule Service` (tipo `schedule`) con el
rol `admin`. Puede ejecutar cualquier formulario, sea cual sea el acceso de la persona que creó la programación, y `ansibleforms_user` en
sus extravars describe a ese usuario. Una [ejecución planificada](#planned-runs) se ejecuta en cambio como el usuario que la planificó.

El trabajo recibe además un objeto `schedule`, para que un playbook sepa que lo inició una programación:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  description: ''
  form: Cleanup servers
  one_time_run: null
```

Su `one_time_run` es el momento de la ejecución de una programación de una sola vez, `null` en una recurrente. Lleva también los demás ajustes de
la programación, como `enabled` y `repository`, y `run_at`: el mismo momento con su nombre anterior a 7.8.0 (obsoleto, se elimina en 8).

---

## Ejecuciones planificadas

**Ejecutar más tarde (una sola vez)** por parte de un usuario sin `allowScheduledJobs` crea una ejecución planificada: una programación de una sola vez ligada a ese usuario.

- **Al planificarla**, el servidor comprueba que el usuario puede ejecutar el formulario (sus `roles`), y el modo detallado necesita
  `allowVerboseMode`. Una ejecución planificada es siempre de una sola vez; una expresión cron o una rrule se rechaza.
- **Con la validación del lanzamiento en `enforce`**, los valores de los campos se comprueban al planificarla, así que una ejecución que se rechazaría se
  rechaza mientras el usuario aún está mirando.
- **Al ejecutarse**, el trabajo se ejecuta como ese usuario, a su nombre, pasando por las mismas comprobaciones que un lanzamiento desde el navegador: los
  roles del formulario tal como estén entonces, las extravars reservadas eliminadas, y la validación del lanzamiento. `ansibleforms_user` lo describe.

Quien la planifica no ve **Trabajos > Programados**, que necesita `allowScheduledJobs`; el trabajo aparece en su propio historial de trabajos. Una
ejecución planificada siempre se elimina tras su ejecución.

---

## Cuando el formulario cambia

Una programación se refiere a su formulario por el nombre y lo ejecuta tal como esté definido en el momento de cada ejecución.

- **Se edita el formulario**: la siguiente ejecución usa la nueva definición (playbook, plantilla, inventario) con las extravars guardadas en
  la programación. El formulario no se renderiza, así que no se recalcula ningún campo; edita las variables extra de la programación para que coincidan.
- **Se renombra o se elimina el formulario**: la ejecución falla, **Estado** pasa a `failed` y **Último lanzamiento**, al pasar el ratón, muestra
  `Failed to launch : No such form '<name>'`. Edita la programación y elige el formulario correcto, o elimínala.

---

## Trabajos programados en el historial de trabajos

Cada ejecución de una programación crea un trabajo normal, listado en la página [Trabajos](./) con `Schedule Service` como usuario o,
en una ejecución planificada, con el usuario que la planificó.

Un trabajo de `Schedule Service` no pertenece a la persona que creó la programación, así que solo lo ven los administradores y los
usuarios con `showAllJobLogs`; el trabajo de una ejecución planificada también lo ve su usuario. La pestaña **Ejecuciones** de la programación lista
los trabajos que inició, y su **Job iniciado** enlaza con el último.

---

## Programaciones en un repositorio git

Desde 7.8.0 las programaciones también pueden guardarse en un repositorio git, como entradas de una lista `controller_schedules:` en sus archivos YAML.

Como máximo un repositorio tiene el uso **Programaciones**: sus entradas se leen en **Trabajos > Programados** en cada pull, temporizadas por un
`cron`, una `rrule` o un `one_time_run`, y una programación creada o cambiada en la aplicación se escribe de vuelta en su archivo, a la espera del
push del repositorio. Una programación así muestra su archivo en su página, y su fin solo la desactiva. Consulta
[Repositorios git](../repositories/).

---

## En la API

Desde 7.8.0 una programación de la API tiene tres campos de temporización, con exactamente uno de ellos definido: `cron`, `rrule` o `one_time_run`.

| Campo | Contiene |
|---|---|
| `cron` | Una expresión cron |
| `rrule` | Una regla de recurrencia, en una línea |
| `one_time_run` | El momento de su única ejecución, una hora ISO 8601 con su desfase o `Z` (`2026-11-15T22:00:00+01:00`) |
| `ends`, `end_at`, `end_count`, `end_action` | Su fin: `never`, `date` o `count`, su fecha, su número de ejecuciones, y `disable` o `remove` |
| `remove_after_run` | Una programación de una sola vez: `false` la conserva, desactivada, tras su ejecución |

{: .warning }
> El par que la API aceptaba antes de 7.8.0, `one_time_run: true` con `run_at`, está obsoleto desde 7.8.0 y se elimina en 8. Se
> sigue leyendo como `one_time_run` en ese momento, con un aviso en el log del servidor; `one_time_run: false` con un cron se lee como
> ese cron.
