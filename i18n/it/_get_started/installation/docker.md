---
layout: default
title: Docker
parent: Installazione
nav_order: 3
translated_from: d178cc481311c66fba52c62ac7bf5841b5f83316
---

# Docker
{: .no_toc }

Esegui le immagini dell'app e dell'RTE di AnsibleForms con Docker o Podman, accanto a un tuo server MySQL
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Puoi eseguire AnsibleForms con Docker o Podman come due container, l'app e l'RTE che esegue i playbook, collegati a un database MySQL.

---

## Prerequisiti

Prima di iniziare ti servono:

* **Docker o Podman** : uno dei due installato e in esecuzione
* **MySQL** : installato e in esecuzione

---

## Installa MySQL

Installa MySQL 8+, o MariaDB, su un server Linux raggiungibile dal container:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Ubuntu include MySQL 8:

```bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Debian include MariaDB al posto di MySQL, supportato anch'esso da AnsibleForms:

```bash
sudo apt-get update
sudo apt-get install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mariadb-secure-installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

RHEL 8 e successivi, e le sue ricompilazioni, includono MySQL 8 in AppStream:

```bash
sudo dnf install -y mysql-server
sudo systemctl enable --now mysqld
sudo mysql_secure_installation
```

</div>
</div>

AnsibleForms si connette al database tramite la rete, come `DB_USER` con `DB_PASSWORD`. Dagli un utente tutto suo, con diritti solo
sullo schema `AnsibleForms`, non root:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

È tutto ciò che serve ad AnsibleForms: con questo crea e aggiorna il suo schema e fa i suoi backup. La pagina **Stato** e il log
avvisano quando l'utente ha diritti su tutti i database. Su Ubuntu e Debian il server ascolta solo su localhost: imposta `bind-address` nella sua
configurazione in modo che i container possano raggiungerlo.

---

## Prepara le cartelle

AnsibleForms 7 gira in due container: l'app, e l'RTE (ambiente di runtime) che esegue i playbook. Entrambi montano una cartella per
il tuo `config.yaml`, moduli, playbook, log e certificati, e una cartella per la chiave SSH. Le immagini girano come utente `node` (uid 1000),
quindi assegna a quell'utente entrambe le cartelle:

```bash
sudo mkdir -p /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
```

Metti le impostazioni dell'app in un file di ambiente: la connessione al database,
[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) prima di salvare qualsiasi credenziale, il token che l'app e
l'RTE condividono ([`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN), almeno 16 caratteri) e il config seed che dichiara l'RTE:

```bash
sudo tee /srv/apps/ansibleforms/ansibleforms.env > /dev/null <<'END'
DB_HOST=192.168.0.1
DB_PORT=3306
DB_USER=ansibleforms
DB_PASSWORD=<password>
ENCRYPTION_SECRET=<a long random string>
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml
END
sudo chmod 600 /srv/apps/ansibleforms/ansibleforms.env
```

L'RTE riceve un file tutto suo, senza le impostazioni del database: dalla 7.3.0 l'app lo contatta e tiene aperto un WebSocket
(`RTE_MODE=inbound`, vedi [Modalità](../rte/modes.html)), ed esegue i playbook dalle stesse cartelle (`RTE_FILES=local`):

```bash
sudo tee /srv/apps/ansibleforms/rte.env > /dev/null <<'END'
RTE_MODE=inbound
RTE_TOKEN=<the same token>
RTE_FILES=local
PORT=8000
HTTPS=0
END
sudo chmod 600 /srv/apps/ansibleforms/rte.env
```

Il [config seed](../seed/) dichiara una credenziale RTE con l'indirizzo dell'RTE e il suo token, e il runner predefinito `rte` che accede
con essa:

```bash
sudo tee /srv/apps/ansibleforms/persistent/seed.yaml > /dev/null <<'END'
version: 1
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://rte:8000
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
END
sudo chown 1000:1000 /srv/apps/ansibleforms/persistent/seed.yaml
```

---

## Avvia i container

Esegui le immagini pubblicate sul GitHub Container Registry (vedi [Tag delle immagini](./#image-tags)):
[`ghcr.io/ansibleforms/ansibleforms`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms) per l'app e
[`ghcr.io/ansibleforms/ansibleforms-rte-full`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms-rte-full) per l'RTE.

Il seed aggiunge l'RTE in **Connessioni > Runner** come runner `rte`, quello predefinito, così i moduli playbook vengono eseguiti su di esso senza altra
configurazione. L'app crea lo schema al primo avvio, e contatta l'RTE quando entrambi sono in esecuzione (un `config.yaml` di esempio si trova nel
[progetto docker-compose](https://github.com/ansibleforms/docker/blob/main/data/config.yaml)):

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker network create ansibleforms

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

Una volta avviati, entrambi i container compaiono nell'elenco:

```bash
docker ps
CONTAINER ID   IMAGE                                          COMMAND                  CREATED          STATUS                    PORTS                    NAMES
5c0e2a91d7f4   ghcr.io/ansibleforms/ansibleforms-rte-full:7   "/usr/bin/tini -- no…"   10 seconds ago   Up 9 seconds (healthy)                             rte
d91f7b05b67e   ghcr.io/ansibleforms/ansibleforms:7            "/usr/bin/tini -- no…"   2 minutes ago    Up 2 minutes (healthy)    0.0.0.0:8000->8000/tcp   ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman accetta le stesse opzioni e non richiede un servizio:

```bash
podman network create ansibleforms

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

Una volta avviati, entrambi i container compaiono nell'elenco:

```bash
podman ps
```

</div>
</div>

L'app ascolta sulla porta `8000`, in HTTP a meno che tu non imposti `HTTPS=1`. L'RTE non è pubblicato sull'host: solo l'app lo contatta, dentro
la rete. `--stop-timeout 30` dà all'RTE il tempo di lasciar terminare i playbook in esecuzione durante uno stop (vedi
[Eseguire un RTE](../rte/run.html) per le impostazioni dell'RTE e per creare un tuo RTE).

---

## Prova l'applicazione

Una volta avviati i container, apri AnsibleForms in un browser:

* Apri `http://your_ip:8000` (o HTTPS, se hai impostato `HTTPS=1`)
* Accedi come `admin` / `AnsibleForms!123` (o con la password che hai impostato con `ADMIN_PASSWORD`), e scegli una nuova password
* Controlla in **Connessioni > Runner** che l'RTE sia elencato come `rte`, il runner predefinito, e che la sua pagina mostri la sua
  **Connessione** come **Connesso**
* Prossimi passi:
  * Crea moduli aggiungendo file YAML alla cartella `forms` o usando il designer integrato
  * Aggiungi i tuoi playbook alla cartella `playbooks` della cartella persistente montata
  * Aggiungi una connessione LDAP
  * Aggiungi utenti e gruppi
  * Aggiungi runner per i moduli template: AWX, AAP o Ascender, Semaphore, Rundeck o Jenkins
  * Aggiungi credenziali per connessioni esterne, come altri server MySQL o API REST, o da passare ai playbook Ansible
