---
layout: default
title: Docker Compose
parent: Installation
nav_order: 4
translated_from: 74a6833ea71d65db337025978672afeab0425666
---

# Docker Compose
{: .no_toc }

AnsibleForms, seine RTE und MySQL gemeinsam mit docker-compose oder podman-compose installieren
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Das [docker-compose-Projekt](https://github.com/ansibleforms/docker) betreibt drei Container: MySQL, die AnsibleForms-App und die RTE
(Laufzeitumgebung), die die Playbooks ausführt. Es enthält ihre Einstellungen, Beispielformulare und Playbooks, daher ist die einzige weitere Voraussetzung
Docker oder Podman mit dem zugehörigen Compose-Werkzeug.

Der [Installer](installer.html) lädt dieses Projekt herunter, füllt seine Einstellungen und Secrets aus und startet es mit einem Befehl. Diese Seite
richtet es von Hand ein.

---

## Voraussetzungen

Bevor Sie beginnen, benötigen Sie:

* **Linux-Rechner** : eine beliebige Distribution, mit bescheidener CPU und wenig Arbeitsspeicher
* **Zugriff auf GitHub** : um das docker-compose-Projekt von GitHub herunterzuladen oder zu klonen
* **Docker oder Podman** : eine Container-Engine, deren Installation weiter unten beschrieben ist
* **Ein Compose-Werkzeug** : Docker Compose oder podman-compose, um die drei Container aus wenigen Konfigurationsdateien zu starten

**VIDEO**: [So installieren Sie AnsibleForms](https://www.youtube.com/watch?v=IHGIggmtTuA)

---

## Einen Installationsort wählen

Legen Sie einen Ordner für das Projekt an; die Beispiele verwenden `/srv/apps`:

```bash
sudo mkdir /srv/apps
cd /srv/apps
```

---

## Das docker-compose-Projekt klonen

Installieren Sie Git:

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

Klonen Sie dann das docker-compose-Projekt in diesen Ordner:

```bash
sudo git clone https://github.com/ansibleforms/docker.git ansibleforms-docker
cd ansibleforms-docker
```

---

## Die richtigen Berechtigungen setzen

Die App und die RTE laufen als Benutzer `node` (uid 1000), geben Sie diesem Benutzer daher den Ordner `data`:

```bash
sudo chown -R 1000:1000 ./data
```

Wenn Sie von 6 kommen, dessen Container als root lief, führen Sie dasselbe `chown` einmal aus, bevor Sie 7 starten. MySQL holt sich beim Start seinen eigenen Ordner zurück.

---

## Eine Container-Engine installieren

Installieren Sie Docker oder Podman, jeweils mit dem zugehörigen Compose-Werkzeug:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

Installieren Sie Docker Engine mit dem Compose-Plugin aus dem Repository von Docker
(siehe die [Docker-Installationsanleitungen](https://docs.docker.com/engine/install)):

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

Sorgen Sie dann dafür, dass Namen innerhalb der Container aufgelöst werden, und starten Sie Docker als Dienst:

```bash
sudo mkdir -p /etc/docker
echo "{\"dns-opts\":[\"ndots:15\"]}" | sudo tee /etc/docker/daemon.json
sudo systemctl enable --now docker
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman braucht keinen Dienst. Installieren Sie es zusammen mit podman-compose:

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

## Anpassen

Prüfen Sie die Variablen in den Dateien `.env` und `docker-compose.yml` und ändern Sie jedes Passwort: `MYSQLDB_ROOT_PASSWORD`,
`MYSQLDB_PASSWORD`, `ADMIN_PASSWORD` und `RTE_TOKEN`. [Mehr über die Umgebungsvariablen](../customization)

Die App verbindet sich mit MySQL als `ansibleforms` (`MYSQLDB_USER`), mit allen Rechten auf dem Schema `AnsibleForms` und keinen
anderswo; root ist nur für MySQL selbst da. MySQL legt diesen Benutzer nur bei seinem ersten Start an: eine Installation, die sich bisher als root
verbunden hat, legt ihn einmalig an, wie das [README](https://github.com/ansibleforms/docker#database) des Projekts zeigt.

Die RTE wird nicht auf dem Host veröffentlicht. Seit 7.3.0 verbindet sich die App mit `RTE_TOKEN` auf `http://rte:8000` und hält einen WebSocket offen
(`RTE_MODE=inbound`, siehe [Modi](../rte/modes.html)): die RTE bekommt keine Datenbankeinstellungen und nicht die `.env`, nur ihr Token und einige
eigene Einstellungen in `docker-compose.yml`. Der Konfigurations-Seed `data/seed.yaml` deklariert RTE-Anmeldedaten mit dem Token und dieser
Adresse sowie den Standard-Runner `rte`, Modus inbound, der sich damit anmeldet. Die RTE führt die Playbooks aus demselben Ordner `data` aus
(`RTE_FILES=local`). Wenn Ihre Playbooks weitere Collections oder Python-Bibliotheken brauchen, bauen Sie eine eigene RTE
und lassen den Dienst `rte` darauf zeigen (siehe [Eine eigene RTE bauen](../rte/images.html#build-your-own-rte)).

---

## Das docker-compose-Projekt starten

Starten Sie die drei Container im Hintergrund. Die App wartet, bis MySQL gesund ist, und verbindet sich dann mit der RTE:

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

## Die Anwendung testen

Sobald die Container laufen, öffnen Sie AnsibleForms im Browser:

* Öffnen Sie `https://your_ip` (Port 443, siehe `WEBAPP_LOCAL_PORT` in der .env-Datei)
* Melden Sie sich als `admin` mit dem `ADMIN_PASSWORD` aus der `.env`-Datei an; solange es noch das Standardpasswort `AnsibleForms!123` ist, wählen Sie ein neues Passwort
* Prüfen Sie unter **Verbindungen > Runner**, dass die RTE als `rte` aufgeführt ist, der Standard-Runner, und dass ihre Seite die
  **Verbindung** als **Verbunden** zeigt
* Nächste Schritte:
  * Erstellen Sie Formulare, indem Sie YAML-Dateien in den Ordner data/forms/ legen oder den eingebauten Designer verwenden
  * Legen Sie Ihre Playbooks in den Ordner data/playbooks/
  * Fügen Sie eine LDAP-Verbindung hinzu
  * Fügen Sie Benutzer und Gruppen hinzu
  * Fügen Sie Runner für Vorlagenformulare hinzu: AWX, AAP oder Ascender, Semaphore, Rundeck oder Jenkins
  * Fügen Sie Anmeldedaten für externe Verbindungen hinzu, etwa andere MySQL-Server oder REST-APIs, oder um sie an Ansible-Playbooks zu übergeben
  * Verbinden Sie Git-Repositories und legen Sie fest, ob Ihre Formulare und/oder Playbooks mit einem Repository synchronisiert werden

---

## Dateistruktur

Das docker-compose-Projekt hat folgende Ordnerstruktur:

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
