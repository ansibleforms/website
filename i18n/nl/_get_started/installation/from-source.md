---
layout: default
title: Vanuit de broncode
parent: Installatie
nav_order: 5
translated_from: 5a30cd6f93473aa6d47bf91aabbe13af37d97127
---

# Vanuit de broncode
{: .no_toc }

Bouw AnsibleForms vanuit de broncode en draai het met Node.js
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Hoe de code is georganiseerd

De repository bevat twee Node.js-applicaties, en een build voegt ze samen tot één:

* **client** : de webinterface, geschreven in Vue 3 en met Vite gebouwd tot statische bestanden
* **server** : de API, geschreven in Express. Die geeft de jobs door aan runners, maakt verbinding met de database en serveert de gebouwde client.
  Gestart met `AF_ROLE=rte` is dezelfde server de RTE (runtime-omgeving) die de playbooks uitvoert

Alleen de client wordt gebouwd; de uitvoer daarvan gaat naar de map `views` van de server, zoals in de [Docker-image](https://github.com/ansibleforms/ansibleforms/blob/main/Dockerfile).

---

## Vereisten

Bouwen en draaien vanuit de broncode vraagt goede Linux-kennis en enige kennis van Node.js. Je installeert elk onderdeel zelf. Wil je
AnsibleForms zonder containers en zonder het zelf te bouwen draaien, dan doet de [native installatie](native.html) van het installatieprogramma dit allemaal voor je:

* **Node.js 26** (de versie in `.nvmrc`; minstens 24), met npm
* **Git**, om de code op te halen en repositories te synchroniseren
* **OpenSSH-client**, voor git over SSH, en **sshpass**, voor playbooks die met een SSH-wachtwoord verbinden
* **MariaDB-client** (`mariadb`, `mariadb-dump`), voor back-ups en herstel, ook bij een MySQL-server
* **MySQL 8+ of MariaDB**, bereikbaar vanaf de server
* **Ansible**, voor het RTE-proces dat de playbooks uitvoert (`ansible-playbook` in het path). Het app-proces zelf heeft geen
  Ansible en geen Python nodig, en met alleen templateformulieren (AWX, AAP, Ascender en de andere runners) heb je helemaal geen RTE nodig

Installeer ze voor je distributie:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Node.js 26 komt uit de NodeSource-repository, de andere tools uit Ubuntu zelf:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Node.js 26 komt uit de NodeSource-repository, de andere tools uit Debian zelf:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

Node.js komt van NodeSource en `sshpass` uit EPEL (op RHEL zelf schakel je EPEL in zoals Red Hat het beschrijft):

```bash
curl -fsSL https://rpm.nodesource.com/setup_26.x | sudo bash -
sudo dnf install -y epel-release
sudo dnf install -y nodejs git openssh-clients sshpass mariadb python3 python3-pip ansible-core
```

</div>
</div>

Controleer `node --version` (26) en `ansible-playbook --version`; voor de database en de gebruiker ervan, zie [Installeer MySQL](docker.html#install-mysql).

---

## Haal de code op

Clone de repository in een map naar keuze, eigendom van de gebruiker die de applicatie gaat draaien. De voorbeelden gebruiken `/srv/apps/ansibleforms`:

```bash
sudo mkdir -p /srv/apps
sudo chown $USER /srv/apps
cd /srv/apps
git clone https://github.com/ansibleforms/ansibleforms.git
cd ansibleforms
```

---

## Bouwen

Bouw in drie stappen, vanuit de map van de repository. Bouw eerst de client:

```bash
cd client
npm ci
npm run build
```

Installeer daarna de afhankelijkheden van de server:

```bash
cd ../server
npm ci --omit=dev
```

Kopieer tot slot de gebouwde client naar de map `views` van de server:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

---

## Configureren

De server leest zijn instellingen uit omgevingsvariabelen en, in productie, ook uit `server/persistent/.env`, het bestand
waarnaar de instellingenpagina's schrijven.

Begin met het voorbeeldbestand in de root van de repository en stel minstens de MySQL-verbinding in (`DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`):

```bash
cd /srv/apps/ansibleforms/server
mkdir -p persistent
cp ../.env.example persistent/.env
```

Alle variabelen worden beschreven onder [Omgevingsvariabelen](../customization). Al het andere wordt standaard in `server/persistent` opgeslagen:
`config.yaml`, de map `forms` en zelfondertekende certificaten worden daar bij de eerste start aangemaakt, naast de logs.
Zet je playbooks in `server/persistent/playbooks`, of laat `ANSIBLE_PATH` ergens anders heen wijzen in de omgeving van de RTE, die het leest.

---

## Draaien

Draai AnsibleForms in productie, of in ontwikkelmodus om aan de code zelf te werken:

<div class="af-tabs" data-tab-group="mode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="production" aria-selected="true">Productie</button>
<button type="button" role="tab" class="af-tab" data-tab="development" aria-selected="false">Ontwikkeling</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="production" markdown="1">

Start de server in productiemodus vanuit de map `server`:

```bash
cd /srv/apps/ansibleforms/server
npm run start
```

Een applicatie die je vanaf de commandoregel start, stopt zodra je je afmeldt. [PM2](https://pm2.keymetrics.io/) houdt haar op de
achtergrond draaiende, herstart haar na een crash en start haar opnieuw bij het opstarten:

```bash
sudo npm install -g pm2

cd /srv/apps/ansibleforms/server
NODE_ENV=production pm2 start index.js --name ansibleforms
pm2 save
pm2 startup   # prints the command that starts PM2 at boot
```

Playbooks draaien op een RTE: start dezelfde server een tweede keer met `AF_ROLE=rte`, op een eigen poort. De app belt hem aan en houdt
één WebSocket open (`RTE_MODE=inbound`, zie [Modi](../rte/modes.html)), en hij voert de playbooks uit vanuit dezelfde mappen
(`RTE_FILES=local`). Hij leest ook `persistent/.env`, maar gebruikt geen van de database-instellingen daarin. Voeg het token dat de app en de RTE delen,
minstens 16 tekens, en de config seed die de RTE declareert, toe aan `persistent/.env`:

```bash
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/srv/apps/ansibleforms/server/persistent/seed.yaml
```

De [config seed](../seed/) declareert een RTE-referentie met het adres en het token van de RTE, en de standaardrunner `rte` die zich
daarmee aanmeldt:

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

Zonder seed voeg je ze toe onder **Verbindingen > Inloggegevens** (een RTE-referentie met dat adres en het token) en
**Verbindingen > Runners** (type RTE, **Modus** **Inkomend**). Start daarna de RTE, alleen op `127.0.0.1`:

```bash
cd /srv/apps/ansibleforms/server
AF_ROLE=rte RTE_MODE=inbound RTE_FILES=local PORT=8010 HTTPS=0 LISTEN_HOST=127.0.0.1 \
  NODE_ENV=production pm2 start index.js --name ansibleforms-rte
pm2 save
```

De RTE-instellingen worden beschreven op de pagina [Een RTE draaien](../rte/run.html). Controleer dat PM2 beide processen toont:

```bash
pm2 status
```

Beide zijn `online`:

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

Om aan de code zelf te werken, start je alles vanuit de root van de repository met live reload: de server op poort 3001, een RTE op poort 8010
en de client op `https://localhost:8443`. In deze modus lezen de server en de RTE in plaats daarvan `server/.env.development`:

```bash
cd /srv/apps/ansibleforms
npm install
(cd server && npm install && cp ../.env.example .env.development)
(cd client && npm install)
npm run dev
```

De RTE (`npm run dev:rte`) heeft `ansible-playbook` in het path nodig, en voegt zichzelf toe als runner in databasemodus, verouderd en alleen
bedoeld voor ontwikkeling; `npm run dev:local` start de client en de server zonder RTE. De [handleiding voor bijdragers](https://github.com/ansibleforms/ansibleforms/blob/main/CONTRIBUTING.md) beschrijft welke tests en controles je moet draaien.

</div>
</div>

---

## Eerste keer starten

Open de server in een browser (met de voorbeeld-`.env`, `https://your_ip:8443`). Op een lege database wordt het schema bij de
eerste start aangemaakt.

De standaard beheerdersgegevens zijn:

* gebruikersnaam : `admin`
* wachtwoord : `AnsibleForms!123`
