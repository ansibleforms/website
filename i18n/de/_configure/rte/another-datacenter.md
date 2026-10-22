---
layout: default
title: Ein anderes Rechenzentrum
parent: RTE
nav_order: 5
translated_from: e2e67586abfd6c910942d1775e5331c1f889727e
---

# Eine RTE in einem anderen Rechenzentrum
{: .no_toc }

Von einem leeren Host in einem zweiten Rechenzentrum zu einer ausgehenden RTE, die ihr erstes Playbook ausführt
{: .fs-6 .fw-300 }

* TOC
{:toc}

---

Für Administratoren: wenn die verwalteten Hosts eines zweiten Rechenzentrums von einer RTE in diesem Rechenzentrum aus erreicht werden sollen, nicht vom ersten aus.

{: .note }
> **Der einfache Weg.** Das [Installationsprogramm](../installation/installer.html#a-runner) erledigt jeden der folgenden Schritte auf dem RTE-Host mit einem Befehl:
> `curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner`, mit `--join afj_...`, um sie sofort freigeben zu lassen.
> Dieses Runbook macht dasselbe von Hand, mit Docker oder Podman, damit Sie jeden Teil sehen und anpassen können.

---

## Was Sie am Ende haben

Die App, ihr Worker und ihre Datenbank bleiben, wo sie sind, in Rechenzentrum 1. Rechenzentrum 2 erhält einen Host, der einen RTE-Container im
ausgehenden Modus betreibt ([`RTE_MODE=outbound`](../customization/server.html#env_RTE_MODE), siehe [Modi](modes.html#outbound)): Er wählt sich über
HTTPS bei der App ein und hält einen WebSocket offen, tritt als eigener Runner bei und führt die Playbooks der Formulare, die ihn nennen, gegen die verwalteten
Hosts von Rechenzentrum 2 aus.

| Wo | Was dort läuft | Spricht mit |
|---|---|---|
| Rechenzentrum 1 | Die App-Knoten, der Worker, die Datenbank (wie bisher) | Nichts Neues: Es nimmt den Socket der RTE unter seiner üblichen HTTPS-Adresse an |
| Rechenzentrum 2, der RTE-Host | Docker oder Podman und der RTE-Container | Die App unter `APP_URL` über HTTPS und die verwalteten Hosts von Rechenzentrum 2 |

Die RTE hält keine Datenbank-Anmeldedaten und kein `ENCRYPTION_SECRET`, nur ein eigenes Token. Nichts verbindet sich mit ihr, daher braucht sie keinen offenen
Port, keinen DNS-Namen und kein Zertifikat. Die App sendet die Playbooks und Inventare mit jedem Job (`RTE_FILES=transfer`, der
Standard), sodass die RTE keine Kopie davon und keine gemeinsame Festplatte braucht.

Jeder der folgenden Befehle läuft in einem Terminal auf dem RTE-Host, als Benutzer mit `sudo`, sofern nicht anders angegeben. Es dauert etwa 20 Minuten,
die meiste Zeit davon wartet man auf das Image.

---

## 0. Bevor Sie beginnen

Sammeln Sie Folgendes:

| Was | Woher es kommt |
|---|---|
| Die Adresse der App | `APP_URL`: die Adresse, die Benutzer im Browser öffnen, etwa `https://forms.example.com`, mit ihrem Basispfad, falls sie einen hat |
| Das Zertifikat der App | Von einer öffentlichen CA signiert, von einer privaten CA (Sie brauchen deren Zertifikat, Schritt 6) oder selbstsigniert |
| Ein Proxy | Der `HTTPS_PROXY`, über den dieses Rechenzentrum Rechenzentrum 1 erreicht, falls vorhanden |
| Der Name der RTE | Der Name ihres Runners unter **Verbindungen > Runner**, den Formulare mit `runner:` nennen, etwa `rte-dc2`: Buchstaben, Ziffern und `_ . : @ -` |
| Ein Beitrittstoken | Optional: Ein [Beitrittstoken](../runners/registration.html#join-tokens) (`afj_...`) gibt die RTE sofort frei. Ohne eines gibt ein Admin sie frei (Schritt 8) |
| Der SSH-Schlüssel | Der private Schlüssel, mit dem die Playbooks die verwalteten Hosts erreichen, oder das Recht, einen zu erstellen |

Die App muss 7.3.0 oder neuer ausführen. Um ein Beitrittstoken für genau diese RTE zu erstellen, ruft ein Admin einmal die API auf (siehe
[Beitrittstoken](../runners/registration.html#join-tokens)):

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <an admin's token>" -H "Content-Type: application/json" \
  -d '{ "name": "rte-dc2", "expiresInHours": 24, "maxUses": 1 }'
```

---

## 1. Den Host vorbereiten

Die RTE ist ein Container, daher braucht der Host eine Container-Engine und sonst nichts: Node.js, Python und Ansible sind im Image.

| Bedarf | Warum |
|---|---|
| Linux auf **x86_64** (amd64) | Die RTE-Images werden nur für amd64 veröffentlicht |
| 2 CPUs und 4 GB Speicher oder mehr | Eine RTE führt bis zu [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) Playbooks gleichzeitig aus (10), jedes mit seinen Forks: Dimensionieren Sie sie dafür |
| 20 GB freier Festplattenplatz | Das Image `-rte-full` ist etwa 3,3 GB groß, dazu ein Image während Updates, die Jobdateien, die die App sendet, und die temporären Dateien der Jobs |
| Docker oder Podman mit podman-compose | Um das Image zu ziehen und auszuführen |
| Die Uhrzeit per NTP gestellt | Die Zeiten der Jobs werden mit denen der App verglichen |

**Docker**, auf Ubuntu oder Debian (andere Distributionen: [docs.docker.com/engine/install](https://docs.docker.com/engine/install/)):

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl chrony
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker chrony
sudo usermod -aG docker $USER          # log out and in again, so docker works without sudo
docker run --rm hello-world
docker compose version
```

**Podman**, auf RHEL, Rocky oder Alma Linux:

```bash
sudo dnf install -y podman podman-compose chrony
sudo systemctl enable --now chronyd
podman run --rm quay.io/podman/hello
```

Schreiben Sie mit Podman in jedem der folgenden Befehle `podman` statt `docker` und `podman-compose` statt `docker compose`.

---

## 2. Netzwerk und Firewall

Die RTE öffnet jede Verbindung selbst. Von außen erreicht sie nichts:

| Von | Nach | Port | Warum |
|---|---|---|---|
| Der RTE-Host | Die App, unter `APP_URL` (über `HTTPS_PROXY`, falls gesetzt) | Der Port der App, `443` hinter den meisten Proxys | Der Socket, über den die Jobs, ihre Dateien und ihre Ausgabe laufen |
| Der RTE-Host | Die verwalteten Hosts von Rechenzentrum 2 | ssh (`22`), WinRM, ihre APIs | Die Playbooks laufen von hier aus |
| Der RTE-Host | `ghcr.io` | `443` | Um das Image zu ziehen, sofern es nicht aus Ihrer eigenen Registry oder einer Datei kommt (Schritt 4) |

Öffnen Sie keinen eingehenden Port für die RTE. Ihr `PORT` (`8000`) bedient nur `/live`, `/ready` und `/metrics`, für die Probes auf diesem Host.

Die RTE wählt `APP_URL` mit angehängtem `/api/v2/rte/socket` an, als WebSocket. Ein Reverse Proxy vor der App muss das Upgrade
für diesen Pfad weiterreichen (siehe [Runner-WebSockets](../production/reverse-proxy.html#runner-websockets)). Prüfen Sie von hier, dass die App antwortet:

```bash
curl -sS https://forms.example.com/api/v2/version
```

---

## 3. Ordner

Alles liegt unter `/opt/af-rte`. Die RTE läuft als Benutzer `node` (uid 1000), daher gehören ihre Daten dieser uid:

```bash
sudo mkdir -p /opt/af-rte/data/{ssh,certificates,ansible/roles,ansible/collections,git}
sudo touch /opt/af-rte/data/ansible/ansible.cfg /opt/af-rte/data/git/.gitconfig
```

| Ordner | Im Container | Enthält |
|---|---|---|
| `data/` | `/app/dist/persistent` | Den Spool (`rte-spool`: Ausgabe und Ende jedes Jobs, bis die App sie gespeichert hat), die von der App gesendeten Jobdateien (`rte-files`), eine private CA, die Python-Bibliotheken, die ein Playbook installiert |
| `data/ssh/` | `/home/node/.ssh` | Den SSH-Schlüssel und die `known_hosts` der Playbooks |
| `data/ansible/` | `/etc/ansible/...` | Eine `ansible.cfg`, eigene Rollen und Collections, eingehängt statt eingebaut |

Behalten Sie `data/` auf dem Host: Eine neu gestartete RTE sendet dann noch, was die App nicht gespeichert hatte, und behält ihren Cache an Jobdateien.

**SSH-Schlüssel.** Kopieren Sie den Schlüssel, den die Playbooks in Rechenzentrum 1 verwenden, oder erstellen Sie einen für dieses Rechenzentrum und geben Sie seinen öffentlichen Teil den verwalteten Hosts:

```bash
sudo ssh-keygen -t ed25519 -N "" -C "ansibleforms-rte-dc2" -f /opt/af-rte/data/ssh/id_ed25519
sudo cat /opt/af-rte/data/ssh/id_ed25519.pub      # add it to ~/.ssh/authorized_keys of the managed user on each host
sudo sh -c 'ssh-keyscan host1.dc2.example.com host2.dc2.example.com >> /opt/af-rte/data/ssh/known_hosts'
```

Übergeben Sie dann alles an uid 1000, wobei der Schlüssel nur für seinen Besitzer lesbar ist:

```bash
sudo chown -R 1000:1000 /opt/af-rte/data
sudo chmod 700 /opt/af-rte/data/ssh && sudo chmod 600 /opt/af-rte/data/ssh/id_*
```

---

## 4. Das Image

Wählen Sie eine der beiden Optionen.

### Option A: das offizielle Image
{: .no_toc }

Die veröffentlichten Images liegen in der GitHub Container Registry, öffentlich, ohne Anmeldung (die drei Schichten finden Sie unter [Images](images.html)).
Nehmen Sie dieselbe Schicht wie in Rechenzentrum 1. `:7` folgt dem neuesten Release 7, wie `:7` der App:

```bash
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Ein Host ohne Internetzugang erhält das Image von einem, der welchen hat:

```bash
# on a host with internet
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
docker save ghcr.io/ansibleforms/ansibleforms-rte-full:7 | gzip > rte-full-7.tar.gz
# copy the file to the RTE host, then there
docker load < rte-full-7.tar.gz
```

Oder pushen Sie es einmal in Ihre eigene Registry (`docker tag` und `docker push`) und verwenden Sie diesen Namen in den nächsten Schritten.

### Option B: ein eigenes Image
{: .no_toc }

Wenn die Playbooks von Rechenzentrum 2 Collections oder Python-Bibliotheken brauchen, die dem offiziellen Image fehlen (zum Beispiel die VMware-Collections für das
vCenter dieses Rechenzentrums), bauen Sie auf `ansibleforms-rte-core` auf:

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

Bauen Sie es bei jedem neuen Release der App neu (siehe [Eine eigene RTE bauen](images.html#build-your-own-rte)). Mit mehreren RTE-Hosts bauen Sie
einmal und pushen in Ihre eigene Registry. Offline übertragen Sie das gebaute Image mit `docker save` und `docker load` wie in Option A.

---

## 5. Einstellungen

Ein neues eigenes [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN), mindestens 16 Zeichen. Es ist das Passwort dieser RTE: Die App
bewahrt es in den RTE-Anmeldedaten des Runners auf und versiegelt die Geheimnisse jedes Jobs damit.

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

| Variable | Bedeutung |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | `outbound`: Die RTE wählt sich bei der App ein. Ohne die Variable startet die RTE im veralteten Datenbankmodus |
| [`APP_URL`](../customization/server.html#env_APP_URL) | Die Adresse der App, `http://` oder `https://`, mit ihrem Basispfad, falls vorhanden |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | Der Name ihres Runners. Nicht gesetzt: ihre Knoten-ID, `rte-<hostname>-<port>`, die sich mit dem Container ändert |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | Ihr eigenes Token, mindestens 16 Zeichen. Bewahren Sie es auf: Der Runner meldet sich ab jetzt damit an |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Optional: ein Beitrittstoken, nur verwendet, solange ihr Runner noch nicht existiert oder auf Freigabe wartet |

Fügen Sie diese hinzu, wenn das Netz sie braucht:

| Variable | Wann |
|---|---|
| `HTTPS_PROXY`, `NO_PROXY` | Die RTE erreicht die App über einen Proxy: `HTTPS_PROXY=http://proxy.dc2.example.com:3128`. Ein in `NO_PROXY` aufgeführter Host (durch Kommas getrennt, `.example.com` für eine Domäne) wird direkt angewählt |
| `NODE_EXTRA_CA_CERTS` | Das Zertifikat der App stammt von einer privaten CA: Legen Sie das Zertifikat der CA in `/opt/af-rte/data/certificates/ca.pem` ab und setzen Sie `NODE_EXTRA_CA_CERTS=/app/dist/persistent/certificates/ca.pem` |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `0` akzeptiert jedes Zertifikat der App, auch ein selbstsigniertes. Nur innerhalb eines vertrauenswürdigen Netzes: Ziehen Sie `NODE_EXTRA_CA_CERTS` vor |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (Standard) erhält die Playbooks und Inventare mit jedem Job. Lassen Sie es so, es sei denn, Sie hängen sie selbst bei der RTE ein (`local`) |

Die weiteren Einstellungen, die eine RTE liest, stehen unter [Eine RTE betreiben](run.html#settings). `RTE_MAX_JOBS`, `RTE_CACHE_MB`, `RTE_FILES` und
`RTE_DRAIN_SECONDS` lassen sich später auch auf ihrer Runner-Seite setzen, die über die Variable gewinnt (siehe
[Die Einstellungen einer RTE](../runners/runner-page.html#an-rtes-settings)).

---

## 6. Starten

Eine Compose-Datei hält die gesamte Definition an einem Ort, neben den Einstellungen. Tragen Sie das Image aus Schritt 4 unter `image:` ein:

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

Docker startet sie nach einem Neustart des Hosts wieder (`unless-stopped`). Podman hat keinen Daemon, der das tut: Aktivieren Sie `podman-restart.service`
(`sudo systemctl enable --now podman-restart`) oder betreiben Sie den Container als systemd-Dienst mit einer Quadlet-Datei. Auf einem Host mit erzwungenem
SELinux fügen Sie jedem Volume `:Z` hinzu (`./data:/app/dist/persistent:Z`).

Ohne Compose derselbe Container mit einem Befehl:

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

## 7. Auf dem Host prüfen

```bash
docker ps --filter name=af_rte_dc2        # STATUS ends in (healthy): the process listens
docker logs -f af_rte_dc2                 # Ctrl+C to stop following
curl -s http://127.0.0.1:8000/ready       # {"status":"ready"} once the socket to the app is open
```

Das Protokoll zeigt, wie die RTE startet, sich bei der App einwählt und verbindet:

```
RTE 'rte-dc2' 7.3.0 (outbound, files transfer) listening on http port 8000, token fingerprint abcd-ef12
RTE 'rte-dc2': dialing the app at wss://forms.example.com/api/v2/rte/socket
RTE 'rte-dc2': connected to the app (node af-app1-8000)
```

Ohne Beitrittstoken sagt eine weitere Zeile, dass sie wartet:
`RTE 'rte-dc2': waiting for an admin to approve it under Connections > Runners (fingerprint abcd-ef12)`. Notieren Sie den Fingerabdruck.

`/ready` antwortet mit `503` und `not connected to the app`, bis der Socket offen ist. Der Healthcheck sagt nur, dass der Prozess lauscht.

---

## 8. Freigeben

Ohne Beitrittstoken hat die RTE um Beitritt gebeten: **Verbindungen > Runner** zeigt über der Liste einen orangefarbenen Hinweis,
**1 Runner wartet auf Freigabe**. Öffnen Sie ihn, prüfen Sie, dass der **Fingerabdruck** der aus dem Protokoll der RTE ist und dass **Modus**
Ausgehend lautet, und klicken Sie dann auf **Freigeben** (siehe [Eine RTE freigeben](../runners/registration.html#approving-an-rte)). Nur ein Admin gibt frei. Eine Anfrage,
die niemand innerhalb von 24 Stunden bearbeitet, wird entfernt, und die RTE fragt erneut, wenn sie sich das nächste Mal bei der App einwählt.

Mit einem Beitrittstoken wird der Runner sofort freigegeben, und seine Beschreibung nennt das Beitrittstoken. In beiden Fällen bewahrt die App das Token der RTE
in neuen RTE-Anmeldedaten auf, `rte-dc2-rte`, und die RTE meldet sich ab dann mit ihrem eigenen `RTE_TOKEN` an: `RTE_JOIN_TOKEN` wird nicht mehr
verwendet, und Sie können es aus `rte.env` entfernen.

---

## 9. In AnsibleForms prüfen

1. **Verbindungen > Runner** listet den Runner `rte-dc2`, Typ RTE. Schalten Sie **Spalten > Verbindung** ein, um **Verbunden** in der Liste zu sehen
2. Öffnen Sie ihn. Sein Tab **RTE** zeigt **Modus** Ausgehend und die Plakette **Verbindung** mit **Verbunden**; beim Überfahren nennt sie den App-Knoten, der
   den Socket hält, das Release der RTE und wie viele ihrer Jobs laufen
3. Klicken Sie auf **Verbindung testen**: Es meldet **Runner connection is OK**. Es ruft nichts auf: Es liest, welcher App-Knoten den Socket der RTE hält
   (`runner_leases`), und prüft den Vertrag, den die RTE beim Verbinden gesprochen hat
4. Geben Sie ihm eine Beschreibung, etwa *Rechenzentrum 2*
5. Lassen Sie **Standard** auf dem Runner von Rechenzentrum 1, es sei denn, jedes Playbook-Formular ohne `runner:` soll in Rechenzentrum 2 laufen

Die Seite **Status** listet die neue RTE mit ihrer Version neben den anderen auf.

---

## 10. Ein erster Job

Beweisen Sie den ganzen Weg mit einem Playbook, das nichts ändert. Fügen Sie in den Playbooks der App (ihrem Playbook-Ordner oder Repository, wie in
Rechenzentrum 1) `ping-dc2.yaml` hinzu:

```yaml
- name: Reach the hosts of datacenter 2
  hosts: all
  gather_facts: false
  tasks:
    - name: Ping
      ansible.builtin.ping:
```

Fügen Sie dann im Designer ein Formular hinzu, das den neuen Runner nennt:

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

Starten Sie es. Die App sendet den Playbook-Ordner und das Inventar mit dem Job, und die RTE bewahrt sie nach ihrem Hash auf, sodass ein unveränderter
Ordner nie zweimal gesendet wird. Die Ausgabe beginnt mit `Running on RTE rte-dc2 (outbound)`, zeigt `pong` für jeden Host, und der Job
endet erfolgreich. Ein Ordner, der größer ist als [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (standardmäßig 512), wird nicht
gesendet: Der Job schlägt fehl und sagt das.

---

## 11. Die Formulare dorthin senden

Ein Formular läuft auf der RTE, die es nennt, fügen Sie also jedem Formular für Rechenzentrum 2 dieselbe Zeile hinzu:

```yaml
runner: rte-dc2
```

Den Standard-Runner und die anderen Runner-Typen finden Sie unter [Runner](../runners.html).

---

## Wenn etwas fehlschlägt

Die RTE schreibt ab `notice` in `docker logs`. Eine Verbindung, die fehlschlägt, bevor der Socket offen ist (ein DNS-Name, ein abgewiesener Port, ein
Zertifikat), erscheint nur als `RTE: dialing the app again in <n> seconds`, auf Stufe `info`: Setzen Sie
[`LOG_CONSOLE_LEVEL=debug`](../customization/logging.html#env_LOG_CONSOLE_LEVEL) in `rte.env` und starten Sie sie neu, um
`RTE: socket to wss://...: <the error>` zu sehen.

| Was Sie sehen | Wo | Was zu tun ist |
|---|---|---|
| `RTE: set RTE_TOKEN (at least 16 characters) ; refusing to start` | `docker logs` | `RTE_TOKEN` fehlt in `rte.env` oder ist zu kurz |
| `RTE: RTE_MODE=outbound needs APP_URL, the app's address (https://forms.example.com) ; refusing to start` | `docker logs` | Setzen Sie `APP_URL` in `rte.env` |
| `RTE: APP_URL must be an http or https address, not ... ; refusing to start` | `docker logs` | `APP_URL` beginnt mit `https://` (oder `http://`) |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set)` | `docker logs` | `RTE_MODE=outbound` fehlt in `rte.env` |
| Keine Zeile `connected to the app`, `/ready` bleibt bei `503` | `docker logs`, `/ready` | Das Netz aus Schritt 2: Rufen Sie die App von diesem Host mit `curl` auf, prüfen Sie den Proxy (`HTTPS_PROXY`, `NO_PROXY`) und das Zertifikat der App (`NODE_EXTRA_CA_CERTS`, Schritt 5). Setzen Sie `LOG_CONSOLE_LEVEL=debug`, um den Fehler zu sehen |
| `the app refused the socket (404)` oder ein anderer Status als 401, 403 und 409 | `docker logs` | Ein Reverse Proxy reicht den WebSocket auf `/api/v2/rte/socket` nicht weiter, oder `APP_URL` fehlt der Basispfad der App |
| `the app refused the socket (401): ... the token of RTE 'rte-dc2' is not the one stored for its runner: check its RTE_TOKEN` | `docker logs` | Ein Runner `rte-dc2` existiert mit einem anderen Token. Geben Sie der RTE dieses Token (das Passwort der Anmeldedaten des Runners) oder löschen Sie den Runner, damit sie um Beitritt bittet |
| `the app refused the socket (401): ... the join token (RTE_JOIN_TOKEN) is unknown, revoked, expired or used up` | `docker logs` | Erstellen Sie ein neues Beitrittstoken oder entfernen Sie `RTE_JOIN_TOKEN` und geben Sie die RTE frei (Schritt 8) |
| `the app refused the socket (409): ... runner 'rte-dc2' exists and is approved: a join token cannot give it a new token ...` | `docker logs` | Die RTE wurde mit einem neuen Token neu installiert: Verwenden Sie das Token aus den Anmeldedaten ihres Runners oder lassen Sie es von einem Admin ändern |
| `the app refused this RTE (401): dialing again in 10 minutes, or restart it once an admin acted` | `docker logs` | Folgt auf eine Ablehnung. Beheben Sie die Ursache und führen Sie dann `docker restart af_rte_dc2` aus, statt zu warten |
| `waiting for an admin to approve it under Connections > Runners` | `docker logs` | Geben Sie sie frei (Schritt 8). Sie ist verbunden, nimmt aber bis dahin keinen Job an |
| `the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds` | `docker logs` | Die App und die RTE führen Releases eines anderen [Vertrags](images.html#the-contract) aus: Aktualisieren Sie die RTE auf das Release der App (siehe Aktualisieren) |
| **Nicht verbunden**, oder **Verbindung testen** meldet *the RTE 'rte-dc2' (outbound) is not connected: it has not dialed the app* | Die App | Kein App-Knoten hält ihren Socket: Die RTE ist angehalten oder erreicht die App nicht. Lesen Sie ihre `docker logs` |
| Ein Job wartet und schlägt dann fehl mit *no app node holds a socket to RTE 'rte-dc2' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?* | Die Ausgabe des Jobs | Die RTE war nicht verbunden, während der Job wartete |
| `Permission denied` beim SSH-Schlüssel | Die Ausgabe des Jobs | Die Dateien von `data/` müssen uid 1000 gehören (Schritt 3) |
| `UNREACHABLE` für die verwalteten Hosts | Die Ausgabe des Jobs | SSH von diesem Host aus: der Schlüssel, `known_hosts` und die Firewall zu den Hosts |

Auf der Seite der App erscheint eine abgewiesene RTE im Protokoll der App als `Refused an RTE socket from <address>: <why>`.

---

## Aktualisieren

Wenn die App auf ein neues Release wechselt, ziehen Sie auch auf diesem Host nach. Eine RTE desselben Vertrags funktioniert in der Zwischenzeit weiter; wenn ein Release
den Vertrag ändert, sagen seine Release Notes das (siehe [Der Vertrag](images.html#the-contract)). Mit `:7` in `compose.yml` oder im
`FROM` Ihres Dockerfiles:

```bash
cd /opt/af-rte
docker compose pull                 # option A; for option B: docker build --pull -t af-rte-dc2 build
docker compose up -d
docker image prune -f               # removes the image it no longer uses
```

Aktualisieren Sie sie, wenn kein Playbook darauf läuft: Ein Anhalten wartet `RTE_DRAIN_SECONDS` (25) auf die laufenden Playbooks, und die dann noch laufenden
enden als verwaist. Was sie vor dem Anhalten ausgegeben haben, bleibt im Spool und wird gesendet, sobald die RTE zurück ist. Offline laden Sie
das neue Image mit `docker load` (Schritt 4) vor `docker compose up -d`.

---

## Zurückrollen

```bash
cd /opt/af-rte && docker compose down     # or: docker rm -f af_rte_dc2
```

Der Socket schließt sich, und der Runner zeigt sofort **Nicht verbunden**: Kein App-Knoten hält mehr seinen Socket (`runner_leases`). Ein Host,
der verschwindet, ohne ihn zu schließen, zeigt innerhalb etwa einer Minute **Nicht verbunden**, sobald der App-Knoten nichts mehr auf dem Socket hört. Der
Runner bleibt: Ein über einen Socket beigetretener Runner wird nie von selbst entfernt. Löschen Sie ihn unter **Verbindungen > Runner** und seine
Anmeldedaten `rte-dc2-rte` unter **Verbindungen > Anmeldedaten**. Entfernen Sie zuerst die Zeile `runner:` aus den Formularen, die ihn nannten: Bis
dahin warten ihre Jobs auf die RTE, bis zu `RTE_QUEUE_MINUTES`, und schlagen fehl.

---

## Mehr Kapazität in Rechenzentrum 2

Wiederholen Sie die Schritte 1 bis 9 auf weiteren Hosts von Rechenzentrum 2, jeder mit eigenem `RTE_NAME` und `RTE_TOKEN`, etwa `rte-dc2-b`: Jede tritt als
eigener Runner bei und übernimmt bis zu [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) Playbooks. Ein Formular wählt eine mit
`runner:`. Zwei RTEs mit demselben `RTE_NAME` teilen sich die Arbeit nicht: Die zweite übernimmt den Socket von der ersten (siehe
[Mehrere RTEs](several.html#several-rtes)).

---

## Eine RTE im Datenbankmodus

Vor 7.3.0 richtete dieses Runbook eine RTE im Datenbankmodus ein: Sie hielt die Anmeldedaten der Datenbank (`DB_*`, `ENCRYPTION_SECRET`), verband sich
über Port `3306` mit der Datenbank von Rechenzentrum 1, und die App rief sie auf ihrem Port `8000` auf. Dieser Modus ist seit 7.3.0 veraltet und wird
in 8.0.0 entfernt. Um eine solche RTE ohne neuen Runner auf ausgehend umzustellen, setzen Sie `RTE_MODE=outbound`, `APP_URL` und `RTE_NAME` (den Namen
ihres Runners) auf ihr, behalten Sie ihr `RTE_TOKEN` und entfernen Sie `DB_*`, `ENCRYPTION_SECRET` und `RTE_REGISTER`: siehe
[Datenbank (veraltet)](modes.html#database-deprecated). Schließen Sie dann Port `8000` und den Datenbankport, die sie nicht mehr braucht.
