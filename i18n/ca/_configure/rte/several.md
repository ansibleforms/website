---
layout: default
title: Diversos RTE
parent: RTE
nav_order: 4
translated_from: 06592303233da78436fcc2765588aec6c88bc045
---

# Diversos RTE
{: .no_toc }

Quants playbooks executa un RTE, més RTE com a runners o rèpliques, i què passa quan un s'atura o mor
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Diverses tasques en un RTE

Un RTE executa fins a [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks en paral·lel, 10 per
defecte (`0` no posa cap límit). Una tasca per a un RTE ple no es reclama. En un mode de sòcol l'aplicació no l'envia mentre el darrer
informe de salut de l'RTE no mostri cap espai lliure, i un RTE ple o que s'està aturant respon `refused` com a ocupat; en mode base de dades l'RTE respon
`503`. En tots dos casos l'aplicació escriu `Waiting for a free slot on RTE <name>` una vegada a la sortida i torna a oferir la tasca cada 10 segons,
durant [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) com a màxim (60 per defecte). Llavors la tasca falla amb
*the RTE '&lt;name&gt;' stayed busy for 60 minutes (RTE_QUEUE_MINUTES)*. Una tasca avortada mentre espera acaba `aborted` sense arribar mai
a l'RTE.

---

## Diversos RTE

L'aplicació no reparteix tota sola les tasques entre els runners: cada tasca va a un runner, el que nomena el formulari o el
predeterminat. Més contenidors RTE ajuden de dues maneres:

* **Com a runners propis** : cada RTE té el seu propi `RTE_NAME` i s'uneix com a runner propi: demana unir-se i un admin
  l'aprova, o presenta un token d'unió (vegeu [Registre](../runners/registration.html)). Un formulari en tria un amb `runner: <name>`,
  per exemple un RTE amb les col·leccions de VMware, o un en una altra zona de xarxa; els altres s'executen a l'RTE predeterminat
* **Com a rèpliques darrere d'una adreça** (només en mode base de dades) : diversos contenidors RTE amb el mateix `RTE_URL` i el mateix `RTE_TOKEN`,
  com ara els pods darrere d'un Service de Kubernetes, comparteixen un runner, i l'adreça reparteix les crides entre ells. Una rèplica plena respon
  `503`, i el següent intent pot anar a parar a una altra. L'aplicació segueix una tasca a través de la base de dades, així que no importa quina rèplica
  respon a les seves crides d'estat

En un mode de sòcol (vegeu [Modes](modes.html)) un runner té un sòcol amb un RTE, i un segon RTE que inicia sessió amb el mateix
`RTE_NAME` pren el sòcol al primer. Dona a cada RTE un nom i un runner propis, i deixa que els formularis triïn entre ells amb
`runner:`.

Cada RTE en mode base de dades escriu un heartbeat a la base de dades cada 10 segons, i un que es registra ell mateix comprova la seva fila de runner cada
30 segons. Per a un RTE en un mode de sòcol, el node d'aplicació que té el seu sòcol hi escriu el heartbeat cada 20 segons, mentre el
sòcol està obert. La pàgina **Estat** llista tots els RTE amb la seva versió. El worker elimina un runner que un RTE en mode base de dades ha registrat
ell mateix quan aquest RTE fa 10 minuts que no escriu cap heartbeat, i quan el runner predeterminat és una fila d'aquestes l'RTE de la qual s'ha aturat, el següent RTE
que fa la comprovació passa a ser el predeterminat. Un runner de la llavor de configuració, afegit a mà o unit per un sòcol no s'elimina mai d'aquesta manera.

---

## Quan un RTE s'atura o mor

**Quan un RTE s'atura.** Amb `SIGTERM` (`docker stop`, una actualització progressiva, una reducció d'escala) l'RTE deixa d'acceptar tasques: `/ready` respon `503`,
i una tasca nova es rebutja com a ocupat (`503` en mode base de dades), de manera que l'aplicació espera, o en mode base de dades l'adreça l'envia a una altra
rèplica. Els playbooks en execució tenen [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) per acabar, 25 per defecte,
i després l'RTE surt.

**Quan un RTE mor.** Un contenidor que es mata (sense memòria, un node perdut, el final del temps d'aturada) s'emporta els seus playbooks: res no
els passa a un altre RTE, i res no els torna a executar. Les seves tasques s'acaben com a `abandoned`, per part del mateix RTE o de l'aplicació quan
torna amb el mateix id, que un contenidor reiniciat conserva (`rte-<hostname>-<port>`), o per part del worker, quan el heartbeat de l'RTE
té dos minuts. Comprova als hosts gestionats què ha fet el playbook abans de tornar-lo a llançar.

**Mentre un RTE no funciona.** En un mode de sòcol una tasca nova per a aquest RTE espera el seu sòcol, fins a `RTE_QUEUE_MINUTES` i un minut més, i després
falla amb *no app node holds a socket to RTE '&lt;name&gt;' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?*.
En mode base de dades falla a l'instant amb *the RTE at ... is unreachable*, tret que una altra rèplica respongui a la seva adreça.
