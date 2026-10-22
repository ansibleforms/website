---
layout: default
title: Een ander datacenter
parent: RTE
nav_order: 5
translated_from: e2e67586abfd6c910942d1775e5331c1f889727e
---

# Een RTE in een ander datacenter
{: .no_toc }

Van een kale host in een tweede datacenter tot een uitgaande RTE die haar eerste playbook draait
{: .fs-6 .fw-300 }

* TOC
{:toc}

---

Voor beheerders: wanneer de beheerde hosts van een tweede datacenter vanuit een RTE in dat datacenter moeten worden bereikt, niet vanuit het eerste.

{: .note }
> **De makkelijke weg.** Het [installatieprogramma](../installation/installer.html#a-runner) voert elke stap hieronder met één opdracht uit op de RTE-host:
> `curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner`, met `--join afj_...` om haar meteen te laten goedkeuren.
> Dit runbook doet hetzelfde met de hand, met Docker of Podman, zodat je elk onderdeel kunt zien en aanpassen.

---

## Waar je mee eindigt

De app, de worker en de database blijven waar ze zijn, in datacenter 1. Datacenter 2 krijgt een host die één RTE-container in
uitgaande modus draait ([`RTE_MODE=outbound`](../customization/server.html#env_RTE_MODE), zie [Modi](modes.html#outbound)): ze belt de app via
HTTPS en houdt één WebSocket open, wordt lid als eigen runner, en draait de playbooks van de formulieren die haar noemen tegen de beheerde
hosts van datacenter 2.

| Waar | Wat daar draait | Praat met |
|---|---|---|
| Datacenter 1 | De app-nodes, de worker, de database (zoals nu) | Niets nieuws: het neemt de socket van de RTE aan op zijn gebruikelijke HTTPS-adres |
| Datacenter 2, de RTE-host | Docker of Podman, en de RTE-container | De app op `APP_URL` via HTTPS, en de beheerde hosts van datacenter 2 |

De RTE bevat geen databasereferenties en geen `ENCRYPTION_SECRET`, alleen een eigen token. Niets maakt er verbinding mee, dus ze heeft geen open
poort, geen DNS-naam en geen certificaat nodig. De app stuurt de playbooks en de inventories met elke job mee (`RTE_FILES=transfer`, de
standaard), dus de RTE heeft er geen kopie van nodig en geen gedeelde schijf.

Elke opdracht hieronder draait in een terminal op de RTE-host, als een gebruiker met `sudo`, tenzij anders vermeld. Het duurt ongeveer 20 minuten,
waarvan het meeste wachten op de image.

---

## 0. Voordat je begint

Verzamel het volgende:

| Wat | Waar het vandaan komt |
|---|---|
| Het adres van de app | `APP_URL`: het adres dat mensen in een browser openen, zoals `https://forms.example.com`, met het basispad als dat er is |
| Het certificaat van de app | Ondertekend door een publieke CA, een private CA (je hebt het certificaat ervan nodig, stap 6), of zelfondertekend |
| Een proxy | De `HTTPS_PROXY` die dit datacenter gebruikt om datacenter 1 te bereiken, als die er is |
| De naam van de RTE | De naam van haar runner onder **Verbindingen > Runners**, die formulieren noemen met `runner:`, zoals `rte-dc2`: letters, cijfers en `_ . : @ -` |
| Een jointoken | Optioneel: een [jointoken](../runners/registration.html#join-tokens) (`afj_...`) keurt de RTE meteen goed. Zonder jointoken keurt een admin haar goed (stap 8) |
| De ssh-sleutel | De privésleutel die de playbooks gebruiken om de beheerde hosts te bereiken, of het recht om er een aan te maken |

De app moet 7.3.0 of later draaien. Om een jointoken voor deze ene RTE te maken, roept een admin de API één keer aan (zie
[Jointokens](../runners/registration.html#join-tokens)):

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <an admin's token>" -H "Content-Type: application/json" \
  -d '{ "name": "rte-dc2", "expiresInHours": 24, "maxUses": 1 }'
```

---

## 1. De host voorbereiden

De RTE is een container, dus de host heeft een container-engine nodig en verder niets: Node.js, python en ansible zitten in de image.

| Nodig | Waarom |
|---|---|
| Linux op **x86_64** (amd64) | De RTE-images worden alleen voor amd64 gepubliceerd |
| 2 CPU's en 4 GB geheugen, of meer | Eén RTE draait tot [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks tegelijk (10), elk met zijn forks: dimensioneer haar daarvoor |
| 20 GB vrije schijfruimte | De image `-rte-full` is ongeveer 3,3 GB, plus een image tijdens updates, de jobbestanden die de app stuurt en de tijdelijke bestanden van de jobs |
| Docker, of Podman met podman-compose | Om de image te pullen en te draaien |
| De tijd ingesteld via NTP | De tijden van de jobs worden met die van de app vergeleken |

**Docker**, op Ubuntu of Debian (andere distributies: [docs.docker.com/engine/install](https://docs.docker.com/engine/install/)):

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl chrony
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker chrony
sudo usermod -aG docker $USER          # log out and in again, so docker works without sudo
docker run --rm hello-world
docker compose version
```

**Podman**, op RHEL, Rocky of Alma Linux:

```bash
sudo dnf install -y podman podman-compose chrony
sudo systemctl enable --now chronyd
podman run --rm quay.io/podman/hello
```

Schrijf met Podman in elke opdracht hieronder `podman` voor `docker` en `podman-compose` voor `docker compose`.

---

## 2. Netwerk en firewall

De RTE opent elke verbinding zelf. Niets bereikt haar van buitenaf:

| Van | Naar | Poort | Waarom |
|---|---|---|---|
| De RTE-host | De app, op `APP_URL` (via `HTTPS_PROXY` als die is ingesteld) | De poort van de app, `443` achter de meeste proxy's | De socket waarover de jobs, hun bestanden en hun uitvoer gaan |
| De RTE-host | De beheerde hosts van datacenter 2 | ssh (`22`), WinRM, hun API's | De playbooks draaien vanaf hier |
| De RTE-host | `ghcr.io` | `443` | Om de image te pullen, tenzij die uit je eigen registry of een bestand komt (stap 4) |

Open geen inkomende poort voor de RTE. Haar `PORT` (`8000`) bedient alleen `/live`, `/ready` en `/metrics`, voor de probes op deze host.

De RTE belt `APP_URL` met `/api/v2/rte/socket` erachter, als WebSocket. Een reverse proxy voor de app moet de upgrade voor
dat pad doorgeven (zie [Runner-WebSockets](../production/reverse-proxy.html#runner-websockets)). Controleer vanaf hier of de app antwoordt:

```bash
curl -sS https://forms.example.com/api/v2/version
```

---

## 3. Mappen

Alles staat onder `/opt/af-rte`. De RTE draait als de gebruiker `node` (uid 1000), dus haar gegevens horen bij die uid:

```bash
sudo mkdir -p /opt/af-rte/data/{ssh,certificates,ansible/roles,ansible/collections,git}
sudo touch /opt/af-rte/data/ansible/ansible.cfg /opt/af-rte/data/git/.gitconfig
```

| Map | In de container | Bevat |
|---|---|---|
| `data/` | `/app/dist/persistent` | De spool (`rte-spool`: de uitvoer en het einde van elke job tot de app ze heeft opgeslagen), de jobbestanden die de app stuurde (`rte-files`), een private CA, de python-bibliotheken die een playbook installeert |
| `data/ssh/` | `/home/node/.ssh` | De ssh-sleutel en `known_hosts` van de playbooks |
| `data/ansible/` | `/etc/ansible/...` | Een eigen `ansible.cfg`, rollen en collecties, gekoppeld in plaats van ingebouwd |

Houd `data/` op de host: een herstarte RTE verstuurt dan nog wat de app nog niet had opgeslagen, en behoudt haar cache van jobbestanden.

**ssh-sleutel.** Kopieer de sleutel die de playbooks in datacenter 1 gebruiken, of maak er een voor dit datacenter en geef de publieke helft aan de beheerde hosts:

```bash
sudo ssh-keygen -t ed25519 -N "" -C "ansibleforms-rte-dc2" -f /opt/af-rte/data/ssh/id_ed25519
sudo cat /opt/af-rte/data/ssh/id_ed25519.pub      # add it to ~/.ssh/authorized_keys of the managed user on each host
sudo sh -c 'ssh-keyscan host1.dc2.example.com host2.dc2.example.com >> /opt/af-rte/data/ssh/known_hosts'
```

Geef daarna alles aan uid 1000, met de sleutel alleen leesbaar voor de eigenaar:

```bash
sudo chown -R 1000:1000 /opt/af-rte/data
sudo chmod 700 /opt/af-rte/data/ssh && sudo chmod 600 /opt/af-rte/data/ssh/id_*
```

---

## 4. De image

Kies een van de twee.

### Optie A: de officiële image
{: .no_toc }

De gepubliceerde images staan in de GitHub Container Registry, openbaar, zonder aanmelding (zie [Images](images.html) voor de drie lagen).
Neem dezelfde laag als in datacenter 1. `:7` volgt de nieuwste release van 7, zoals de `:7` van de app:

```bash
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Een host zonder internettoegang haalt de image van een host die dat wel heeft:

```bash
# on a host with internet
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
docker save ghcr.io/ansibleforms/ansibleforms-rte-full:7 | gzip > rte-full-7.tar.gz
# copy the file to the RTE host, then there
docker load < rte-full-7.tar.gz
```

Of push haar één keer naar je eigen registry (`docker tag` en `docker push`), en gebruik die naam in de volgende stappen.

### Optie B: je eigen image
{: .no_toc }

Als de playbooks van datacenter 2 collecties of python-bibliotheken nodig hebben die de officiële image mist (bijvoorbeeld die van VMware voor de vCenter van dit
datacenter), bouw dan op `ansibleforms-rte-core`:

```bash
sudo mkdir -p /opt/af-rte/build
sudo tee /opt/af-rte/build/Dockerfile >/dev/null <<'EOF'
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
# the collections and python libraries these playbooks use : no root needed, both belong to node
RUN ansible-galaxy collection install community.vmware -p /usr/share/ansible/collections \
 && pip install --no-cache-dir pyvmomi
EOF
docker build --pull -t af-rte-dc2 /opt/af-rte/build
```

Bouw haar opnieuw bij elke nieuwe release van de app (zie [Je eigen RTE bouwen](images.html#build-your-own-rte)). Bouw met meerdere RTE-hosts
één keer en push naar je eigen registry. Offline doe je `docker save` en `docker load` met de gebouwde image zoals in optie A.

---

## 5. Instellingen

Een nieuw eigen [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN), minstens 16 tekens. Het is het wachtwoord van deze RTE: de app
bewaart het in de RTE-referentie van de runner, en verzegelt er de geheimen van elke job mee.

```bash
openssl rand -base64 24
```

```bash
sudo tee /opt/af-rte/rte.env >/dev/null <<'EOF'
RTE_MODE=outbound
APP_URL=https://forms.example.com
RTE_NAME=rte-dc2
RTE_TOKEN=<the new token>
# optional, the first time only : approved at once instead of waiting for an admin
RTE_JOIN_TOKEN=<afj_..., or remove this line>
PORT=8000
PYTHONPATH=/app/dist/persistent/python/lib
EOF
sudo chmod 600 /opt/af-rte/rte.env
```

| Variabele | Betekenis |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | `outbound`: de RTE belt de app. Zonder deze variabele start de RTE in de verouderde databasemodus |
| [`APP_URL`](../customization/server.html#env_APP_URL) | Het adres van de app, `http://` of `https://`, met het basispad als dat er is |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | De naam van haar runner. Niet ingesteld: haar node-id, `rte-<hostname>-<port>`, dat met de container verandert |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | Haar eigen token, minstens 16 tekens. Bewaar het: de runner meldt zich er vanaf nu mee aan |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Optioneel: een jointoken, alleen gebruikt zolang haar runner nog niet bestaat of op goedkeuring wacht |

Voeg deze toe als het netwerk ze nodig heeft:

| Variabele | Wanneer |
|---|---|
| `HTTPS_PROXY`, `NO_PROXY` | De RTE bereikt de app via een proxy: `HTTPS_PROXY=http://proxy.dc2.example.com:3128`. Een host die in `NO_PROXY` staat (kommagescheiden, `.example.com` voor een domein) wordt rechtstreeks gebeld |
| `NODE_EXTRA_CA_CERTS` | Het certificaat van de app komt van een private CA: zet het certificaat van de CA in `/opt/af-rte/data/certificates/ca.pem` en stel `NODE_EXTRA_CA_CERTS=/app/dist/persistent/certificates/ca.pem` in |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `0` accepteert elk certificaat van de app, ook een zelfondertekend. Alleen binnen één vertrouwd netwerk: gebruik liever `NODE_EXTRA_CA_CERTS` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (standaard) krijgt de playbooks en inventories met elke job mee. Laat het zo, tenzij je ze zelf op de RTE koppelt (`local`) |

De andere instellingen die een RTE leest, staan op [Een RTE draaien](run.html#settings). `RTE_MAX_JOBS`, `RTE_CACHE_MB`, `RTE_FILES` en
`RTE_DRAIN_SECONDS` kunnen later ook op haar runnerpagina worden ingesteld, wat voorgaat op de variabele (zie
[De instellingen van een RTE](../runners/runner-page.html#an-rtes-settings)).

---

## 6. Haar starten

Een compose-bestand houdt de hele definitie op één plek, naast de instellingen. Zet de image van stap 4 in `image:`:

```bash
sudo tee /opt/af-rte/compose.yml >/dev/null <<'EOF'
services:
  rte:
    image: ghcr.io/ansibleforms/ansibleforms-rte-full:7   # or af-rte-dc2, the image you built
    container_name: af_rte_dc2
    restart: unless-stopped
    # the running playbooks get RTE_DRAIN_SECONDS (25) to finish when the container stops
    stop_grace_period: 40s
    env_file: rte.env
    # the probes, on this host only : nothing connects to an outbound RTE
    ports:
      - "127.0.0.1:8000:8000"
    healthcheck:
      test: ["CMD", "node", "./healthcheck.js"]
      interval: 10s
      timeout: 5s
      retries: 30
      start_period: 30s
    volumes:
      - ./data:/app/dist/persistent
      - ./data/ssh:/home/node/.ssh
      - ./data/git/.gitconfig:/home/node/.gitconfig
      - ./data/ansible/ansible.cfg:/etc/ansible/ansible.cfg
      - ./data/ansible/roles:/etc/ansible/roles
      - ./data/ansible/collections:/etc/ansible/collections
EOF
cd /opt/af-rte && docker compose up -d
```

Docker start haar na een herstart van de host opnieuw (`unless-stopped`). Podman heeft geen daemon die dat doet: schakel `podman-restart.service` in
(`sudo systemctl enable --now podman-restart`), of draai de container als systemd-service met een Quadlet-bestand. Voeg op een host met SELinux
in enforcing-modus `:Z` toe aan elk volume (`./data:/app/dist/persistent:Z`).

Zonder compose, dezelfde container in één opdracht:

```bash
docker run -d --name af_rte_dc2 --restart unless-stopped --stop-timeout 40 \
  --env-file /opt/af-rte/rte.env -p 127.0.0.1:8000:8000 \
  -v /opt/af-rte/data:/app/dist/persistent \
  -v /opt/af-rte/data/ssh:/home/node/.ssh \
  -v /opt/af-rte/data/git/.gitconfig:/home/node/.gitconfig \
  -v /opt/af-rte/data/ansible/ansible.cfg:/etc/ansible/ansible.cfg \
  -v /opt/af-rte/data/ansible/roles:/etc/ansible/roles \
  -v /opt/af-rte/data/ansible/collections:/etc/ansible/collections \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

---

## 7. Controleren op de host

```bash
docker ps --filter name=af_rte_dc2        # STATUS ends in (healthy): the process listens
docker logs -f af_rte_dc2                 # Ctrl+C to stop following
curl -s http://127.0.0.1:8000/ready       # {"status":"ready"} once the socket to the app is open
```

Het log toont hoe de RTE start, de app belt en verbinding maakt:

```
RTE 'rte-dc2' 7.3.0 (outbound, files transfer) listening on http port 8000, token fingerprint abcd-ef12
RTE 'rte-dc2': dialing the app at wss://forms.example.com/api/v2/rte/socket
RTE 'rte-dc2': connected to the app (node af-app1-8000)
```

Zonder jointoken zegt nog een regel dat ze wacht:
`RTE 'rte-dc2': waiting for an admin to approve it under Connections > Runners (fingerprint abcd-ef12)`. Noteer de vingerafdruk.

`/ready` antwoordt `503` met `not connected to the app` totdat de socket open is. De healthcheck zegt alleen dat het proces luistert.

---

## 8. Haar goedkeuren

Zonder jointoken heeft de RTE gevraagd om lid te worden: **Verbindingen > Runners** toont een oranje melding boven de lijst,
**1 Runner wacht op goedkeuring**. Open die, controleer dat de **Vingerafdruk** die uit het log van de RTE is en dat **Modus**
Uitgaand zegt, en klik dan op **Goedkeuren** (zie [Een RTE goedkeuren](../runners/registration.html#approving-an-rte)). Alleen een admin keurt goed. Een aanvraag
die niemand binnen 24 uur afhandelt, wordt verwijderd, en de RTE vraagt het opnieuw wanneer ze de app de volgende keer belt.

Met een jointoken wordt de runner meteen goedgekeurd en noemt de beschrijving het jointoken. In beide gevallen bewaart de app het token van de RTE
in een nieuwe RTE-referentie, `rte-dc2-rte`, en meldt de RTE zich vanaf dan aan met haar eigen `RTE_TOKEN`: `RTE_JOIN_TOKEN` wordt niet meer
gebruikt, en je kunt het uit `rte.env` verwijderen.

---

## 9. Controleren in AnsibleForms

1. **Verbindingen > Runners** toont de runner `rte-dc2`, type RTE. Zet **Kolommen > Verbinding** aan om **Verbonden** in de lijst te zien
2. Open hem. Het tabblad **RTE** toont **Modus** Uitgaand en de badge **Verbinding** **Verbonden**; bij aanwijzen noemt die de app-node die
   de socket vasthoudt, de release van de RTE en hoeveel van haar jobs draaien
3. Klik op **Verbinding testen**: dat zegt **Runner connection is OK**. Het roept niets aan: het leest welke app-node de socket van de RTE vasthoudt
   (`runner_leases`) en controleert het contract dat de RTE sprak toen ze verbinding maakte
4. Geef hem een beschrijving, zoals *Datacenter 2*
5. Laat **Standaard** aan bij de runner van datacenter 1, tenzij elk playbookformulier zonder `runner:` in datacenter 2 moet draaien

De pagina **Status** toont de nieuwe RTE met haar versie, naast de andere.

---

## 10. Een eerste job

Bewijs het hele pad met een playbook dat niets wijzigt. Voeg in de playbooks van de app (de playbookmap of -repository, zoals in
datacenter 1) `ping-dc2.yaml` toe:

```yaml
- name: Reach the hosts of datacenter 2
  hosts: all
  gather_facts: false
  tasks:
    - name: Ping
      ansible.builtin.ping:
```

Voeg daarna in de designer een formulier toe dat de nieuwe runner noemt:

```yaml
name: Ping datacenter 2
type: ansible
playbook: ping-dc2.yaml
runner: rte-dc2
inventory: <an inventory with the hosts of datacenter 2>
roles:
  - admin
categories:
  - Default
fields: []
```

Start het. De app stuurt de playbookmap en de inventory met de job mee, en de RTE bewaart ze op hun hash, zodat een ongewijzigde
map nooit twee keer wordt verstuurd. De uitvoer begint met `Running on RTE rte-dc2 (outbound)`, toont `pong` voor elke host, en de job
eindigt met succes. Een map die groter is dan [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (standaard 512) wordt niet
verstuurd: de job mislukt en zegt dat.

---

## 11. De formulieren ernaartoe sturen

Een formulier draait op de RTE die het noemt, dus voeg dezelfde regel toe aan elk formulier voor datacenter 2:

```yaml
runner: rte-dc2
```

Zie [Runners](../runners.html) voor de standaardrunner en de andere typen runners.

---

## Als er iets misgaat

De RTE schrijft naar `docker logs` vanaf `notice`. Een verbinding die mislukt voordat de socket opengaat (een DNS-naam, een geweigerde poort, een
certificaat) verschijnt alleen als `RTE: dialing the app again in <n> seconds`, op `info`: stel
[`LOG_CONSOLE_LEVEL=debug`](../customization/logging.html#env_LOG_CONSOLE_LEVEL) in `rte.env` in en herstart haar om
`RTE: socket to wss://...: <the error>` te zien.

| Wat je ziet | Waar | Wat te doen |
|---|---|---|
| `RTE: set RTE_TOKEN (at least 16 characters) ; refusing to start` | `docker logs` | `RTE_TOKEN` ontbreekt of is te kort in `rte.env` |
| `RTE: RTE_MODE=outbound needs APP_URL, the app's address (https://forms.example.com) ; refusing to start` | `docker logs` | Stel `APP_URL` in `rte.env` in |
| `RTE: APP_URL must be an http or https address, not ... ; refusing to start` | `docker logs` | `APP_URL` begint met `https://` (of `http://`) |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set)` | `docker logs` | `RTE_MODE=outbound` ontbreekt in `rte.env` |
| Geen regel `connected to the app`, `/ready` blijft `503` | `docker logs`, `/ready` | Het netwerk van stap 2: `curl` de app vanaf deze host, de proxy (`HTTPS_PROXY`, `NO_PROXY`), het certificaat van de app (`NODE_EXTRA_CA_CERTS`, stap 5). Stel `LOG_CONSOLE_LEVEL=debug` in om de fout te zien |
| `the app refused the socket (404)` of een andere status dan 401, 403 en 409 | `docker logs` | Een reverse proxy geeft de WebSocket op `/api/v2/rte/socket` niet door, of `APP_URL` mist het basispad van de app |
| `the app refused the socket (401): ... the token of RTE 'rte-dc2' is not the one stored for its runner: check its RTE_TOKEN` | `docker logs` | Er bestaat een runner `rte-dc2` met een ander token. Geef de RTE dat token (het wachtwoord van de referentie van de runner), of verwijder de runner zodat ze vraagt om lid te worden |
| `the app refused the socket (401): ... the join token (RTE_JOIN_TOKEN) is unknown, revoked, expired or used up` | `docker logs` | Maak een nieuw jointoken, of verwijder `RTE_JOIN_TOKEN` en keur de RTE goed (stap 8) |
| `the app refused the socket (409): ... runner 'rte-dc2' exists and is approved: a join token cannot give it a new token ...` | `docker logs` | De RTE is opnieuw geïnstalleerd met een nieuw token: gebruik het token van de referentie van haar runner, of laat een admin het wijzigen |
| `the app refused this RTE (401): dialing again in 10 minutes, or restart it once an admin acted` | `docker logs` | Volgt op een weigering. Los de oorzaak op, en doe dan `docker restart af_rte_dc2` in plaats van te wachten |
| `waiting for an admin to approve it under Connections > Runners` | `docker logs` | Keur haar goed (stap 8). Ze is verbonden, maar krijgt tot dan geen job |
| `the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds` | `docker logs` | De app en de RTE draaien releases van een ander [contract](images.html#the-contract): werk de RTE bij naar de release van de app (zie Bijwerken) |
| **Niet verbonden**, of **Verbinding testen** zegt *the RTE 'rte-dc2' (outbound) is not connected: it has not dialed the app* | De app | Geen enkele app-node houdt haar socket vast: de RTE is gestopt, of kan de app niet bereiken. Lees haar `docker logs` |
| Een job wacht, en mislukt dan met *no app node holds a socket to RTE 'rte-dc2' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?* | De uitvoer van de job | De RTE was niet verbonden terwijl de job wachtte |
| `Permission denied` op de ssh-sleutel | De uitvoer van de job | De bestanden van `data/` moeten bij uid 1000 horen (stap 3) |
| `UNREACHABLE` voor de beheerde hosts | De uitvoer van de job | ssh vanaf deze host: de sleutel, `known_hosts`, en de firewall naar de hosts |

Aan de kant van de app verschijnt een geweigerde RTE in het log van de app als `Refused an RTE socket from <address>: <why>`.

---

## Bijwerken

Als de app naar een nieuwe release gaat, volg die dan ook op deze host. Een RTE met hetzelfde contract blijft in de tussentijd werken; als een release
het contract wijzigt, zeggen de release notes dat (zie [Het contract](images.html#the-contract)). Met `:7` in `compose.yml`, of in de
`FROM` van je Dockerfile:

```bash
cd /opt/af-rte
docker compose pull                 # option A; for option B: docker build --pull -t af-rte-dc2 build
docker compose up -d
docker image prune -f               # removes the image it no longer uses
```

Werk haar bij als er geen playbook op draait: een stop wacht `RTE_DRAIN_SECONDS` (25) op de lopende playbooks, en de playbooks die dan nog draaien,
eindigen als verlaten. Wat ze vóór de stop hebben afgedrukt, wordt in de spool bewaard en verstuurd zodra de RTE terug is. Doe offline eerst `docker load`
met de nieuwe image (stap 4) vóór `docker compose up -d`.

---

## Terugdraaien

```bash
cd /opt/af-rte && docker compose down     # or: docker rm -f af_rte_dc2
```

De socket sluit, en de runner toont meteen **Niet verbonden**: geen enkele app-node houdt zijn socket nog vast (`runner_leases`). Een host
die verdwijnt zonder hem te sluiten, toont binnen ongeveer een minuut **Niet verbonden**, zodra de app-node niets meer op de socket hoort. De
runner blijft: een runner die via een socket lid is geworden, wordt nooit vanzelf verwijderd. Verwijder hem onder **Verbindingen > Runners**, en zijn
referentie `rte-dc2-rte` onder **Verbindingen > Inloggegevens**. Verwijder eerst de regel `runner:` uit de formulieren die hem noemden: tot
dan wachten hun jobs op de RTE, tot `RTE_QUEUE_MINUTES`, en mislukken ze.

---

## Meer capaciteit in datacenter 2

Herhaal stap 1 tot en met 9 op meer hosts van datacenter 2, elk met een eigen `RTE_NAME` en `RTE_TOKEN`, zoals `rte-dc2-b`: elk wordt lid als
eigen runner en neemt tot [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks. Een formulier kiest er een met
`runner:`. Twee RTE's met dezelfde `RTE_NAME` delen het werk niet: de tweede neemt de socket van de eerste over (zie
[Meerdere RTE's](several.html#several-rtes)).

---

## Een RTE in databasemodus

Vóór 7.3.0 zette dit runbook een RTE in databasemodus op: die bevatte de referenties van de database (`DB_*`, `ENCRYPTION_SECRET`), maakte via poort `3306`
verbinding met de database van datacenter 1, en de app riep haar aan op haar poort `8000`. Die modus is sinds 7.3.0 verouderd en wordt
in 8.0.0 verwijderd. Om zo'n RTE naar uitgaand te verplaatsen zonder nieuwe runner, stel je `RTE_MODE=outbound`, `APP_URL` en `RTE_NAME` (de naam van
haar runner) erop in, behoud je haar `RTE_TOKEN`, en verwijder je `DB_*`, `ENCRYPTION_SECRET` en `RTE_REGISTER`: zie
[Database (verouderd)](modes.html#database-deprecated). Sluit daarna poort `8000` en de databasepoort die ze niet meer nodig heeft.
