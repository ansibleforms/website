---
layout: default
title: Docker Compose
parent: Aggiornamento
nav_order: 2
translated_from: e0588e18950ebc7164327833bdc85871783048ba
---

# Docker Compose
{: .no_toc }

Aggiorna un'installazione fatta con il progetto docker-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Il progetto docker-compose esegue tre container: MySQL (`mysqldb`), AnsibleForms (`app`) e l'RTE che esegue i
playbook (`rte`). AnsibleForms e l'RTE usano il tag dell'immagine `7`, che punta sempre all'ultima release 7.x. Un
aggiornamento scarica di nuovo le immagini e ricrea i container la cui immagine è cambiata. Tutto ciò che deve persistere è salvato
nella cartella `data` e viene conservato.

---

## Prima di aggiornare

Prepara l'aggiornamento in modo da poter tornare indietro se qualcosa va storto:

* **Fai un backup** in **Impostazioni → Backup**. La nuova release aggiorna lo schema del database al suo primo avvio.
* **Leggi il [changelog](../changelog)** delle release tra la tua versione e quella nuova.
* **Passi a una nuova major?** Segui prima [Aggiornare alla v7](../upgrade-7.html).
* **Arrivi dalla 6.5?** Il progetto 6.x, sul suo branch `v6`, non ha il container `rte`. Aggiorna la tua copia del progetto al
  suo branch `main`, mantenendo le tue impostazioni del `.env` e la tua cartella `data`, così che `docker-compose.yml` abbia il servizio
  `rte`. Quel file compose imposta `CONFIG_SEED_PATH`, e una cartella `data` della 6.x non ha `seed.yaml`: copia `data/seed.yaml` dal
  repository, e aggiungi `RTE_TOKEN` (almeno 16 caratteri) al tuo `.env`, come lo ha il `.env` del repository. Senza di essi
  l'app si rifiuta di partire. Le immagini 7 girano come uid 1000 invece che come root: assegna una volta a quell'utente la cartella `data`, lasciando i file
  di MySQL a MySQL, con `sudo find data -path data/mysql -prune -o -exec chown 1000:1000 {} +`.
  La cartella `data/ssh` ora è montata su `/home/node/.ssh` invece che su `/root/.ssh`.
* **Arrivi dalla 7.2?** Aggiorna insieme `docker-compose.yml` e `data/seed.yaml`: vedi prima [Dalla 7.2 alla 7.3](#from-72-to-73).

---

## Dalla 7.2 alla 7.3

Fino alla 7.2.0 il servizio `rte` riceveva le impostazioni del database e il suo runner, dichiarato in `data/seed.yaml`, girava in modalità database,
deprecata nella 7.3.0 e rimossa nella 8.0.0. Dalla 7.3.0 l'app contatta l'RTE su `http://rte:8000` e tiene aperto un WebSocket
(`RTE_MODE=inbound`, vedi [Modalità](../rte/modes.html)), e l'RTE non contiene impostazioni del database. Prendi entrambi i file dal branch
`main` del repository, mantenendo il tuo `.env`:

| File | Cosa cambia |
|---|---|
| `docker-compose.yml` | Il servizio `rte` non legge più `.env`: riceve `RTE_MODE=inbound`, `RTE_TOKEN` e `RTE_FILES=local`, e nessun `DB_*` |
| `data/seed.yaml` | Una credenziale RTE `rte`, con `url: http://rte:8000` e `password: ${RTE_TOKEN}`, e il runner `rte` con `rte_mode: inbound` e `credential: rte` |

Cambiali entrambi. Con solo il nuovo file compose, il seed mantiene il runner `rte` in modalità database: l'app chiama l'RTE come uno della 7.2,
a cui il nuovo RTE non risponde, e nessun playbook viene eseguito. Un seed che hai modificato tu ha bisogno della stessa credenziale e dello stesso `rte_mode`.

Un runner creato dal seed resta gestito, in sola lettura in **Connessioni → Runner**, anche dopo che hai rimosso `CONFIG_SEED_PATH`: solo un
seed applicato rilascia un runner che non dichiara più. Quindi mantieni il seed e imposta lì `rte_mode`, invece di rimuovere
`CONFIG_SEED_PATH` per modificare il runner a mano.

L'[installer](../installation/installer.html#upgrade) lo fa da solo: il suo aggiornamento sostituisce `docker-compose.yml`, e `data/seed.yaml`
quando è uno fornito dal repository, non modificato. Uno modificato a mano viene mantenuto, e quello nuovo viene salvato accanto.

---

## 1. Scarica le nuove immagini

Scarica le immagini più recenti dei tag in `docker-compose.yml`:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
cd /srv/apps/ansibleforms-docker
sudo docker compose pull
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
cd /srv/apps/ansibleforms-docker
sudo podman-compose pull
```

</div>
</div>

---

## 2. Ricrea i container

Avvia di nuovo il progetto; i container la cui immagine è cambiata vengono ricreati:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose down
sudo podman-compose up -d
```

</div>
</div>

---

## 3. Controlla l'aggiornamento

Segui il log di AnsibleForms mentre si avvia. Il primo avvio di una nuova release aggiorna lo schema del database, e l'RTE
si avvia quando AnsibleForms è healthy:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose logs -f app
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose logs -f app
```

</div>
</div>

In AnsibleForms, **Aiuto → Informazioni** mostra la versione in esecuzione, e **Impostazioni → Stato** mostra lo stato di salute del
database, dello schema e degli altri sistemi da cui dipende AnsibleForms.

---

## Tornare indietro

Per tornare alla release che eseguivi prima, la versione che **Aiuto → Informazioni** mostrava prima dell'aggiornamento, fissa il suo tag esatto in
`docker-compose.yml` sia sull'immagine di AnsibleForms sia su quella dell'RTE, al posto di `7`, ed esegui di nuovo il passo 2. Se quella release
non si avvia sul database aggiornato, ripristina il backup che hai fatto in **Impostazioni → Backup**. Rimetti i tag su
`7` per ricevere di nuovo gli aggiornamenti.

**VIDEO**: [Come aggiornare AnsibleForms](https://www.youtube.com/watch?v=5ZDJ8CcUx5c)
