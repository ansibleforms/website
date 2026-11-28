---
layout: default
title: Aus dem Quellcode
parent: Installation
nav_order: 5
translated_from: 5a30cd6f93473aa6d47bf91aabbe13af37d97127
---

# Aus dem Quellcode
{: .no_toc }

AnsibleForms aus dem Quellcode bauen und mit Node.js betreiben
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wie der Code aufgebaut ist

Das Repository enthält zwei Node.js-Anwendungen, die ein Build zu einer zusammenführt:

* **client** : die Weboberfläche, in Vue 3 geschrieben und mit Vite zu statischen Dateien gebaut
* **server** : die API, in Express geschrieben. Sie übergibt die Jobs an Runner, verbindet sich mit der Datenbank und liefert den gebauten Client aus.
  Mit `AF_ROLE=rte` gestartet, ist derselbe Server die RTE (Laufzeitumgebung), die die Playbooks ausführt

Nur der Client wird gebaut; seine Ausgabe landet im Ordner `views` des Servers, wie im [Docker-Image](https://github.com/ansibleforms/ansibleforms/blob/main/Dockerfile).

---

## Voraussetzungen

Bauen und Betreiben aus dem Quellcode erfordert solide Linux-Kenntnisse und etwas Wissen über Node.js. Sie installieren jede Komponente selbst. Um
AnsibleForms ohne Container und ohne eigenen Build zu betreiben, erledigt die [native Installation](native.html) des Installers all das für Sie:

* **Node.js 26** (die Version in `.nvmrc`; mindestens 24), mit npm
* **Git**, um den Code zu holen und Repositories zu synchronisieren
* **OpenSSH-Client**, für Git über SSH, und **sshpass**, für Playbooks, die sich mit einem SSH-Passwort verbinden
* **MariaDB-Client** (`mariadb`, `mariadb-dump`), für Backups und Wiederherstellungen, auch bei einem MySQL-Server
* **MySQL 8+ oder MariaDB**, vom Server aus erreichbar
* **Ansible**, für den RTE-Prozess, der die Playbooks ausführt (`ansible-playbook` im Pfad). Der App-Prozess selbst braucht weder
  Ansible noch Python, und mit ausschließlich Vorlagenformularen (AWX, AAP, Ascender und die anderen Runner) brauchen Sie gar keine RTE

Installieren Sie sie für Ihre Distribution:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Node.js 26 kommt aus dem NodeSource-Repository, die anderen Werkzeuge aus Ubuntu selbst:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Node.js 26 kommt aus dem NodeSource-Repository, die anderen Werkzeuge aus Debian selbst:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

Node.js kommt von NodeSource und `sshpass` aus EPEL (auf RHEL selbst aktivieren Sie EPEL, wie Red Hat es beschreibt):

```bash
curl -fsSL https://rpm.nodesource.com/setup_26.x | sudo bash -
sudo dnf install -y epel-release
sudo dnf install -y nodejs git openssh-clients sshpass mariadb python3 python3-pip ansible-core
```

</div>
</div>

Prüfen Sie `node --version` (26) und `ansible-playbook --version`; für die Datenbank und ihren Benutzer siehe [MySQL installieren](docker.html#install-mysql).

---

## Den Code holen

Klonen Sie das Repository in einen Ordner Ihrer Wahl, der dem Benutzer gehört, der die Anwendung betreiben wird. Die Beispiele verwenden `/srv/apps/ansibleforms`:

```bash
sudo mkdir -p /srv/apps
sudo chown $USER /srv/apps
cd /srv/apps
git clone https://github.com/ansibleforms/ansibleforms.git
cd ansibleforms
```

---

## Bauen

Bauen Sie in drei Schritten, vom Repository-Ordner aus. Bauen Sie zuerst den Client:

```bash
cd client
npm ci
npm run build
```

Installieren Sie dann die Abhängigkeiten des Servers:

```bash
cd ../server
npm ci --omit=dev
```

Kopieren Sie zuletzt den gebauten Client in den Ordner `views` des Servers:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

---

## Konfigurieren

Der Server liest seine Einstellungen aus Umgebungsvariablen und, in Produktion, zusätzlich aus `server/persistent/.env`, der Datei,
in die die Einstellungsseiten schreiben.

Gehen Sie von der Beispieldatei im Wurzelverzeichnis des Repositorys aus und setzen Sie mindestens die MySQL-Verbindung (`DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`):

```bash
cd /srv/apps/ansibleforms/server
mkdir -p persistent
cp ../.env.example persistent/.env
```

Alle Variablen sind unter [Umgebungsvariablen](../customization) beschrieben. Alles andere wird standardmäßig in `server/persistent` gespeichert:
`config.yaml`, der Ordner `forms` und selbstsignierte Zertifikate werden dort beim ersten Start angelegt, neben den Protokollen.
Legen Sie Ihre Playbooks in `server/persistent/playbooks` ab, oder lassen Sie `ANSIBLE_PATH` in der Umgebung der RTE, die es liest, auf einen anderen Ort zeigen.

---

## Ausführen

Betreiben Sie AnsibleForms in Produktion oder im Entwicklungsmodus, um am Code selbst zu arbeiten:

<div class="af-tabs" data-tab-group="mode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="production" aria-selected="true">Produktion</button>
<button type="button" role="tab" class="af-tab" data-tab="development" aria-selected="false">Entwicklung</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="production" markdown="1">

Starten Sie den Server im Produktionsmodus aus dem Ordner `server`:

```bash
cd /srv/apps/ansibleforms/server
npm run start
```

Eine von der Kommandozeile gestartete Anwendung stoppt, wenn Sie sich abmelden. [PM2](https://pm2.keymetrics.io/) hält sie im
Hintergrund am Laufen, startet sie nach einem Absturz neu und startet sie beim Booten wieder:

```bash
sudo npm install -g pm2

cd /srv/apps/ansibleforms/server
NODE_ENV=production pm2 start index.js --name ansibleforms
pm2 save
pm2 startup   # prints the command that starts PM2 at boot
```

Playbooks laufen auf einer RTE: starten Sie denselben Server ein zweites Mal mit `AF_ROLE=rte`, auf einem eigenen Port. Die App verbindet sich mit ihr und hält
einen WebSocket offen (`RTE_MODE=inbound`, siehe [Modi](../rte/modes.html)), und sie führt die Playbooks aus denselben Ordnern aus
(`RTE_FILES=local`). Sie liest ebenfalls `persistent/.env`, verwendet aber keine der Datenbankeinstellungen daraus. Fügen Sie das Token, das App und RTE teilen,
mindestens 16 Zeichen, und den Konfigurations-Seed, der die RTE deklariert, zu `persistent/.env` hinzu:

```bash
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/srv/apps/ansibleforms/server/persistent/seed.yaml
```

Der [Konfigurations-Seed](../seed/) deklariert RTE-Anmeldedaten mit der Adresse der RTE und ihrem Token sowie den Standard-Runner `rte`, der sich
damit anmeldet:

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

Ohne Seed fügen Sie sie unter **Verbindungen > Anmeldedaten** (RTE-Anmeldedaten mit dieser Adresse und dem Token) und
**Verbindungen > Runner** (Typ RTE, **Modus** **Eingehend**) hinzu. Starten Sie dann die RTE, nur auf `127.0.0.1`:

```bash
cd /srv/apps/ansibleforms/server
AF_ROLE=rte RTE_MODE=inbound RTE_FILES=local PORT=8010 HTTPS=0 LISTEN_HOST=127.0.0.1 \
  NODE_ENV=production pm2 start index.js --name ansibleforms-rte
pm2 save
```

Die RTE-Einstellungen sind auf der Seite [Eine RTE betreiben](../rte/run.html) beschrieben. Prüfen Sie, dass PM2 beide Prozesse aufführt:

```bash
pm2 status
```

Beide sind `online`:

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

Um am Code selbst zu arbeiten, starten Sie alles aus dem Wurzelverzeichnis des Repositorys mit Live-Reload: den Server auf Port 3001, eine RTE auf Port 8010
und den Client auf `https://localhost:8443`. In diesem Modus lesen Server und RTE stattdessen `server/.env.development`:

```bash
cd /srv/apps/ansibleforms
npm install
(cd server && npm install && cp ../.env.example .env.development)
(cd client && npm install)
npm run dev
```

Die RTE (`npm run dev:rte`) braucht `ansible-playbook` im Pfad und trägt sich selbst als Runner im Datenbankmodus ein, der veraltet ist und nur
für die Entwicklung gedacht; `npm run dev:local` startet Client und Server ohne sie. Der [Leitfaden für Beiträge](https://github.com/ansibleforms/ansibleforms/blob/main/CONTRIBUTING.md) beschreibt die auszuführenden Tests und Prüfungen.

</div>
</div>

---

## Erster Start

Öffnen Sie den Server im Browser (mit der Beispiel-`.env` unter `https://your_ip:8443`). Bei einer leeren Datenbank wird das Schema beim
ersten Start angelegt.

Die Standard-Anmeldedaten des Administrators sind:

* Benutzername : `admin`
* Passwort : `AnsibleForms!123`
