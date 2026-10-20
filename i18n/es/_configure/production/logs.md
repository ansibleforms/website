---
layout: default
title: Logs
parent: En producción
nav_order: 3
translated_from: 17d3894c528610d4916fbdcf4beb5bbbacd2b266
---

# Logs
{: .no_toc }

Archivos de log, syslog, el registro de auditoría y cuánto tiempo se conservan los trabajos y las entradas de auditoría
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Archivos de log

AnsibleForms escribe dos logs con rotación diaria en [`LOG_PATH`](../customization/logging.html#env_LOG_PATH)
(`%PERSISTENT_FOLDER%/logs`), comprime los días anteriores y los conserva durante [`LOG_RETENTION_DAYS`](../customization/logging.html#env_LOG_RETENTION_DAYS)
(30 por defecto, `0` conserva todos los archivos; un cambio en la página de configuración se aplica al momento):

* `ansibleforms.<date>.log` : todo lo que tenga nivel [`LOG_LEVEL`](../customization/logging.html#env_LOG_LEVEL) o superior
* `ansibleforms.errors.<date>.log` : solo los errores

La consola, que se lee con `docker logs` o `kubectl logs`, tiene su propio nivel,
[`LOG_CONSOLE_LEVEL`](../customization/logging.html#env_LOG_CONSOLE_LEVEL). Ambos valen `notice` por defecto, lo adecuado para
producción; usa `info` o `debug` solo mientras investigas un problema, y deja
[`ENABLE_DB_QUERY_LOGGING`](../customization/features.html#env_ENABLE_DB_QUERY_LOGGING) desactivado. Los niveles se pueden cambiar en
las páginas de configuración sin reiniciar, y la página **Registro del servidor** muestra el log a los usuarios con la opción `showLogs`.

---

## Líneas JSON

Para un recolector de logs como Loki, ELK o Splunk, pon [`LOG_FORMAT`](../customization/logging.html#env_LOG_FORMAT) a `json`. Cada
línea, en la consola y en los archivos, pasa a ser un objeto JSON en lugar de `<time> <level>: <message>`:

```json
{"time":"2026-10-12T08:15:02.113Z","level":"notice","message":"App running on port 8000!","role":"all","host":"forms01"}
```

| Campo | Contenido |
|-------|---------|
| `time` | La hora, en ISO 8601 UTC |
| `level` | El nivel de log |
| `message` | El mensaje |
| `requestId` | La petición a la que pertenece la línea, cuando se escribió mientras se atendía una |
| `role` | El rol del proceso, [`AF_ROLE`](scaling.html), o `all` cuando no está definido |
| `host` | El nombre de host de la máquina o del contenedor en el que se ejecuta el proceso |

Cada petición recibe un id: la cabecera `X-Request-Id` que envió un proxy inverso, o uno nuevo. Se devuelve en la cabecera
`X-Request-Id` de la respuesta y lo lleva cada línea escrita mientras se atiende la petición (como `[req <id>]` en las líneas de texto),
así que una petición se puede seguir por el log y cotejar con el del proxy. Un cambio en la página de configuración se aplica al momento.

---

## Syslog

Los servidores syslog se gestionan en **Configuración > Conexiones > Syslog**, para que un servidor syslog o un SIEM reciba el log a medida que se escribe.
Puedes añadir varios servidores, y cada uno tiene sus propios ajustes:

| Ajuste | Qué hace |
|---------|--------------|
| Activado | Solo los servidores activados reciben algo, así que un servidor se puede pausar sin eliminarlo; **Activar** y **Desactivar** en el menú de su fila también lo cambian |
| Protocolo | `udp4` (predeterminado), `udp6`, `tcp4`, `tcp6`, `tls4`, `tls6`, `unix` o `unix-connect` |
| Host y puerto | El servidor al que enviar, puerto `514` por defecto; un protocolo `unix` usa en su lugar la ruta de un socket |
| Recibe | El log del servidor, las entradas de auditoría o ambos (lo predeterminado para un servidor nuevo) |
| Nivel | El nivel más bajo del log del servidor que recibe, `info` por defecto; las entradas de auditoría se envían siempre |
| Formato | `BSD` (RFC 3164, el predeterminado) o `RFC 5424` |

Un cambio se aplica en todos los nodos sin reiniciar, y la página del servidor tiene un botón que le envía un mensaje de prueba.
Un servidor inalcanzable nunca detiene la aplicación: el error se escribe en la consola.

Desde la 7.3.0 los servidores syslog requieren todos los permisos de configuración, la opción de rol [`showSettings`](../config/roles.html#role-options):
el acceso solo a la configuración de conexiones no basta, ya que un servidor syslog recibe el log del servidor y las entradas de auditoría.

Las variables `LOG_SYSLOG_*` de versiones anteriores están obsoletas desde la 7. El primer arranque que encuentra
[`LOG_SYSLOG_HOST`](../customization/logging.html#env_LOG_SYSLOG_HOST) definida las importa una vez como el servidor `syslog`,
que recibe el log del servidor como antes, y a partir de ahí las ignora. Quítalas del entorno tras ese primer
arranque, y gestiona el servidor en la página de configuración.

---

## Registro de auditoría

La página **Registro de auditoría** (en **Configuración > Registros**) guarda quién cambió qué, algo que los archivos de log no responden bien.
Registra:

* cada cambio hecho a través de la API (`POST`, `PUT`, `PATCH`, `DELETE`), incluidos los intentos rechazados con 401 o 403
* los inicios de sesión, con el nombre de usuario que se intentó
* los eventos de la propia aplicación, como las copias nocturnas, las copias eliminadas, los trabajos purgados y las aplicaciones de la semilla de configuración

Cada entrada tiene su hora, el actor (un usuario, o la propia aplicación para sus tareas), la dirección IP del cliente,
la acción, su objetivo y su resultado: `success`, `failure` o `denied`. La página filtra por actor, acción y
resultado, y la pueden abrir los usuarios con la opción de rol `showSettings`.

La dirección IP es la que ve AnsibleForms, que es la del proxy cuando funciona detrás de uno. Pon
[`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) al número o a las direcciones de tus proxies, y AnsibleForms
registrará en su lugar la dirección del cliente que el proxy indica en `X-Forwarded-For`; consulta [Proxy inverso](reverse-proxy.html).

Para conservar el registro de auditoría fuera de la instancia, para un SIEM, añade un servidor syslog que reciba las entradas de auditoría (consulta
[Syslog](#syslog)). Cada entrada se envía en cuanto ocurre, como una línea `audit {...}` con la entrada en JSON, sea cual sea el
nivel del servidor. La copia de syslog no la elimina la retención de abajo, ni la sustituye una restauración de la base de datos.

---

## Retención

Dos tareas diarias con un ajuste evitan que la base de datos crezca sin límite:

| Variable | Valor predeterminado | Se ejecuta a las | Elimina |
|----------|---------|---------|---------|
| [`AUDIT_RETENTION_DAYS`](../customization/retention.html#env_AUDIT_RETENTION_DAYS) | `365` | 3:30 | Las entradas de auditoría más antiguas que esto |
| [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) | `0` (conservar todo) | 2:30 | Los trabajos terminados más antiguos que esto, con su salida |

`0` lo conserva todo en ambos casos. Otras dos tareas diarias no tienen ajuste: a las 3:00 se eliminan los refresh tokens guardados de más de 30 días y
las revocaciones de tokens caducadas, y a las 4:00 los [trabajos almacenados](../jobs/stored-jobs.html) cuya caducidad ha pasado.
Las horas están en la zona horaria de [`LOG_TZ`](../customization/logging.html#env_LOG_TZ), y las ejecuta el worker.

La salida de los trabajos suele ser la tabla que más rápido crece: la página **Estado** informa de su tamaño
y avisa cuando supera 1 GB sin retención definida. Los trabajos en ejecución y los que esperan aprobación nunca se eliminan.
Decide una retención de trabajos acorde con tus requisitos de auditoría, y conserva el registro de auditoría al menos el mismo tiempo.
