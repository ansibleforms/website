---
layout: default
title: Docker Compose
parent: Installazione
nav_order: 4
translated_from: 74a6833ea71d65db337025978672afeab0425666
---

# Docker Compose
{: .no_toc }

Installa AnsibleForms, il suo RTE e MySQL insieme con docker-compose o podman-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Il [progetto docker-compose](https://github.com/ansibleforms/docker) esegue tre container: MySQL, l'app AnsibleForms e l'RTE
(ambiente di runtime) che esegue i playbook. Contiene le loro impostazioni, moduli e playbook di esempio, quindi l'unico altro requisito è
Docker o Podman con il suo strumento compose.

L'[installer](installer.html) scarica questo progetto, ne compila impostazioni e segreti e lo avvia con un solo comando. Questa pagina
lo prepara a mano.

---

## Prerequisiti

Prima di iniziare ti servono:

* **Macchina Linux** : qualsiasi distribuzione, con CPU e memoria modeste
* **Accesso a GitHub** : per scaricare o clonare il progetto docker-compose da GitHub
* **Docker o Podman** : un motore di container, installato più sotto
* **Uno strumento compose** : Docker Compose o podman-compose, per avviare i tre container da pochi file di configurazione

**VIDEO**: [Come installare AnsibleForms](https://www.youtube.com/watch?v=IHGIggmtTuA)

---

## Scegli dove installare

Crea una cartella per il progetto; gli esempi usano `/srv/apps`:

```bash
sudo mkdir /srv/apps
cd /srv/apps
```

---

## Clona il progetto docker-compose

Installa Git:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y git
```

</div>
</div>

Poi clona il progetto docker-compose in quella cartella:

```bash
sudo git clone https://github.com/ansibleforms/docker.git ansibleforms-docker
cd ansibleforms-docker
```

---

## Imposta i permessi corretti

L'app e l'RTE girano come utente `node` (uid 1000), quindi assegna a quell'utente la cartella `data`:

```bash
sudo chown -R 1000:1000 ./data
```

Se arrivi dalla 6, il cui container girava come root, esegui lo stesso `chown` una volta prima di avviare la 7. MySQL si riprende la propria cartella quando parte.

---

## Installa un motore di container

Installa Docker o Podman, ognuno con il suo strumento compose:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

Installa Docker Engine con il plugin Compose dal repository di Docker
(vedi i [manuali di installazione di Docker](https://docs.docker.com/engine/install)):

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
# Docker's own dnf repository (Rocky / Alma : use .../linux/centos/docker-ce.repo)
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
</div>

Poi fai in modo che i nomi si risolvano dentro i container, e avvia Docker come servizio:

```bash
sudo mkdir -p /etc/docker
echo "{\"dns-opts\":[\"ndots:15\"]}" | sudo tee /etc/docker/daemon.json
sudo systemctl enable --now docker
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman non richiede un servizio. Installalo insieme a podman-compose:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y podman
# podman-compose comes from EPEL (on RHEL, enable EPEL as Red Hat documents it)
sudo dnf install -y epel-release
sudo dnf install -y podman-compose
```

</div>
</div>

</div>
</div>

---

## Personalizza

Controlla le variabili nei file `.env` e `docker-compose.yml`, e cambia ogni password: `MYSQLDB_ROOT_PASSWORD`,
`MYSQLDB_PASSWORD`, `ADMIN_PASSWORD` e `RTE_TOKEN`. [Scopri di più sulle variabili d'ambiente](../customization)

L'app si connette a MySQL come `ansibleforms` (`MYSQLDB_USER`), con tutti i diritti sullo schema `AnsibleForms` e nessuno
altrove; root serve solo a MySQL stesso. MySQL crea quell'utente solo al primo avvio: un'installazione che finora si connetteva come root
lo crea una volta, come mostra il [README](https://github.com/ansibleforms/docker#database) del progetto.

L'RTE non è pubblicato sull'host. Dalla 7.3.0 l'app lo contatta su `http://rte:8000` con `RTE_TOKEN` e tiene aperto un WebSocket
(`RTE_MODE=inbound`, vedi [Modalità](../rte/modes.html)): l'RTE non riceve impostazioni del database né il `.env`, solo il suo token e alcune
impostazioni proprie in `docker-compose.yml`. Il config seed `data/seed.yaml` dichiara una credenziale RTE con il token e quell'indirizzo,
e il runner predefinito `rte`, in modalità inbound, che accede con essa. L'RTE esegue i playbook dalla stessa cartella `data`
(`RTE_FILES=local`). Quando i tuoi playbook hanno bisogno di altre collection o librerie Python, crea un tuo RTE
e fai puntare il servizio `rte` a esso (vedi [Crea il tuo RTE](../rte/images.html#build-your-own-rte)).

---

## Avvia il progetto docker-compose

Avvia i tre container in background. L'app aspetta che MySQL sia healthy, poi contatta l'RTE:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
# with the older standalone tool : sudo docker-compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose up -d
# podman is service-less : you can run it as any user, with or without sudo
```

</div>
</div>

---

## Prova l'applicazione

Una volta avviati i container, apri AnsibleForms in un browser:

* Apri `https://your_ip` (porta 443, vedi `WEBAPP_LOCAL_PORT` nel file .env)
* Accedi come `admin` con la `ADMIN_PASSWORD` del file `.env`; finché è ancora quella predefinita `AnsibleForms!123`, scegli una nuova password
* Controlla in **Connessioni > Runner** che l'RTE sia elencato come `rte`, il runner predefinito, e che la sua pagina mostri la sua
  **Connessione** come **Connesso**
* Prossimi passi:
  * Crea moduli aggiungendo file YAML alla cartella data/forms/ o usando il designer integrato
  * Aggiungi i tuoi playbook alla cartella data/playbooks/
  * Aggiungi una connessione LDAP
  * Aggiungi utenti e gruppi
  * Aggiungi runner per i moduli template: AWX, AAP o Ascender, Semaphore, Rundeck o Jenkins
  * Aggiungi credenziali per connessioni esterne, come altri server MySQL o API REST, o da passare ai playbook Ansible
  * Collega repository Git e scegli se i tuoi moduli e/o playbook si sincronizzano con un repository

---

## Struttura dei file

Il progetto docker-compose ha la seguente struttura di cartelle:

```bash
.
├── docker-compose.yml # the mysqldb, app and rte containers
├── .env # the settings, see the variables below
└── data # everything that must survive an upgrade, mounted in the app and the rte
    ├── ansible # mounted in the rte only
    │   ├── ansible.cfg # ansible settings
    │   ├── roles # roles you install
    │   └── collections # collections you install
    ├── forms # 1 or more yaml files with forms
    ├── functions # custom javascript functions and jq definitions
    ├── git # .gitconfig for repository connections
    ├── mysql
    │   ├── my.cnf # MySQL settings
    │   └── db # the database files (created at first start)
    ├── playbooks # your ansible playbooks, with sample maintenance playbooks
    ├── repositories # local clones of your git repositories
    ├── ssh # the client sshkey (created at first start)
    ├── config.yaml # categories, roles and constants
    ├── seed.yaml # the config seed: registers the rte as the default runner
    ├── certificates # self-signed certificates (created at first start) - replace with your own
    ├── logs # the logfiles (created at first start)
    ├── backups # database backups (created when needed)
    └── forms_backups # form backups (created when needed)
```
