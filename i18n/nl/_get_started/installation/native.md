---
layout: default
title: Native
parent: Installatie
nav_order: 2
translated_from: eab01cbd3bc313b6a4cfd2b87dbcb2ac99408b78
---

# Native installatie
{: .no_toc }

AnsibleForms direct op de server, zonder containers, als systemd-services die het installatieprogramma opzet
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders van servers waarop containers niet zijn toegestaan: het [installatieprogramma](installer.html) installeert alles wat AnsibleForms nodig heeft op
de server zelf, en upgradet en verwijdert het daarna. Het installeert AnsibleForms 7.3.0 of later.

---

## Wat het nodig heeft

Kies **Direct op deze server, zonder containers** bij de stap **Engine** van het installatieprogramma, of geef `--mode native` mee. Het heeft nodig:

* **Root** : start het installatieprogramma met `sudo` (`curl -fsSL https://ansibleforms.com/install | sudo sh`)
* **systemd** : de services draaien als systemd-units
* **Een ondersteunde Linux** : Ubuntu, Debian, RHEL en de rebuilds ervan zoals Rocky Linux en AlmaLinux, SUSE Linux Enterprise of openSUSE
* **amd64 of arm64**
* **Internettoegang** : naar de repositories van de distributie, GitHub, nodejs.org en de pakketindexen van Python en Ansible (zie
  [Air-gapped](#air-gapped) voor wat een releasebundel vervangt)

Op een server die hier niet aan voldoet, verschijnt de engine als *Direct op deze server (vereist root: start het met sudo)* of
*Direct op deze server (niet ondersteund op deze Linux)*. Beide rollen installeren op deze manier: een controller, en een [Runner](installer.html#a-runner).

---

## Wat het installeert

Het installatieprogramma installeert deze uit de pakketten van de distributie, voor beide rollen:

| Pakket | Waarom |
|---|---|
| `git` | De repositories |
| De ssh-client | De verbindingen van de playbooks |
| De MariaDB-client | De back-ups van de app: `app.env` zet [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) en [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) op de gevonden client, `mariadb-dump` en `mariadb` of de oudere `mysqldump` en `mysql` |
| `ca-certificates`, `curl`, `tar`, `gzip` | De downloads |
| `libatomic` | Node.js linkt ertegen, en minimale servers missen het |
| `sshpass` | Playbooks die zich met een ssh-wachtwoord aanmelden. Op RHEL en de rebuilds ervan komt het uit EPEL, dat het installatieprogramma met `epel-release` probeert in te schakelen; als het niet kan worden geïnstalleerd, gaat de installatie door en meldt het dat |
| De MariaDB-server | Alleen bij een controller: de database |

Daarna, in de installatiemap, met elke download gecontroleerd tegen de gepubliceerde checksum:

* **AnsibleForms** : de releasebundel `ansibleforms-<version>-linux-<arch>.tar.gz` uit de GitHub-release van de app, de app gebouwd voor
  Node.js. Een versie zonder bundel meldt *Installeren zonder containers vereist AnsibleForms 7.3.0 of hoger.*
* **Node.js** : de nieuwste release van de hoofdversie die de bundel noemt, van nodejs.org
* **Python en Ansible** : uv, en daarmee de Python van de RTE-images en een virtuele omgeving met Ansible en de bibliotheken van
  de volledige RTE-image, en daarna de Ansible-collections ervan (zie [De RTE-images](../rte/images.html)). Dit duurt een paar minuten
* **De startbestanden** : de formulieren, playbooks en instellingen uit de map `data` van het
  [docker-compose-project](https://github.com/ansibleforms/docker), zoals een nieuwe Docker Compose-installatie ze krijgt. Een Runner houdt alleen zijn Ansible-configuratie en ssh- en git-instellingen

Voor een controller maakt het daarna het schema `AnsibleForms` in MariaDB aan, en een databasegebruiker met de naam van de instantie, met alle rechten op dat
schema en nergens anders, die zich alleen vanaf deze server aanmeldt.

---

## De map

Alles staat in de installatiemap, standaard `/opt/ansibleforms` (of `/opt/ansibleforms-runner` voor een Runner):

| Pad | Wat het bevat |
|---|---|
| `releases/<version>/` | Een release: de bundel, de link naar Node.js, de virtuele Python-omgeving en de collections |
| `current` | De link naar de release die draait; een upgrade verplaatst hem, en een rollback ook |
| `runtime/` | Node.js, uv en Python, gedeeld door de releases |
| `data/` | Wat de containers koppelen als `/app/dist/persistent`: formulieren, playbooks, `config.yaml`, de config seed, certificaten en logs |
| `home/` | De homemap van de systeemgebruiker: `.ssh` en `.gitconfig`, gelinkt aan `data/ssh` en `data/git` |
| `app.env`, `rte.env` | De instellingen en secrets van de services, alleen leesbaar voor root en de systeemgebruiker. Die van de RTE bevat geen database-instellingen |
| `installer-backups/` | De databaseback-ups die het installatieprogramma maakt, vóór een upgrade of met `backup` |

De releases en de runtimes zijn van root, zodat de services hun eigen code niet kunnen wijzigen; `data/` en `home/` zijn van de systeemgebruiker.
De databasebestanden zelf worden door MariaDB bewaard, buiten de map.

---

## De services

Een controller draait twee systemd-services, een Runner één. Elke service draait als een systeemgebruiker met de naam van de instantie (standaard `ansibleforms`),
vanuit `current/server`, met zijn instellingenbestand:

| Service | Wat hij draait | Instellingen |
|---|---|---|
| `<name>` | De app: de webinterface, de API en de worker. Alleen bij een controller | `app.env` |
| `<name>-rte` | De RTE die de playbooks uitvoert | `rte.env` |

De RTE van een controller is `inbound` op een eigen poort op `127.0.0.1` (`8001`, of de eerstvolgende vrije, met
[`LISTEN_HOST`](../customization/server.html#env_LISTEN_HOST)`=127.0.0.1`), voert de playbooks uit vanuit de mappen van de app (`RTE_FILES=local`),
en wordt door de config seed `data/seed.yaml` als standaardrunner gedeclareerd.

De RTE van een Runner krijgt de modus, `APP_URL`, `RTE_NAME` en, met `--join`, het jointoken, en ontvangt de playbooks bij elke job (zie
[Modi](../rte/modes.html)). Een uitgaande RTE krijgt geen aanroepen van de app, dus luistert hij alleen op `127.0.0.1` (`LISTEN_HOST=127.0.0.1`).
Een inkomende serveert HTTPS met een zelfondertekend certificaat voor zijn eigen adres in `data/certificates`, dat AnsibleForms pint.
Zonder jointoken vraagt hij om aan te sluiten, en een beheerder keurt hem goed onder **Verbindingen > Runners**.

Ze starten bij het opstarten en herstarten na een storing. Beheer ze en lees hun logs met de eigen tools van systemd:

```bash
sudo systemctl status ansibleforms ansibleforms-rte
sudo systemctl restart ansibleforms
sudo journalctl -u ansibleforms -f
sudo journalctl -u ansibleforms-rte -f
```

De app mag zonder root op een poort onder 1024 luisteren, zoals `443`. De RTE behoudt het recht om `sudo` te gebruiken, wat playbooks met
`become` op deze server nodig hebben, zodat een playbook de server kan beheren waarop de RTE draait.

---

## Upgraden en terugdraaien

`sudo /usr/local/bin/ansibleforms-installer upgrade` upgradet een native installatie zoals de andere (zie [Upgraden](installer.html#upgrade)), in
deze volgorde:

1. Zet de nieuwe release klaar naast de release die draait: de bundel, Node.js, Python, Ansible en de collections. De draaiende
   services worden nog niet aangeraakt
2. Voegt de nieuwe startbestanden toe die de release meebrengt, en behoudt elk bestaand bestand
3. Maakt een back-up van de database (bij een controller) in `installer-backups/`, met een kopie van `app.env` en `rte.env`
4. Stopt de services, laat `current` naar de nieuwe release wijzen, en start ze weer
5. Wacht tot de app antwoordt met de nieuwe versie (bij een Runner: tot zijn RTE weer luistert)

Als de nieuwe versie niet antwoordt, biedt het installatieprogramma aan terug te draaien: `current` wijst weer naar de vorige release, de
database wordt uit de back-up hersteld, en de services starten. Alleen de draaiende release en de release daarvoor worden bewaard.

Native services in de indeling van het installatieprogramma zonder `installer.json` ernaast, bijvoorbeeld nadat dat bestand is verwijderd, worden gevonden door `install`
en `upgrade`, die aanbieden ze over te nemen (zie [Een bestaande installatie](installer.html#an-existing-installation)).

---

## Verwijderen

`sudo /usr/local/bin/ansibleforms-installer uninstall` stopt en verwijdert de services. Het houdt de map en de database, tenzij je ervoor kiest
de gegevens te verwijderen (of `--purge` meegeeft), en de naam van de instantie typt om te bevestigen. Dan verwijdert het ook de database en de gebruiker ervan (bij een controller),
wist het de map en verwijdert het de systeemgebruiker.

De pakketten blijven geïnstalleerd, MariaDB ook: andere software kan ze gebruiken.

---

## Air-gapped

`--bundle` installeert vanuit een releasebundel die je naar de server hebt gekopieerd, in plaats van hem van GitHub te downloaden. Neem het bestand voor de
architectuur, `ansibleforms-<version>-linux-amd64.tar.gz` of `-arm64`, uit de [Releases](https://github.com/ansibleforms/ansibleforms/releases) van de app:

```bash
sudo /usr/local/bin/ansibleforms-installer install --mode native --bundle /tmp/ansibleforms-7.3.0-linux-amd64.tar.gz
```

`--source` doet hetzelfde voor de startbestanden, vanuit een lokale kopie van de repository [ansibleforms/docker](https://github.com/ansibleforms/docker).
Node.js, Python met de pakketten en de Ansible-collections worden tijdens de installatie nog steeds gedownload.
