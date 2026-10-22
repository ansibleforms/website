---
layout: default
title: Docker
parent: Aggiornamento
nav_order: 1
translated_from: 4b3babaa4c1dd9c7848cf92c8bd75af68e6fac97
---

# Docker
{: .no_toc }

Aggiorna un container standalone, senza docker-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un'installazione standalone si aggiorna sostituendo i suoi container: scarica le nuove immagini, rimuovi i vecchi container e
avviane di nuovi con gli stessi comandi `run`. Dalla versione 7 sono due: AnsibleForms e l'RTE che esegue i
playbook, sempre sulla stessa release. I tuoi file sono salvati nella cartella montata `/app/dist/persistent` e i tuoi dati in
MySQL, quindi entrambi vengono conservati.

---

## Prima di aggiornare

Prepara l'aggiornamento in modo da poter tornare indietro se qualcosa va storto:

* **Fai un backup** in **Impostazioni → Backup**. La nuova release aggiorna lo schema del database al suo primo avvio.
* **Leggi il [changelog](../changelog)** delle release tra la tua versione e quella nuova.
* **Passi a una nuova major?** Segui prima [Aggiornare alla v7](../upgrade-7.html).
* **Arrivi dalla 6.5?** Le immagini 7 girano come uid 1000 invece che come root: assegna una volta a quell'utente le cartelle che monti, per
  esempio `sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh`.
* **Arrivi dalla 7.2?** L'RTE riceve un file tutto suo e l'app lo contatta: vedi prima [Dalla 7.2 alla 7.3](#from-72-to-73).

---

## Dalla 7.2 alla 7.3

Fino alla 7.2.0 l'RTE leggeva il file di ambiente dell'app, con le impostazioni del database, e si aggiungeva come runner da `RTE_URL`. Quella
è la modalità database, deprecata nella 7.3.0 e rimossa nella 8.0.0. Dalla 7.3.0 l'app contatta l'RTE e tiene aperto un WebSocket
(`RTE_MODE=inbound`, vedi [Modalità](../rte/modes.html)), e l'RTE non contiene impostazioni del database. Una volta, prima del passo 2:

1. Crea `/srv/apps/ansibleforms/rte.env` come fa l'[installazione](../installation/docker.html#prepare-the-folders), con
   `RTE_MODE=inbound`, lo stesso `RTE_TOKEN`, `RTE_FILES=local`, `PORT=8000` e `HTTPS=0`. Niente `DB_*`, niente `ENCRYPTION_SECRET`, niente `RTE_URL`
2. Dichiara il runner in quella modalità. O aggiungi il [config seed](../seed/) dell'installazione, `persistent/seed.yaml` con la credenziale RTE
   (`url: http://rte:8000`, `password: ${RTE_TOKEN}`) e il runner `rte` (`rte_mode: inbound`), e aggiungi
   `CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml` al file di ambiente dell'app. Oppure, senza seed, apri il runner in
   **Connessioni → Runner**, imposta la sua **Modalità** su **In entrata**, e scegli una credenziale RTE che contenga `http://rte:8000` e il token

Con il seed, anche il file di ambiente dell'app contiene `RTE_TOKEN`, lo stesso token, perché il seed lo legge da lì.

---

## 1. Scarica le nuove immagini

Scarica le immagini più recenti di AnsibleForms e dell'RTE del tag che esegui:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker pull ghcr.io/ansibleforms/ansibleforms:7
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman pull ghcr.io/ansibleforms/ansibleforms:7
podman pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

---

## 2. Sostituisci i container

Rimuovi i vecchi container e avviane di nuovi con i comandi `run` dell'[installazione](../installation/docker.html). L'app
legge la connessione al database dal suo file di ambiente, con l'utente del database di AnsibleForms (non root). L'RTE legge il suo
`rte.env`, senza le impostazioni del database, e l'app lo contatta tramite una rete condivisa da entrambi i container:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker stop ansibleforms rte
docker rm ansibleforms rte

docker run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman stop ansibleforms rte
podman rm ansibleforms rte

podman run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

podman run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Se arrivi dalla 6.5, non c'è ancora nessun container RTE: i comandi `stop` e `rm` trovano solo l'app. Crea la rete condivisa
una volta con `docker network create ansibleforms` (o `podman network create ansibleforms`). Come fa
l'[installazione](../installation/docker.html#prepare-the-folders), metti la connessione al database, `ENCRYPTION_SECRET`, un `RTE_TOKEN`
di almeno 16 caratteri e `CONFIG_SEED_PATH` nel file di ambiente dell'app, e crea `rte.env` e il config seed. Usa le tue
cartelle dove la tua installazione 6.5 ne montava altre. Il seed aggiunge l'RTE in **Connessioni → Runner** come runner predefinito `rte`;
vedi [Aggiornare alla v7](../upgrade-7.html#playbooks-run-on-an-rte).

---

## 3. Controlla l'aggiornamento

Segui il log di AnsibleForms mentre si avvia. Il primo avvio di una nuova release aggiorna lo schema del database:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker logs -f ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman logs -f ansibleforms
```

</div>
</div>

L'RTE scrive un log tutto suo, che `docker logs rte` mostra. In AnsibleForms, **Aiuto → Informazioni** mostra la versione in esecuzione, e **Impostazioni → Stato** mostra lo stato di salute del
database, dello schema e degli altri sistemi da cui dipende AnsibleForms.

---

## Tornare indietro

Per tornare alla release che eseguivi prima, la versione che **Aiuto → Informazioni** mostrava prima dell'aggiornamento, esegui di nuovo il passo 2 con
il suo tag esatto al posto di `7`, sia sull'immagine di AnsibleForms sia su quella dell'RTE. Se quella release non si avvia sul database
aggiornato, ripristina il backup che hai fatto in **Impostazioni → Backup**.
