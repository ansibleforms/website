---
layout: default
title: Varios RTE
parent: RTE
nav_order: 4
translated_from: 06592303233da78436fcc2765588aec6c88bc045
---

# Varios RTE
{: .no_toc }

Cuántos playbooks ejecuta un RTE, más RTE como runners o como réplicas, y qué pasa cuando uno se detiene o muere
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Varios trabajos en un RTE

Un RTE ejecuta hasta [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks en paralelo, 10 por
defecto (`0` no pone límite). Un trabajo para un RTE lleno no se reclama. En un modo de socket la aplicación no lo envía mientras el último
informe de salud del RTE no muestre ningún hueco libre, y un RTE que está lleno o deteniéndose responde `refused` por estar ocupado; en modo base de datos el RTE responde
`503`. En ambos casos la aplicación escribe `Waiting for a free slot on RTE <name>` una vez en la salida y vuelve a ofrecer el trabajo cada 10 segundos,
durante [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) como máximo (60 por defecto). Después el trabajo falla con
*the RTE '&lt;name&gt;' stayed busy for 60 minutes (RTE_QUEUE_MINUTES)*. Un trabajo abortado mientras espera termina `aborted` sin llegar nunca
al RTE.

---

## Varios RTE

La aplicación no reparte los trabajos entre runners por sí sola: cada trabajo va a un runner, el que nombra el formulario o el
predeterminado. Más contenedores RTE ayudan de dos formas:

* **Como runners propios** : cada RTE tiene su propio `RTE_NAME` y se une como runner propio: pide unirse y un admin
  lo aprueba, o presenta un token de unión (consulta [Registro de runners](../runners/registration.html)). Un formulario elige uno con `runner: <name>`,
  por ejemplo un RTE con las colecciones de VMware, o uno en otra zona de red; los demás se ejecutan en el RTE predeterminado
* **Como réplicas tras una misma dirección** (solo en modo base de datos) : varios contenedores RTE con el mismo `RTE_URL` y el mismo `RTE_TOKEN`,
  como los pods tras un Service de Kubernetes, comparten un runner, y la dirección reparte las llamadas entre ellos. Una réplica llena responde
  `503`, y el siguiente intento puede caer en otra. La aplicación sigue un trabajo a través de la base de datos, así que da igual qué réplica
  responda a sus llamadas de estado

En un modo de socket (consulta [Modos](modes.html)) un runner tiene un socket con un único RTE, y un segundo RTE que inicia sesión con el mismo
`RTE_NAME` le quita el socket al primero. Dale a cada RTE un nombre y un runner propios, y deja que los formularios elijan entre ellos con
`runner:`.

Todo RTE en modo base de datos escribe un heartbeat en la base de datos cada 10 segundos, y uno que se registra a sí mismo comprueba su fila de runner cada
30 segundos. Para un RTE en modo de socket, el nodo de la aplicación que tiene su socket escribe el heartbeat por él cada 20 segundos, mientras el
socket está abierto. La página **Estado** lista cada RTE con su versión. El worker elimina un runner que un RTE en modo base de datos registró
él mismo cuando ese RTE lleva 10 minutos sin escribir ningún heartbeat, y cuando el runner predeterminado es una de esas filas cuyo RTE se detuvo, el siguiente RTE
que hace la comprobación toma el predeterminado. Un runner de la semilla de configuración, añadido a mano o unido por un socket nunca se elimina de esa forma.

---

## Cuando un RTE se detiene o muere

**Cuando un RTE se detiene.** Con `SIGTERM` (`docker stop`, una actualización progresiva, una reducción de escala) el RTE deja de aceptar trabajos: `/ready` responde `503`,
y un trabajo nuevo se rechaza por estar ocupado (`503` en modo base de datos), así que la aplicación espera, o en modo base de datos la dirección lo envía a otra
réplica. Los playbooks en ejecución tienen [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) para terminar, 25 por defecto,
y luego el RTE sale.

**Cuando un RTE muere.** Un contenedor matado (sin memoria, un nodo perdido, el fin del tiempo de parada) se lleva sus playbooks con él: nada
los mueve a otro RTE, y nada los vuelve a ejecutar. Sus trabajos se dan por `abandoned`, por el propio RTE o por la aplicación cuando
vuelve con el mismo id, que un contenedor reiniciado conserva (`rte-<hostname>-<port>`), o por el worker, cuando el heartbeat del RTE
tiene dos minutos de antigüedad. Comprueba en los hosts gestionados qué hizo el playbook antes de volver a lanzarlo.

**Mientras un RTE está caído.** En un modo de socket un trabajo nuevo para él espera a su socket, hasta `RTE_QUEUE_MINUTES` y un minuto más, y luego
falla con *no app node holds a socket to RTE '&lt;name&gt;' and it took no trabajo for 60 minutes (RTE_QUEUE_MINUTES): is it connected?*.
En modo base de datos falla al momento con *the RTE at ... is unreachable*, salvo que otra réplica responda en su dirección.
