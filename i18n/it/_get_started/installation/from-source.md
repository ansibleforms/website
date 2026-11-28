---
layout: default
title: Dai sorgenti
parent: Installazione
nav_order: 5
translated_from: 5a30cd6f93473aa6d47bf91aabbe13af37d97127
---

# Dai sorgenti
{: .no_toc }

Compila AnsibleForms dai sorgenti ed eseguilo con Node.js
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Come è organizzato il codice

Il repository contiene due applicazioni Node.js, e una build le unisce in una sola:

* **client** : l'interfaccia web, scritta in Vue 3 e compilata in file statici con Vite
* **server** : l'API, scritta in Express. Passa i job ai runner, si connette al database e serve il client compilato.
  Avviato con `AF_ROLE=rte`, lo stesso server è l'RTE (ambiente di runtime) che esegue i playbook

Viene compilato solo il client; il suo output va nella cartella `views` del server, come nell'[immagine Docker](https://github.com/ansibleforms/ansibleforms/blob/main/Dockerfile).

---

## Prerequisiti

Compilare ed eseguire dai sorgenti richiede buone competenze Linux e qualche conoscenza di Node.js. Installi ogni componente tu stesso. Per
eseguire AnsibleForms senza container e senza compilarlo, l'[installazione nativa](native.html) dell'installer fa tutto questo al posto tuo:

* **Node.js 26** (la versione in `.nvmrc`; almeno la 24), con npm
* **Git**, per ottenere il codice e sincronizzare i repository
* **Client OpenSSH**, per git via SSH, e **sshpass**, per i playbook che si connettono con una password SSH
* **Client MariaDB** (`mariadb`, `mariadb-dump`), per backup e ripristini, anche con un server MySQL
* **MySQL 8+ o MariaDB**, raggiungibile dal server
* **Ansible**, per il processo RTE che esegue i playbook (`ansible-playbook` nel suo path). Il processo dell'app non ha bisogno
  né di Ansible né di Python, e con soli moduli template (AWX, AAP, Ascender e gli altri runner) non ti serve affatto un RTE

Installali per la tua distribuzione:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Node.js 26 arriva dal repository NodeSource, gli altri strumenti da Ubuntu stesso:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Node.js 26 arriva dal repository NodeSource, gli altri strumenti da Debian stesso:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

Node.js arriva da NodeSource e `sshpass` da EPEL (su RHEL stesso, abilita EPEL come documenta Red Hat):

```bash
curl -fsSL https://rpm.nodesource.com/setup_26.x | sudo bash -
sudo dnf install -y epel-release
sudo dnf install -y nodejs git openssh-clients sshpass mariadb python3 python3-pip ansible-core
```

</div>
</div>

