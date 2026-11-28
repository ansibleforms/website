---
layout: default
title: Docker Compose
parent: Installatie
nav_order: 4
translated_from: 25caf8bbfcc4dc5174eb55f39917d45418bacfbe
---

# Docker Compose
{: .no_toc }

Installeer AnsibleForms, de RTE en MySQL samen met docker-compose of podman-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Het [docker-compose-project](https://github.com/ansibleforms/docker) draait drie containers: MySQL, de AnsibleForms-app en de RTE
(runtime-omgeving) die de playbooks uitvoert. Het bevat hun instellingen, voorbeeldformulieren en playbooks, dus het enige andere vereiste is
Docker of Podman met de bijbehorende compose-tool.

Het [installatieprogramma](installer.html) downloadt dit project, vult de instellingen en secrets in en start het, in één commando. Deze pagina
zet het met de hand op.

---

## Vereisten

Voordat je begint, heb je nodig:

* **Linux-machine** : elke distributie, met bescheiden CPU en geheugen
* **Toegang tot GitHub** : om het docker-compose-project van GitHub te downloaden of te clonen
* **Docker of Podman** : een container-engine, hieronder geïnstalleerd
* **Een compose-tool** : Docker Compose of podman-compose, om de drie containers vanuit een paar configuratiebestanden te starten

**VIDEO**: [AnsibleForms installeren](https://www.youtube.com/watch?v=IHGIggmtTuA)

---

## Kies een installatielocatie

Maak een map voor het project; de voorbeelden gebruiken `/srv/apps`:

```bash
sudo mkdir /srv/apps
cd /srv/apps
```

---

## Clone het docker-compose-project

Installeer Git:

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

Clone daarna het docker-compose-project in die map:

```bash
sudo git clone https://github.com/ansibleforms/docker.git ansibleforms-docker
cd ansibleforms-docker
```

---

## Stel de juiste rechten in

De app en de RTE draaien als de gebruiker `node` (uid 1000), dus maak die gebruiker eigenaar van de map `data`:

```bash
sudo chown -R 1000:1000 ./data
```

Kom je van 6, waarvan de container als root draaide, voer dan dezelfde `chown` één keer uit voordat je 7 start. MySQL neemt zijn eigen map bij het starten weer over.

De RTE start elk playbook in een eigen container via de socket van Docker en wordt daarvoor lid van de groep van de socket. Zet die groep in `.env`:

```bash
sed -i "s/^ENGINE_SOCKET_GID=.*/ENGINE_SOCKET_GID=$(stat -c %g /var/run/docker.sock)/" .env
```

Met Podman zet u `RTE_ENGINE=podman` en `ENGINE_SOCKET` op de socket van Podman, en met rootless Podman ook `RTE_USER=0`.

---

## Installeer een container-engine

Installeer Docker of Podman, elk met de bijbehorende compose-tool:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

Installeer Docker Engine met de Compose-plugin uit de repository van Docker
(zie de [installatiehandleidingen van Docker](https://docs.docker.com/engine/install)):

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

Zorg er daarna voor dat namen binnen de containers worden opgelost, en start Docker als service:

```bash
sudo mkdir -p /etc/docker
echo "{\"dns-opts\":[\"ndots:15\"]}" | sudo tee /etc/docker/daemon.json
sudo systemctl enable --now docker
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman heeft geen service nodig. Installeer het samen met podman-compose:

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

## Aanpassen

Bekijk de variabelen in de bestanden `.env` en `docker-compose.yml`, en wijzig elk wachtwoord: `MYSQLDB_ROOT_PASSWORD`,
`MYSQLDB_PASSWORD`, `ADMIN_PASSWORD` en `RTE_TOKEN`. [Meer over de omgevingsvariabelen](../customization)

De app maakt verbinding met MySQL als `ansibleforms` (`MYSQLDB_USER`), met alle rechten op het schema `AnsibleForms` en nergens
anders; root is alleen voor MySQL zelf. MySQL maakt die gebruiker alleen bij de eerste start aan: een installatie die tot nu toe als root
verbond, maakt hem één keer aan, zoals de [README](https://github.com/ansibleforms/docker#database) van het project laat zien.

De RTE is de [RTE Runner](../rte/runner/) en wordt niet op de host gepubliceerd. De app maakt verbinding met `http://rte:8000` met `RTE_TOKEN`
en houdt één WebSocket open (`RTE_MODE=inbound`, zie [Modi](../rte/modes.html)): hij krijgt geen database-instellingen en niet de geheimen van de `.env`.
De config-seed `data/seed.yaml` legt een RTE-referentie aan met het token en dat adres, en de standaard-runner `rte`, modus inbound,
die zich daarmee aanmeldt. Sinds 7.9.0 start de Runner elk playbook in een eigen container uit `ansibleforms-rte-full` (`RTE_IMAGE`),
met de bestanden van de job uit dezelfde map `data` (`RTE_FILES=local`), en koppelt hij `data/ansible`, de SSH-sleutel en de pip-bibliotheken in
elke container (`RTE_JOB_MOUNTS`). Hij start ze via de socket van de engine, die hem alle rechten van die engine op de host geeft: houd die
server voor AnsibleForms. Hebben uw playbooks meer collections of Python-bibliotheken nodig, bouw dan een eigen image en zet het als
`RTE_IMAGE` (zie [Een eigen RTE bouwen](../rte/images.html#build-your-own-rte)).

---

## Start het docker-compose-project

Start de drie containers op de achtergrond. De app wacht tot MySQL gezond is en belt dan de RTE aan:

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

## Test de applicatie

Zodra de containers draaien, open je AnsibleForms in een browser:

* Open `https://your_ip` (poort 443, zie `WEBAPP_LOCAL_PORT` in het .env-bestand)
* Meld je aan als `admin` met het `ADMIN_PASSWORD` uit het `.env`-bestand; zolang dat nog de standaardwaarde `AnsibleForms!123` is, kies je een nieuw wachtwoord
* Controleer onder **Verbindingen > Runners** dat de RTE in de lijst staat als `rte`, de standaardrunner, en dat zijn pagina bij
  **Verbinding** de status **Verbonden** toont
* Volgende stappen:
  * Maak formulieren door YAML-bestanden aan de map data/forms/ toe te voegen of met de ingebouwde designer
  * Zet je playbooks in de map data/playbooks/
  * Voeg een LDAP-verbinding toe
  * Voeg gebruikers en groepen toe
  * Voeg runners toe voor templateformulieren: AWX, AAP of Ascender, Semaphore, Rundeck of Jenkins
  * Voeg referenties toe voor externe verbindingen, zoals andere MySQL-servers of REST API's, of om aan Ansible-playbooks door te geven
  * Koppel Git-repositories en kies of je formulieren en/of playbooks met een repository synchroniseren

---

## Bestandsstructuur

Het docker-compose-project heeft de volgende mappenstructuur:

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
