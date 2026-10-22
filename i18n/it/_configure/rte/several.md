---
layout: default
title: Più RTE
parent: RTE
nav_order: 4
translated_from: 06592303233da78436fcc2765588aec6c88bc045
---

# Più RTE
{: .no_toc }

Quanti playbook esegue un RTE, altri RTE come runner o repliche, e cosa succede quando uno si ferma o muore
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Più job su un RTE

Un RTE esegue fino a [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbook in parallelo, 10 per
impostazione predefinita (`0` non imposta alcun limite). Un job per un RTE pieno non viene preso in carico. In una modalità socket l'app non lo invia finché l'ultimo
rapporto di salute dell'RTE non mostra uno slot libero, e un RTE pieno o in arresto risponde `refused` perché occupato; in modalità database l'RTE risponde
`503`. In entrambi i casi l'app scrive `Waiting for a free slot on RTE <name>` una volta nell'output e ripropone il job ogni 10 secondi,
per al massimo [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) (60 per impostazione predefinita). Poi il job fallisce con
*the RTE '&lt;name&gt;' stayed busy for 60 minutes (RTE_QUEUE_MINUTES)*. Un job interrotto mentre attende termina `aborted` senza mai
raggiungere l'RTE.

---

## Più RTE

L'app non distribuisce da sola i job sui runner: ogni job va a un solo runner, quello che il modulo indica o il
predefinito. Più container RTE aiutano in due modi:

* **Come runner propri** : ogni RTE ha il suo `RTE_NAME` e si unisce come runner proprio: chiede di unirsi e un admin
  lo approva, oppure presenta un join token (vedi [Registrazione](../runners/registration.html)). Un modulo ne sceglie uno con `runner: <name>`,
  per esempio un RTE con le collection VMware, o uno in un'altra zona di rete; gli altri girano sull'RTE predefinito
* **Come repliche dietro un solo indirizzo** (solo modalità database) : più container RTE con lo stesso `RTE_URL` e lo stesso `RTE_TOKEN`,
  come i pod dietro un Service di Kubernetes, condividono un runner, e l'indirizzo distribuisce le chiamate tra di loro. Una replica piena risponde
  `503`, e il tentativo successivo può finire su un'altra. L'app segue un job tramite il database, quindi non importa quale replica
  risponda alle sue chiamate di stato

In una modalità socket (vedi [Modalità](modes.html)) un runner tiene un socket verso un RTE, e un secondo RTE che accede con lo stesso
`RTE_NAME` prende il socket al primo. Dai a ogni RTE un nome e un runner propri, e lascia che i moduli scelgano tra di loro con
`runner:`.

Ogni RTE in modalità database scrive un heartbeat nel database ogni 10 secondi, e uno che si registra da solo controlla la sua riga di runner ogni
30 secondi. Per un RTE in una modalità socket, il nodo dell'app che detiene il suo socket scrive l'heartbeat per lui ogni 20 secondi, finché il
socket è aperto. La pagina **Stato** elenca ogni RTE con la sua versione. Il worker rimuove un runner che un RTE in modalità database ha registrato
da solo quando quell'RTE non scrive un heartbeat da 10 minuti, e quando il runner predefinito è una riga del genere il cui RTE si è fermato, il successivo RTE
che controlla prende il ruolo di predefinito. Un runner del config seed, aggiunto a mano o unito tramite un socket non viene mai rimosso in quel modo.

---

## Quando un RTE si ferma o muore

**Quando un RTE si ferma.** Con `SIGTERM` (`docker stop`, un rolling update, uno scale down) l'RTE smette di accettare job: `/ready` risponde `503`,
e un nuovo job viene rifiutato perché occupato (`503` in modalità database), quindi l'app attende, oppure in modalità database l'indirizzo lo manda a un'altra
replica. I playbook in esecuzione hanno [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) per finire, 25 per impostazione predefinita,
poi l'RTE esce.

**Quando un RTE muore.** Un container ucciso (memoria esaurita, un nodo perso, la fine del timeout di arresto) si porta via i suoi playbook: niente
li sposta su un altro RTE, e niente li riesegue. I loro job vengono terminati come `abandoned`, dall'RTE stesso o dall'app quando
torna con lo stesso id, che un container riavviato mantiene (`rte-<hostname>-<port>`), o dal worker, quando l'heartbeat dell'RTE
ha due minuti. Verifica sugli host gestiti cosa ha fatto il playbook prima di avviarlo di nuovo.

**Mentre un RTE è giù.** In una modalità socket un nuovo job per lui attende il suo socket, fino a `RTE_QUEUE_MINUTES` più un minuto, poi
fallisce con *no app node holds a socket to RTE '&lt;name&gt;' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?*.
In modalità database fallisce subito con *the RTE at ... is unreachable*, a meno che un'altra replica non risponda al suo indirizzo.
