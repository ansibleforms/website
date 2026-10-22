---
layout: default
title: Vereisten
nav_order: 5
translated_from: 730eff82a2f1ae75eaf5d1cb57f10f6e1019d14b
---

# Vereisten
{: .no_toc }

Wat je nodig hebt voordat je AnsibleForms installeert
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Runtime

AnsibleForms draait als container, als systemd-services op de server zelf of, voor wie het zelf bouwt, als Node.js-applicatie:

| Installatie | Je hebt nodig |
|---|---|
| [Installatieprogramma](installation/installer.html) | Linux op amd64 of arm64, `curl` of `wget` en `sha256sum`, en wat de engine nodig heeft waarop het installeert (hieronder) |
| [Native](installation/native.html) | Root, systemd en een ondersteunde Linux (Ubuntu, Debian, RHEL en de rebuilds ervan, SUSE); het installatieprogramma installeert de rest |
| [Docker](installation/docker.html) | Docker of Podman, en een eigen MySQL-server |
| [Docker Compose](installation/docker-compose.html) | Docker Compose of podman-compose; het project start ook MySQL |
| [Kubernetes](installation/kubernetes.html) | Een cluster, Helm 3 en een StorageClass (of vooraf aangemaakte PersistentVolumes) |
| [Vanuit de broncode](installation/from-source.html) | Node.js 26 (minstens 24) met npm, Git, en Ansible voor het RTE-proces dat de playbooks uitvoert |

De app-image, `ghcr.io/ansibleforms/ansibleforms`, bevat Node.js en de tools die de server aanroept (git, ssh, de mariadb-client en
ytt), maar geen Python en geen Ansible. Playbooks draaien op een RTE (runtime-omgeving), een tweede container van
`ghcr.io/ansibleforms/ansibleforms-rte-full`, of van een image die je op `ansibleforms-rte-core` bouwt (zie [Schalen](rte/)).
Formulieren die alleen templates starten op AWX, AAP, Ascender, Semaphore, Rundeck of Jenkins hebben geen RTE nodig.

---

## Database

AnsibleForms slaat zijn jobs, gebruikers, referenties en verbindingen op in MySQL 8 of later, of in MariaDB.

Bij de eerste start maakt het zelf het schema `AnsibleForms` aan. Geef het een eigen databasegebruiker, met rechten op alleen dat schema,
niet root:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