Controlla `node --version` (26) e `ansible-playbook --version`; per il database e il suo utente, vedi [Installa MySQL](docker.html#install-mysql).

---

## Ottieni il codice

Clona il repository in una cartella a tua scelta, di proprietà dell'utente che eseguirà l'applicazione. Gli esempi usano `/srv/apps/ansibleforms`:

```bash
sudo mkdir -p /srv/apps
sudo chown $USER /srv/apps
cd /srv/apps
git clone https://github.com/ansibleforms/ansibleforms.git
cd ansibleforms
```

---

## Compila

Compila in tre passi, dalla cartella del repository. Prima compila il client:

```bash
cd client
npm ci
npm run build
```

Poi installa le dipendenze del server:

```bash
cd ../server
npm ci --omit=dev
```

Infine copia il client compilato nella cartella `views` del server:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

---

## Configura

Il server legge le sue impostazioni dalle variabili d'ambiente e, in produzione, anche da `server/persistent/.env`, il file
in cui scrivono le pagine delle impostazioni.

Parti dal file di esempio nella radice del repository e imposta almeno la connessione MySQL (`DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`):

```bash
cd /srv/apps/ansibleforms/server
mkdir -p persistent
cp ../.env.example persistent/.env
```

Tutte le variabili sono descritte in [Variabili d'ambiente](../customization). Tutto il resto viene salvato per impostazione predefinita in `server/persistent`:
`config.yaml`, la cartella `forms` e i certificati autofirmati vengono creati lì al primo avvio, insieme ai log.
Metti i tuoi playbook in `server/persistent/playbooks`, oppure fai puntare `ANSIBLE_PATH` altrove nell'ambiente dell'RTE, che la legge.

---

## Esegui

Esegui AnsibleForms in produzione, o in modalità sviluppo per lavorare sul codice stesso:

<div class="af-tabs" data-tab-group="mode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="production" aria-selected="true">Produzione</button>
<button type="button" role="tab" class="af-tab" data-tab="development" aria-selected="false">Sviluppo</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="production" markdown="1">

Avvia il server in modalità produzione dalla cartella `server`:

```bash
cd /srv/apps/ansibleforms/server
npm run start
```

Un'applicazione avviata dalla riga di comando si ferma quando ti disconnetti. [PM2](https://pm2.keymetrics.io/) la tiene in esecuzione in
background, la riavvia dopo un crash e la avvia di nuovo al boot:

```bash
sudo npm install -g pm2

cd /srv/apps/ansibleforms/server
NODE_ENV=production pm2 start index.js --name ansibleforms
pm2 save
pm2 startup   # prints the command that starts PM2 at boot
```

I playbook vengono eseguiti su un RTE: avvia lo stesso server una seconda volta con `AF_ROLE=rte`, su una porta tutta sua. L'app lo contatta e tiene
aperto un WebSocket (`RTE_MODE=inbound`, vedi [Modalità](../rte/modes.html)), ed esso esegue i playbook dalle stesse cartelle
(`RTE_FILES=local`). Legge anche `persistent/.env`, ma non usa nessuna delle sue impostazioni del database. Aggiungi a `persistent/.env` il token che l'app e l'RTE condividono,
di almeno 16 caratteri, e il config seed che dichiara l'RTE:

```bash
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/srv/apps/ansibleforms/server/persistent/seed.yaml
```

Il [config seed](../seed/) dichiara una credenziale RTE con l'indirizzo dell'RTE e il suo token, e il runner predefinito `rte` che accede
con essa:

```yaml
version: 1
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://127.0.0.1:8010
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

Senza un seed, aggiungili in **Connessioni > Credenziali** (una credenziale RTE con quell'indirizzo e il token) e
**Connessioni > Runner** (tipo RTE, **Modalità** **In entrata**). Poi avvia l'RTE, solo su `127.0.0.1`:

```bash
cd /srv/apps/ansibleforms/server
AF_ROLE=rte RTE_MODE=inbound RTE_FILES=local PORT=8010 HTTPS=0 LISTEN_HOST=127.0.0.1 \
  NODE_ENV=production pm2 start index.js --name ansibleforms-rte
pm2 save
```

Le impostazioni dell'RTE sono descritte nella pagina [Eseguire un RTE](../rte/run.html). Controlla che PM2 elenchi entrambi i processi:

```bash
pm2 status
```

Entrambi sono `online`:

```text
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| id | name             | mode | version | pid  | uptime | restarts | status | cpu | mem     | user | watching |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| 0  | ansibleforms     | fork | 7.0.0   | 3104 | 8s     | 0        | online | 0%  | 120.1mb | root | disabled |
| 1  | ansibleforms-rte | fork | 7.0.0   | 3187 | 5s     | 0        | online | 0%  | 80.4mb  | root | disabled |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="development" markdown="1" hidden>

Per lavorare sul codice stesso, avvia tutto dalla radice del repository con live reload: il server sulla porta 3001, un RTE sulla porta 8010
e il client su `https://localhost:8443`. In questa modalità, il server e l'RTE leggono invece `server/.env.development`:

```bash
cd /srv/apps/ansibleforms
npm install
(cd server && npm install && cp ../.env.example .env.development)
(cd client && npm install)
npm run dev
```

L'RTE (`npm run dev:rte`) ha bisogno di `ansible-playbook` nel path, e si aggiunge come runner in modalità database, deprecata, solo per
lo sviluppo; `npm run dev:local` avvia il client e il server senza di esso. La [guida per contribuire](https://github.com/ansibleforms/ansibleforms/blob/main/CONTRIBUTING.md) descrive i test e i controlli da eseguire.

</div>
</div>

---

## Primo avvio

Apri il server in un browser (con il `.env` di esempio, `https://your_ip:8443`). Su un database vuoto, lo schema viene creato al
primo avvio.

Le credenziali di amministratore predefinite sono:

* nome utente : `admin`
* password : `AnsibleForms!123`
