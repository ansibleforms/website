---
layout: default
title: Docker
parent: Installation
nav_order: 3
translated_from: d178cc481311c66fba52c62ac7bf5841b5f83316
---

# Docker
{: .no_toc }

Die Images der AnsibleForms-App und der RTE mit Docker oder Podman betreiben, neben einem eigenen MySQL-Server
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Sie können AnsibleForms mit Docker oder Podman als zwei Container betreiben, die App und die RTE, die die Playbooks ausführt, verbunden mit einer MySQL-Datenbank.

---

## Voraussetzungen

Bevor Sie beginnen, benötigen Sie:

* **Docker oder Podman** : eines davon installiert und laufend
* **MySQL** : installiert und laufend

---

## MySQL installieren

Installieren Sie MySQL 8+ oder MariaDB auf einem Linux-Server, den der Container erreichen kann:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Ubuntu liefert MySQL 8 mit:

```bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Debian liefert statt MySQL MariaDB mit, das AnsibleForms ebenfalls unterstützt:

```bash
sudo apt-get update
sudo apt-get install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mariadb-secure-installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

RHEL 8 und neuer sowie seine Nachbauten liefern MySQL 8 in AppStream mit:

```bash
sudo dnf install -y mysql-server
sudo systemctl enable --now mysqld
sudo mysql_secure_installation
```

</div>
</div>

AnsibleForms verbindet sich über das Netzwerk mit der Datenbank, als `DB_USER` mit `DB_PASSWORD`. Geben Sie ihm einen eigenen Benutzer, mit Rechten nur auf
dem Schema `AnsibleForms`, nicht root:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

Mehr braucht AnsibleForms nicht: damit legt es sein Schema an, aktualisiert es und erstellt seine Backups. Die Seite **Status** und das Protokoll
warnen, wenn der Benutzer Rechte auf jeder Datenbank hat. Unter Ubuntu und Debian lauscht der Server nur auf localhost: setzen Sie `bind-address` in seiner
Konfiguration, damit die Container ihn erreichen.

---

## Die Ordner vorbereiten

AnsibleForms 7 läuft in zwei Containern: der App und der RTE (Laufzeitumgebung), die die Playbooks ausführt. Beide hängen einen Ordner für
Ihre `config.yaml`, Formulare, Playbooks, Protokolle und Zertifikate ein sowie einen Ordner für den SSH-Schlüssel. Die Images laufen als Benutzer `node` (uid 1000),
geben Sie diesem Benutzer daher beide Ordner:

```bash
sudo mkdir -p /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
```

Legen Sie die Einstellungen der App in eine Umgebungsdatei: die Datenbankverbindung,
[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET), bevor Sie Anmeldedaten speichern, das Token, das App und
RTE teilen ([`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN), mindestens 16 Zeichen), und den Konfigurations-Seed, der die RTE deklariert:

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

Die RTE bekommt eine eigene Datei, ohne die Einstellungen der Datenbank: seit 7.3.0 verbindet sich die App mit ihr und hält einen WebSocket offen
(`RTE_MODE=inbound`, siehe [Modi](../rte/modes.html)), und sie führt die Playbooks aus denselben Ordnern aus (`RTE_FILES=local`):

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

Der [Konfigurations-Seed](../seed/) deklariert RTE-Anmeldedaten mit der Adresse der RTE und ihrem Token sowie den Standard-Runner `rte`, der sich
damit anmeldet:

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

## Die Container starten

Starten Sie die veröffentlichten Images aus der GitHub Container Registry (siehe [Image-Tags](./#image-tags)):
[`ghcr.io/ansibleforms/ansibleforms`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms) für die App und
[`ghcr.io/ansibleforms/ansibleforms-rte-full`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms-rte-full) für die RTE.

Der Seed fügt die RTE unter **Verbindungen > Runner** als Runner `rte` hinzu, den Standard-Runner, sodass Playbook-Formulare ohne weitere
Einrichtung darauf laufen. Die App legt das Schema beim ersten Start an und verbindet sich mit der RTE, sobald beide laufen (eine Beispiel-`config.yaml` liegt im
[docker-compose-Projekt](https://github.com/ansibleforms/docker/blob/main/data/config.yaml)):

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

Nach dem Start sind beide Container aufgeführt:

```bash
docker ps
CONTAINER ID   IMAGE                                          COMMAND                  CREATED          STATUS                    PORTS                    NAMES
5c0e2a91d7f4   ghcr.io/ansibleforms/ansibleforms-rte-full:7   "/usr/bin/tini -- no…"   10 seconds ago   Up 9 seconds (healthy)                             rte
d91f7b05b67e   ghcr.io/ansibleforms/ansibleforms:7            "/usr/bin/tini -- no…"   2 minutes ago    Up 2 minutes (healthy)    0.0.0.0:8000->8000/tcp   ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman nimmt dieselben Optionen und braucht keinen Dienst:

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

Nach dem Start sind beide Container aufgeführt:

```bash
podman ps
```

</div>
</div>

Die App lauscht auf Port `8000`, über HTTP, sofern Sie nicht `HTTPS=1` setzen. Die RTE wird nicht auf dem Host veröffentlicht: nur die App verbindet sich mit ihr, innerhalb
des Netzwerks. `--stop-timeout 30` gibt der RTE beim Stoppen Zeit, ihre laufenden Playbooks zu Ende laufen zu lassen (siehe
[Eine RTE betreiben](../rte/run.html) für die RTE-Einstellungen und für den Bau einer eigenen RTE).

---

## Die Anwendung testen

Sobald die Container laufen, öffnen Sie AnsibleForms im Browser:

* Öffnen Sie `http://your_ip:8000` (oder HTTPS, wenn Sie `HTTPS=1` gesetzt haben)
* Melden Sie sich als `admin` / `AnsibleForms!123` an (oder mit dem Passwort, das Sie mit `ADMIN_PASSWORD` gesetzt haben), und wählen Sie ein neues Passwort
* Prüfen Sie unter **Verbindungen > Runner**, dass die RTE als `rte` aufgeführt ist, der Standard-Runner, und dass ihre Seite die
  **Verbindung** als **Verbunden** zeigt
* Nächste Schritte:
  * Erstellen Sie Formulare, indem Sie YAML-Dateien in den Ordner `forms` legen oder den eingebauten Designer verwenden
  * Legen Sie Ihre Playbooks in den Ordner `playbooks` des eingehängten persistenten Ordners
  * Fügen Sie eine LDAP-Verbindung hinzu
  * Fügen Sie Benutzer und Gruppen hinzu
  * Fügen Sie Runner für Vorlagenformulare hinzu: AWX, AAP oder Ascender, Semaphore, Rundeck oder Jenkins
  * Fügen Sie Anmeldedaten für externe Verbindungen hinzu, etwa andere MySQL-Server oder REST-APIs, oder um sie an Ansible-Playbooks zu übergeben
