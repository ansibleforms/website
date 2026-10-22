---
layout: default
title: Installazione
nav_order: 1
has_children: true
has_toc: false
permalink: /installation/
translated_from: c5efb1a569cf31ab6b1817687a024e12c26eb128
---

# Installazione
{: .no_toc }

Scegli un metodo di installazione per AnsibleForms
{: .fs-6 .fw-300 }

---

Per gli amministratori che preparano una nuova istanza: scegli un metodo di installazione, poi segui la sua pagina.

---

## In questa sezione

AnsibleForms supporta diversi metodi di installazione, ognuno descritto nella propria pagina:

| Pagina | Cosa tratta |
|---|---|
| [Installer](installer.html) | Un solo comando che installa un controller o un Runner su Docker, Podman, Kubernetes o in modo nativo, e poi lo aggiorna e ne fa il backup |
| [Nativa](native.html) | L'installazione dell'installer senza container: Node.js, MariaDB e Ansible sul server, AnsibleForms come servizi systemd |
| [Docker](docker.html) | Installa MySQL ed esegui l'immagine Docker precompilata con le variabili d'ambiente necessarie |
| [Docker Compose](docker-compose.html) | Scarica il [progetto docker-compose](https://github.com/ansibleforms/docker) e usa docker-compose per avviare sia MySQL sia AnsibleForms |
| [Dai sorgenti](from-source.html) | Installa a mano tutte le dipendenze, poi compila e avvia il codice |
| [Kubernetes](kubernetes.html) | Installa il chart Helm e usa Kubernetes per avviare AnsibleForms e il suo database MySQL |

{: .note }
> **Consiglio** L'installer, dalla 7.3.0, è il modo più rapido per avere un'istanza funzionante: prepara il progetto Docker Compose su
> Docker o Podman, o uno degli altri metodi, a partire da poche domande. Le immagini Docker includono tutte le dipendenze.

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

Per portare un'installazione esistente a una versione più recente, vedi [Aggiornamento](../upgrading/).

Ogni metodo esegue un RTE accanto all'app, il container (o servizio) che esegue i playbook. Per aggiungerne un altro, su un altro host o in un altro
datacenter, installa un Runner con l'[installer](installer.html#a-runner): si collega ad AnsibleForms tramite un unico WebSocket (in uscita, vedi
[Modalità](../rte/modes.html)) e non contiene credenziali del database. Vedi anche [Ambienti di runtime](../rte/) e il relativo runbook
[Un RTE in un altro datacenter](../rte/another-datacenter.html).

---

## Tag delle immagini

L'immagine è pubblicata come `ghcr.io/ansibleforms/ansibleforms` sul GitHub Container Registry, che appartiene al
progetto e non limita i pull anonimi. Ogni versione dalla 7.0.0 in poi è pubblicata solo lì, e ci sono anche
le versioni 6.x.

Dalla 7, i playbook vengono eseguiti su un RTE, pubblicato in tre livelli accanto all'app (vedi [Le immagini RTE](../rte/images.html)):

| Immagine | Cos'è |
|---|---|
| `ghcr.io/ansibleforms/ansibleforms` | L'applicazione web e l'API, senza python né ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | L'RTE senza python né ansible: la base per il tuo |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | La base con python, ansible-core e alcune librerie: quella a cui aggiungere le tue collection |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | La core con il pacchetto `ansible`, le sue collection e librerie: l'RTE predefinito |

Le quattro immagini sono compilate nella stessa esecuzione e hanno gli stessi tag, quindi il tag di un RTE corrisponde sempre a quello dell'app.

Il vecchio repository su Docker Hub, `ansibleguy/ansibleforms`, non viene più aggiornato. Conserva le versioni
esistenti ma non riceve nuove versioni di nessuna delle due linee. Se fai il pull da lì, passa
a `ghcr.io/ansibleforms/ansibleforms` con lo stesso tag per continuare a ricevere aggiornamenti.

Su ogni immagine sono disponibili i seguenti tag; le immagini RTE partono dalla 7.0.0, quindi non hanno tag 6.x:

| Tag | Punta a |
|---|---|
| `latest` | l'ultima versione della major più recente |
| `7`, `6` | l'ultima versione di quella major |
| `7.0`, `6.5` | l'ultima versione di quella minor |
| `7.0.0`, `6.5.5` | esattamente quella versione |
| `latest-rc` | l'ultima release candidate, o l'ultima versione quando è più recente; ogni candidate ha anche il suo tag |

`latest` va solo avanti: una patch per una major più vecchia (per esempio una 6.5.x pubblicata
dopo la 7.0.0) sposta `6` e `6.5`, ma mai `latest`.

Per restare su una major, usa il suo numero (`6`) invece di `latest`.