Meer heeft het niet nodig: het maakt en patcht het schema, maakt zijn back-ups en beëindigt, met meerdere workers, de sessie van een dode worker.
De pagina **Status** en het log waarschuwen als de gebruiker rechten op alle databases heeft. De app-nodes en de workers verbinden met deze
gebruiker. Een RTE in een socketmodus (uitgaand of inkomend, zie [Modi](rte/modes.html)) bevat geen database-inloggegevens: alleen een RTE in databasemodus,
verouderd sinds 7.3.0, maakt ook verbinding. Om het schema zelf aan te maken, zet je [`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) op `0`.
Het Docker Compose-project en de Helm-chart (die `mysql:8.4` gebruikt) starten een database voor je.

---

## Dimensionering

Er zijn geen gemeten vereisten: de belasting hangt vooral af van hoeveel jobs tegelijk draaien en hoeveel uitvoer ze schrijven.
De standaardresources van de Helm-chart zijn een redelijk startpunt voor een klein team:

| Onderdeel | Requests | Limits | Volume |
|---|---|---|---|
| AnsibleForms | 1 CPU, 1 GiB geheugen | 4 CPU, 4 GiB geheugen | 10 GiB |
| MySQL | 0,5 CPU, 512 MiB geheugen | 2 CPU, 2 GiB geheugen | 10 GiB |

De app-container draait geen playbook. Elk playbook is een `ansible-playbook`-proces, met zijn forks, op een RTE: dimensioneer de CPU en
het geheugen van elke RTE voor de playbooks die hij tegelijk draait, hooguit [`RTE_MAX_JOBS`](customization/server.html#env_RTE_MAX_JOBS) (standaard `10`), en draai meer
RTE's om meer te draaien. Jobs die op AWX, AAP, Ascender of de andere templaterunners draaien, kosten AnsibleForms weinig.

De uitvoer van jobs wordt standaard voor altijd in de database bewaard. Stel [`JOB_RETENTION_DAYS`](customization/retention.html#env_JOB_RETENTION_DAYS)
in op een drukke instantie om te voorkomen dat de database onbeperkt groeit.

---

## Netwerk

De app en elke RTE luisteren op een eigen poort, en openen uitgaande verbindingen naar de systemen die je formulieren en instellingen gebruiken.

### Inkomend
{: .no_toc }

De server luistert op poort `8000` ([`PORT`](customization/server.html#env_PORT)), over HTTP of, met
[`HTTPS`](customization/server.html#env_HTTPS) op `1`, over HTTPS. Het Docker Compose-project publiceert hem op poort 443,
en de Helm-chart biedt hem aan via een service of een ingress. Een RTE luistert ook op zijn eigen `PORT`, maar alleen de app roept hem aan:
houd hem van het publieke netwerk af. Een uitgaande RTE heeft helemaal geen inkomende poort nodig: hij belt de app aan op de poort van de app.

### Uitgaand
{: .no_toc }

Open de verbindingen van AnsibleForms naar de systemen die je gebruikt:

| Bestemming | Gebruikt voor |
|---|---|
| MySQL / MariaDB | De database van AnsibleForms (`DB_HOST`, `DB_PORT`, standaard `3306`) |
| De RTE | Een inkomende RTE aanbellen op het adres van zijn runner over één WebSocket, of een RTE in databasemodus aanroepen op zijn [`RTE_URL`](customization/server.html#env_RTE_URL), die dan zelf verbinding maakt met MySQL; een uitgaande RTE belt in plaats daarvan de app aan (zie [Modi](rte/modes.html)) |
| AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | Templates en jobs starten en volgen op [runners](runners.html), via hun HTTP(S)-API |
| De beheerde hosts | Playbooks maken er vanaf de RTE verbinding mee, bijvoorbeeld over SSH of WinRM |
| LDAP, Entra ID, OIDC | Aanmelden met directory- of single sign-on-accounts |
| Git-servers | Repositories clonen en pullen, over HTTPS of SSH |
| REST API's en databases | De gegevensbronnen van expressies en queries in je formulieren |
| HashiCorp Vault, CyberArk | Referenties lezen uit een [secret store](secret-stores/) |
| Mailservers, Slack, Teams, Telegram, webhooks | Jobmeldingen en goedkeuringsverzoeken, via de [meldingskanalen](notification-channels.html) |
| Modelprovider | De [chat-assistent](chat/), alleen als die is ingeschakeld |

Om te beperken welke hosts de REST-functies van expressies mogen aanroepen, zie
[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) en
[`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS).

---

## Browser

De webapplicatie is gebouwd voor actuele browsers: Chrome of Edge 111, Firefox 114, Safari 16.4 of nieuwer.
Oudere browsers worden niet ondersteund.

---

## Schalen

Standaard draait één AnsibleForms-container de webapp en het achtergrondwerk samen, naast één RTE.

Om meer gebruikers te bedienen, draai je meerdere app-nodes achter een load balancer (`AF_ROLE=app`) naast een worker (`AF_ROLE=worker`), die de
planningen, de back-ups en het andere achtergrondwerk uitvoert; er werkt maar één worker tegelijk, en een tweede wacht om het over te nemen. Ze delen
de database, de persistente map, `ACCESS_TOKEN_SECRET` en `ENCRYPTION_SECRET`. Zie [Schalen](production/scaling.html). Draai meer
RTE's om meer playbooks tegelijk te draaien: zie [Meerdere RTE's](rte/several.html).
