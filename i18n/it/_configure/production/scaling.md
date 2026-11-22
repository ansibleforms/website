---
layout: default
title: Scalabilità
parent: In produzione
nav_order: 4
translated_from: f959b538c659c1c6f9b7fadebd5ed2277a0f444d
---

# Scalabilità
{: .no_toc }

AnsibleForms suddiviso su più nodi del controller e un worker, accanto a uno o più RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Ruoli

Ogni container di AnsibleForms esegue lo stesso codice server, e [`AF_ROLE`](../customization/server.html#env_AF_ROLE) decide cosa fa:

| `AF_ROLE` | Immagine | Esegue | Quanti |
|---|---|---|---|
| `all` (non impostato) | `ansibleforms` | L'interfaccia web e l'API del controller, e il worker, in un solo processo: il predefinito | 1 |
| `controller` | `ansibleforms` | L'interfaccia web e l'API | Quanti ne vuoi, dietro un load balancer |
| `worker` | `ansibleforms` | Il lavoro in background: lo schema del database e i suoi aggiornamenti, il config seed, le pianificazioni, il backup notturno, le sincronizzazioni dei repository e le pulizie | Uno al lavoro; gli altri attendono e subentrano |
| `rte` | `ansibleforms-rte-full` (o `-rte-core`, `-rte-base`) | I playbook | Quanti ne vuoi |

L'installazione più piccola è un container senza `AF_ROLE` accanto a un RTE: è ciò che eseguono il [progetto Docker Compose](../installation/docker-compose.html)
e il [chart Helm](../installation/kubernetes.html). Qualsiasi altro valore di `AF_ROLE` ferma il processo all'avvio.

Fino alla 7.7, il ruolo `controller` si chiamava `app`. Dalla 7.8.0 `AF_ROLE=app` è deprecato e verrà rimosso nella 8.0: gira ancora come
`controller`, con un avviso nel log all'avvio, e il nodo mantiene il suo nome `app-`, così ritrova i propri job dopo l'aggiornamento.

---

## L'RTE

L'RTE, l'ambiente di esecuzione che esegue i playbook, ha una sezione propria: [Ambienti di esecuzione](../rte/). Tratta come un RTE
esegue un job, [le sue immagini](../rte/images.html), [come eseguirne uno](../rte/run.html), [più RTE](../rte/several.html) come runner o
repliche, e [un RTE in un altro datacenter](../rte/another-datacenter.html).

---

## Più nodi del controller

Per servire più utenti, o per sopravvivere alla perdita di un nodo, suddividi AnsibleForms in nodi `controller` dietro un load balancer e un `worker`.

### Cosa condividono i nodi
{: .no_toc }

I nodi si coordinano tra loro tramite il database e un volume condiviso:

* **Il database** : i job, il blocco del worker, il blocco del designer, la lista dei nodi, i lease dei runner (quale nodo del controller detiene il
  socket di ogni RTE) e gli avvisi di modifica che mantengono aggiornate le cache di ogni nodo. Una credenziale, un runner o una pianificazione modificati
  su un nodo sono in vigore su tutti entro 5 secondi
* **Il volume persistente** (`/app/dist/persistent`) : moduli, la configurazione, repository, caricamenti, backup e il `.env` gestito.
  Ogni nodo del controller e il worker montano lo stesso, in lettura e scrittura
* **La cartella ssh** (`/home/node/.ssh`) : la chiave e i known hosts per git su ssh; il worker crea la chiave al suo primo avvio
* **[`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET)** : lo stesso su ogni nodo del controller, altrimenti un token firmato
  da un nodo viene rifiutato dal successivo. Un nodo del controller si rifiuta di partire senza
* **[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET)** : lo stesso su ogni nodo del controller e worker, altrimenti una
  credenziale salvata da uno non può essere letta da un altro. Un RTE in modalità socket non lo legge mai; ne ha bisogno solo un RTE deprecato in modalità database
  che si registra da solo

Dai anche a ogni container lo stesso utente del database: un worker in attesa può terminare la sessione di uno morto solo quando è la propria.

### Il blocco del worker
{: .no_toc }

Lavora un solo worker alla volta. Detiene il lock del database `ansibleforms_worker`; quando si ferma, il database rilascia il lock e un
worker in attesa lo prende entro 10 secondi. Quando l'host del worker muore senza salutare, il database potrebbe tenere il lock per ore,
quindi un worker in attesa termina quella sessione quando nessun worker ha scritto un heartbeat da due minuti, e subentra.

Un worker che perde il lock a favore di un altro si ferma, e il suo container si riavvia come quello in attesa. Anche un worker il cui avvio non riesce si
ferma, così non detiene mai il lock senza fare nulla. Galera e la group replication non condividono il lock tra i nodi del database: punta ogni
worker allo stesso nodo del database.

### Job e nodi
{: .no_toc }

Ogni container si chiama `<role>-<hostname>-<port>`, senza niente da impostare, e la pagina **Stato** li elenca tutti con il loro ruolo
e la versione, quale è il worker, e un avviso quando eseguono versioni diverse.

Un job in esecuzione su un RTE appartiene a quell'RTE, e prosegue quando il nodo del controller che lo ha avviato se ne va. Qualsiasi altro job (un job template
su AWX o un altro runner, un job di workflow, o i passaggi di un modulo multistep deprecato) appartiene al nodo del controller che lo ha avviato. Un container che si riavvia termina i propri job non finiti, e il
worker termina i job di un container che ha smesso di rispondere da due minuti, come un pod sostituito.

Un `SIGHUP` inviato a qualsiasi nodo riapplica il [config seed](../seed/): un nodo del controller chiede al worker di farlo.

### Aggiornamento
{: .no_toc }

Aggiorna **prima il worker**, poi i nodi del controller. Il worker applica le patch allo schema, e un nodo del controller della nuova versione attende finché lo
schema non è aggiornato e registra cosa sta aspettando. I nodi del controller aggiornati per primi restano non pronti finché il worker non li segue, mentre quelli vecchi continuano
a servire. Gli RTE possono seguire in qualsiasi momento, purché parlino lo stesso contratto.

### Limiti
{: .no_toc }

Alcune cose restano legate a un solo nodo:

* **L'assistente chat** tiene le sue conversazioni nella memoria di un nodo del controller: usa le sticky session sul load balancer (nginx
  `ip_hash`), o un solo nodo del controller
* **I log** restano in ogni container. Imposta [`LOG_PATH`](../customization/logging.html#env_LOG_PATH) fuori dal volume condiviso, perché più
  processi che ruotano lo stesso file perdono righe. Il visualizzatore dei log mostra il log del nodo che risponde, quindi raccogli i log in modo centralizzato
* **Le impostazioni** modificate nelle pagine delle impostazioni vengono scritte nel `.env` gestito sul volume condiviso e si applicano su ogni nodo; quelle
  che richiedono un riavvio lo richiedono su ogni nodo

---

## Esempio di architettura

Il repository dell'app ha un punto di partenza completo in [examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale):

| Servizio | Immagine | Ruolo |
|---|---|---|
| `db` | `mariadb:11` | Il database, con un utente che ha diritti solo sullo schema `AnsibleForms` |
| `controller1`, `controller2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=controller`, dietro il load balancer |
| `worker1`, `worker2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=worker`: il secondo attende e subentra |
| `rte` | `ghcr.io/ansibleforms/ansibleforms-rte-full:7` | Esegue i playbook con `RTE_MODE=inbound` e `RTE_FILES=local`: il controller lo contatta |
| `lb` | `nginx:stable` | Termina l'HTTPS sulla porta 8443 e distribuisce i browser sui nodi del controller con `ip_hash` |

Il runner `rte` dell'RTE e la credenziale con cui accede (il suo indirizzo `http://rte:8000` e `RTE_TOKEN`) sono dichiarati nel
[config seed](../seed/) `seed.yaml`, che il worker applica a ogni avvio; l'RTE non imposta nessun `RTE_URL` e non è pubblicato sull'host.

I nodi del controller e i worker condividono un solo `.env`, con l'utente del database, `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET`, `RTE_TOKEN`,
`CONFIG_SEED_PATH`, `HTTPS=0` dietro il load balancer e un `LOG_PATH` fuori dal volume condiviso. L'RTE non ha `env_file`: riceve
solo `RTE_TOKEN` da `compose.yaml`, quindi non contiene nessuna password del database. I nodi del controller, i worker e l'RTE montano gli stessi
volumi persistent e ssh:

```bash
cp .env.example .env   # and fill in the secrets
docker compose up -d   # then https://localhost:8443
```
