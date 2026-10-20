---
layout: default
title: Eventos en directo
parent: API REST
nav_order: 4
translated_from: 2dcfc48df93271c0e13e05c67682a3b02e6e7e97
---

# Eventos en directo
{: .no_toc }

Entérate de cuándo cambian los trabajos y los ajustes, en lugar de consultar periódicamente
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

El servidor avisa a sus clientes de lo que cambia, en el momento en que cambia. Un script también puede escuchar, en lugar de leer un trabajo cada pocos segundos.

---

## El stream

`GET /api/v2/events` es un stream de [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
que se mantiene abierto. Cualquier usuario que haya iniciado sesión puede abrirlo, con el bearer token habitual:

```bash
curl -N https://af.example.com/api/v2/events -H "Authorization: Bearer <token>"
```

Cuando algo cambia, envía un evento `changed` con el nombre de lo que ha cambiado:

```text
event: changed
data: {"name":"jobs"}
```

---

## Nombres de evento

Un evento solo lleva un nombre, nunca datos, así que no revela nada que el usuario no pueda ver. Se envían estos nombres:

| Nombre | Qué ha cambiado |
|---|---|
| `jobs` | Un trabajo: lanzado, su estado o su salida, eliminado |
| `appearance` | Los ajustes que muestra la cabecera: el tema, el nombre, un anuncio, una variable de entorno |
| `designer` | Un bloqueo del diseñador, tomado o liberado |
| `runners` | Un runner (desde la 7.3.0): un RTE se ha conectado o desconectado, ha pedido unirse, ha sido aprobado o rechazado, o ha cambiado su modo o sus ajustes |

Al recibir un nombre, vuelve a leer lo que muestras a través de la API normal (por ejemplo `GET /api/v2/job/42`), con tus propios
permisos. Un nombre con mucha actividad se envía como máximo una vez por segundo.

---

## Mantenerlo abierto

El stream está hecho para sobrevivir a proxies y balanceadores de carga, y un cliente se vuelve a conectar por sí solo:

* Al conectarse, el servidor envía un evento `hello` y pide al cliente que espere 3 segundos antes de volver a conectarse.
* Cada 15 segundos envía una línea de comentario (`: ping`), para que no se cierre una conexión inactiva. Ignora las líneas que empiezan por `:`.
* Los eventos de todos los nodos de la aplicación llegan a todos los streams, sea cual sea el nodo al que está conectado el cliente.
* Tras volver a conectarte, vuelve a leer lo que muestras: un evento enviado mientras el stream estaba caído no se vuelve a enviar.

---

## Salud y métricas

Las sondas de liveness y readiness (`/api/v2/live`, `/api/v2/ready`) y las métricas de Prometheus (`/api/v2/metrics`) están
pensadas para herramientas de monitorización más que para scripts que actúan como un usuario. Consulta [Monitorización](../production/monitoring.html).
