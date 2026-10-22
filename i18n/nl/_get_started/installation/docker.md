---
layout: default
title: Docker
parent: Installatie
nav_order: 3
translated_from: d178cc481311c66fba52c62ac7bf5841b5f83316
---

# Docker
{: .no_toc }

Draai de images van de AnsibleForms-app en de RTE met Docker of Podman, naast een eigen MySQL-server
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Je kunt AnsibleForms met Docker of Podman draaien als twee containers, de app en de RTE die de playbooks uitvoert, verbonden met een MySQL-database.

---

## Vereisten

Voordat je begint, heb je nodig:

* **Docker of Podman** : een van beide geïnstalleerd en actief
* **MySQL** : geïnstalleerd en actief

---

## Installeer MySQL

Installeer MySQL 8+, of MariaDB, op een Linux-server die de container kan bereiken:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Ubuntu levert MySQL 8 mee:

```bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Debian levert MariaDB mee in plaats van MySQL, en dat ondersteunt AnsibleForms ook:

```bash
sudo apt-get update
sudo apt-get install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mariadb-secure-installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

RHEL 8 en later, en de rebuilds ervan, leveren MySQL 8 mee in AppStream:

```bash
sudo dnf install -y mysql-server
sudo systemctl enable --now mysqld
sudo mysql_secure_installation
```

</div>
</div>

AnsibleForms maakt via het netwerk verbinding met de database, als `DB_USER` met `DB_PASSWORD`. Geef het een eigen gebruiker, met rechten op
alleen het schema `AnsibleForms`, niet root:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

Meer heeft AnsibleForms niet nodig: daarmee maakt en patcht het zijn schema en maakt het zijn back-ups. De pagina **Status** en het log
waarschuwen als de gebruiker rechten op alle databases heeft. Op Ubuntu en Debian luistert de server alleen op localhost: stel `bind-address` in de
configuratie ervan in zodat de containers hem kunnen bereiken.

---

## Bereid de mappen voor

AnsibleForms 7 draait in twee containers: de app, en de RTE (runtime-omgeving) die de playbooks uitvoert. Beide koppelen een map voor
je `config.yaml`, formulieren, playbooks, logs en certificaten, en een map voor de SSH-sleutel. De images draaien als de gebruiker `node` (uid 1000),
dus maak die gebruiker eigenaar van beide mappen:

```bash
sudo mkdir -p /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
```

Zet de instellingen van de app in een omgevingsbestand: de databaseverbinding,
[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) voordat je ook maar één referentie opslaat, het token dat de app en de
RTE delen ([`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN), minstens 16 tekens) en de config seed die de RTE declareert:

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

De RTE krijgt een eigen bestand, zonder de instellingen van de database: sinds 7.3.0 belt de app hem aan en houdt één WebSocket open
(`RTE_MODE=inbound`, zie [Modi](../rte/modes.html)), en hij voert de playbooks uit vanuit dezelfde mappen (`RTE_FILES=local`):

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

De [config seed](../seed/) declareert een RTE-referentie met het adres en het token van de RTE, en de standaardrunner `rte` die zich
daarmee aanmeldt:

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

## Start de containers

Draai de gepubliceerde images uit de GitHub Container Registry (zie [Image-tags](./#image-tags)):
[`ghcr.io/ansibleforms/ansibleforms`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms) voor de app en
[`ghcr.io/ansibleforms/ansibleforms-rte-full`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms-rte-full) voor de RTE.

De seed voegt de RTE onder **Verbindingen > Runners** toe als de runner `rte`, de standaardrunner, zodat playbookformulieren er zonder verdere
instellingen op draaien. De app maakt het schema bij de eerste start aan, en belt de RTE aan zodra beide draaien (een voorbeeld-`config.yaml` staat in het
[docker-compose-project](https://github.com/ansibleforms/docker/blob/main/data/config.yaml)):

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

Eenmaal gestart staan beide containers in de lijst:

```bash
docker ps
CONTAINER ID   IMAGE                                          COMMAND                  CREATED          STATUS                    PORTS                    NAMES
5c0e2a91d7f4   ghcr.io/ansibleforms/ansibleforms-rte-full:7   "/usr/bin/tini -- no…"   10 seconds ago   Up 9 seconds (healthy)                             rte
d91f7b05b67e   ghcr.io/ansibleforms/ansibleforms:7            "/usr/bin/tini -- no…"   2 minutes ago    Up 2 minutes (healthy)    0.0.0.0:8000->8000/tcp   ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman neemt dezelfde opties en heeft geen service nodig:

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

Eenmaal gestart staan beide containers in de lijst:

```bash
podman ps
```

</div>
</div>

De app luistert op poort `8000`, over HTTP tenzij je `HTTPS=1` instelt. De RTE wordt niet op de host gepubliceerd: alleen de app belt hem aan, binnen
het netwerk. `--stop-timeout 30` geeft de RTE bij een stop de tijd om lopende playbooks af te laten ronden (zie
[Een RTE draaien](../rte/run.html) voor de RTE-instellingen en voor het bouwen van een eigen RTE).

---

## Test de applicatie

Zodra de containers draaien, open je AnsibleForms in een browser:

* Open `http://your_ip:8000` (of HTTPS, als je `HTTPS=1` hebt ingesteld)
* Meld je aan als `admin` / `AnsibleForms!123` (of met het wachtwoord dat je met `ADMIN_PASSWORD` hebt ingesteld), en kies een nieuw wachtwoord
* Controleer onder **Verbindingen > Runners** dat de RTE in de lijst staat als `rte`, de standaardrunner, en dat zijn pagina bij
  **Verbinding** de status **Verbonden** toont
* Volgende stappen:
  * Maak formulieren door YAML-bestanden aan de map `forms` toe te voegen of met de ingebouwde designer
  * Zet je playbooks in de map `playbooks` van de gekoppelde persistente map
  * Voeg een LDAP-verbinding toe
  * Voeg gebruikers en groepen toe
  * Voeg runners toe voor templateformulieren: AWX, AAP of Ascender, Semaphore, Rundeck of Jenkins
  * Voeg referenties toe voor externe verbindingen, zoals andere MySQL-servers of REST API's, of om aan Ansible-playbooks door te geven
