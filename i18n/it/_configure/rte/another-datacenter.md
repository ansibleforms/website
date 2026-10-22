---
layout: default
title: Un altro datacenter
parent: RTE
nav_order: 5
translated_from: e2e67586abfd6c910942d1775e5331c1f889727e
---

# Un RTE in un altro datacenter
{: .no_toc }

Da un host vuoto in un secondo datacenter a un RTE in uscita che esegue il suo primo playbook
{: .fs-6 .fw-300 }

* TOC
{:toc}

---

Per gli amministratori: quando gli host gestiti di un secondo datacenter vanno raggiunti da un RTE in quel datacenter, non dal primo.

{: .note }
> **La strada facile.** L'[installer](../installation/installer.html#a-runner) esegue ogni passaggio qui sotto sull'host dell'RTE con un solo comando:
> `curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner`, con `--join afj_...` per farlo approvare subito.
> Questo runbook fa lo stesso a mano, con Docker o Podman, così puoi vedere e adattare ogni parte.

---

## Cosa ottieni alla fine

L'app, il suo worker e il suo database restano dove sono, nel datacenter 1. Il datacenter 2 riceve un host che esegue un container RTE in
modalità in uscita ([`RTE_MODE=outbound`](../customization/server.html#env_RTE_MODE), vedi [Modalità](modes.html#outbound)): contatta l'app su
HTTPS e tiene aperto un WebSocket, si unisce come runner proprio, ed esegue i playbook dei moduli che lo indicano sugli host gestiti
del datacenter 2.

| Dove | Cosa gira lì | Parla con |
|---|---|---|
| Datacenter 1 | I nodi dell'app, il worker, il database (come oggi) | Niente di nuovo: riceve il socket dell'RTE sul suo solito indirizzo HTTPS |
| Datacenter 2, l'host dell'RTE | Docker o Podman, e il container RTE | L'app in `APP_URL` su HTTPS, e gli host gestiti del datacenter 2 |

L'RTE non contiene credenziali del database né `ENCRYPTION_SECRET`, solo un token proprio. Nulla si connette a lui, quindi non ha bisogno di porte
aperte, di un nome DNS né di un certificato. L'app invia i playbook e gli inventari con ogni job (`RTE_FILES=transfer`, il
predefinito), quindi l'RTE non ha bisogno di una loro copia né di un disco condiviso.

Ogni comando qui sotto si esegue in un terminale sull'host dell'RTE, come utente con `sudo`, salvo dove indicato diversamente. Richiede circa 20 minuti,
la maggior parte passati ad attendere l'immagine.

---

## 0. Prima di iniziare

Raccogli queste informazioni:

| Cosa | Da dove arriva |
|---|---|
| L'indirizzo dell'app | `APP_URL`: l'indirizzo che le persone aprono in un browser, come `https://forms.example.com`, con il suo percorso di base se ne ha uno |
| Il certificato dell'app | Firmato da una CA pubblica, da una CA privata (ti serve il suo certificato, passaggio 6), o autofirmato |
| Un proxy | L'`HTTPS_PROXY` che questo datacenter usa per raggiungere il datacenter 1, se c'è |
| Il nome dell'RTE | Il nome del suo runner in **Connessioni > Runner**, che i moduli indicano con `runner:`, come `rte-dc2`: lettere, cifre e `_ . : @ -` |
| Un join token | Facoltativo: un [join token](../runners/registration.html#join-tokens) (`afj_...`) approva subito l'RTE. Senza, lo approva un admin (passaggio 8) |
| La chiave ssh | La chiave privata che i playbook usano per raggiungere gli host gestiti, o il diritto di crearne una |

L'app deve eseguire la 7.3.0 o successiva. Per creare un join token per questo solo RTE, un admin chiama l'API una volta (vedi
[Join token](../runners/registration.html#join-tokens)):

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <an admin's token>" -H "Content-Type: application/json" \
  -d '{ "name": "rte-dc2", "expiresInHours": 24, "maxUses": 1 }'
```

---

## 1. Preparare l'host

L'RTE è un container, quindi l'host ha bisogno di un motore dei container e di nient'altro: Node.js, python e ansible sono nell'immagine.

| Requisito | Perché |
|---|---|
| Linux su **x86_64** (amd64) | Le immagini RTE sono pubblicate solo per amd64 |
| 2 CPU e 4 GB di memoria, o di più | Un RTE esegue fino a [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbook insieme (10), ognuno con i suoi fork: dimensionalo per quelli |
| 20 GB di disco libero | L'immagine `-rte-full` occupa circa 3,3 GB, più un'immagine durante gli aggiornamenti, i file dei job che l'app invia e i file temporanei dei job |
| Docker, o Podman con podman-compose | Per scaricare ed eseguire l'immagine |
| L'ora impostata via NTP | Gli orari dei job vengono confrontati con quelli dell'app |

**Docker**, su Ubuntu o Debian (altre distribuzioni: [docs.docker.com/engine/install](https://docs.docker.com/engine/install/)):

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl chrony
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker chrony
sudo usermod -aG docker $USER          # log out and in again, so docker works without sudo
docker run --rm hello-world
docker compose version
```

**Podman**, su RHEL, Rocky o Alma Linux:

```bash
sudo dnf install -y podman podman-compose chrony
sudo systemctl enable --now chronyd
podman run --rm quay.io/podman/hello
```

Con Podman, scrivi `podman` al posto di `docker` e `podman-compose` al posto di `docker compose` in ogni comando qui sotto.

---

## 2. Rete e firewall

L'RTE apre da solo ogni connessione. Nulla lo raggiunge dall'esterno:

| Da | A | Porta | Perché |
|---|---|---|---|
| L'host dell'RTE | L'app, in `APP_URL` (tramite `HTTPS_PROXY` se impostato) | La porta dell'app, `443` dietro la maggior parte dei proxy | Il socket su cui passano i job, i loro file e il loro output |
| L'host dell'RTE | Gli host gestiti del datacenter 2 | ssh (`22`), WinRM, le loro API | I playbook girano da qui |
| L'host dell'RTE | `ghcr.io` | `443` | Per scaricare l'immagine, a meno che non arrivi dal tuo registry o da un file (passaggio 4) |

Non aprire nessuna porta in entrata per l'RTE. La sua `PORT` (`8000`) serve solo `/live`, `/ready` e `/metrics`, per le probe su questo host.

L'RTE contatta `APP_URL` con aggiunto `/api/v2/rte/socket`, come WebSocket. Un reverse proxy davanti all'app deve far passare l'upgrade
per quel percorso (vedi [WebSocket dei runner](../production/reverse-proxy.html#runner-websockets)). Verifica da qui che l'app risponda:

```bash
curl -sS https://forms.example.com/api/v2/version
```

---

## 3. Cartelle

Tutto sta sotto `/opt/af-rte`. L'RTE gira come utente `node` (uid 1000), quindi i suoi dati appartengono a quell'uid:

```bash
sudo mkdir -p /opt/af-rte/data/{ssh,certificates,ansible/roles,ansible/collections,git}
sudo touch /opt/af-rte/data/ansible/ansible.cfg /opt/af-rte/data/git/.gitconfig
```

| Cartella | Nel container | Contiene |
|---|---|---|
| `data/` | `/app/dist/persistent` | Lo spool (`rte-spool`: l'output e la fine di ogni job finché l'app non li ha salvati), i file dei job inviati dall'app (`rte-files`), una CA privata, le librerie python che installa un playbook |
| `data/ssh/` | `/home/node/.ssh` | La chiave ssh e il `known_hosts` dei playbook |
| `data/ansible/` | `/etc/ansible/...` | Un `ansible.cfg`, ruoli e collection tuoi, montati invece che integrati nell'immagine |

Tieni `data/` sull'host: un RTE riavviato invia ancora ciò che l'app non aveva salvato, e conserva la sua cache dei file dei job.

**Chiave ssh.** Copia la chiave che i playbook usano nel datacenter 1, o creane una per questo datacenter e dai la sua metà pubblica agli host gestiti:

```bash
sudo ssh-keygen -t ed25519 -N "" -C "ansibleforms-rte-dc2" -f /opt/af-rte/data/ssh/id_ed25519
sudo cat /opt/af-rte/data/ssh/id_ed25519.pub      # add it to ~/.ssh/authorized_keys of the managed user on each host
sudo sh -c 'ssh-keyscan host1.dc2.example.com host2.dc2.example.com >> /opt/af-rte/data/ssh/known_hosts'
```

Poi assegna tutto all'uid 1000, con la chiave leggibile solo dal suo proprietario:

```bash
sudo chown -R 1000:1000 /opt/af-rte/data
sudo chmod 700 /opt/af-rte/data/ssh && sudo chmod 600 /opt/af-rte/data/ssh/id_*
```

---

## 4. L'immagine

Scegline una delle due.

### Opzione A: l'immagine ufficiale
{: .no_toc }

Le immagini pubblicate sono nel GitHub Container Registry, pubbliche, senza bisogno di accesso (vedi [Immagini](images.html) per i tre livelli).
Prendi lo stesso livello del datacenter 1. `:7` segue l'ultima versione 7, come fa il `:7` dell'app:

```bash
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Un host senza accesso a internet riceve l'immagine da uno che ce l'ha:

```bash
# on a host with internet
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
docker save ghcr.io/ansibleforms/ansibleforms-rte-full:7 | gzip > rte-full-7.tar.gz
# copy the file to the RTE host, then there
docker load < rte-full-7.tar.gz
```

Oppure caricala una volta nel tuo registry (`docker tag` e `docker push`), e usa quel nome nei passaggi successivi.

### Opzione B: la tua immagine
{: .no_toc }

Quando i playbook del datacenter 2 hanno bisogno di collection o librerie python che mancano all'immagine ufficiale (quelle VMware per il vCenter
di questo datacenter, per esempio), parti da `ansibleforms-rte-core`:

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

Ricostruiscila a ogni nuova versione dell'app (vedi [Costruire il tuo RTE](images.html#build-your-own-rte)). Con più host RTE, costruiscila
una volta e caricala nel tuo registry. Offline, usa `docker save` e `docker load` sull'immagine costruita come nell'opzione A.

---

## 5. Impostazioni

Un nuovo [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) proprio, di almeno 16 caratteri. È la password di questo RTE: l'app
lo conserva nella credenziale RTE del runner, e sigilla con esso i segreti di ogni job.

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

| Variabile | Significato |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | `outbound`: l'RTE contatta l'app. Senza, l'RTE parte nella modalità database deprecata |
| [`APP_URL`](../customization/server.html#env_APP_URL) | L'indirizzo dell'app, `http://` o `https://`, con il suo percorso di base se c'è |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | Il nome del suo runner. Se non è impostata: il suo id di nodo, `rte-<hostname>-<port>`, che cambia con il container |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | Il suo token, di almeno 16 caratteri. Conservalo: d'ora in poi il runner accede con esso |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Facoltativa: un join token, usato solo finché il suo runner non esiste ancora o attende l'approvazione |

Aggiungi queste quando la rete ne ha bisogno:

| Variabile | Quando |
|---|---|
| `HTTPS_PROXY`, `NO_PROXY` | L'RTE raggiunge l'app tramite un proxy: `HTTPS_PROXY=http://proxy.dc2.example.com:3128`. Un host elencato in `NO_PROXY` (separati da virgole, `.example.com` per un dominio) viene contattato direttamente |
| `NODE_EXTRA_CA_CERTS` | Il certificato dell'app proviene da una CA privata: metti il certificato della CA in `/opt/af-rte/data/certificates/ca.pem` e imposta `NODE_EXTRA_CA_CERTS=/app/dist/persistent/certificates/ca.pem` |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `0` accetta qualsiasi certificato dell'app, compreso uno autofirmato. Solo all'interno di una rete fidata: preferisci `NODE_EXTRA_CA_CERTS` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (predefinito) riceve i playbook e gli inventari con ogni job. Lascialo così, a meno che non li monti tu sull'RTE (`local`) |

Le altre impostazioni che legge un RTE sono in [Eseguire un RTE](run.html#settings). `RTE_MAX_JOBS`, `RTE_CACHE_MB`, `RTE_FILES` e
`RTE_DRAIN_SECONDS` si possono impostare anche in seguito nella sua pagina del runner, che vince sulla variabile (vedi
[Le impostazioni di un RTE](../runners/runner-page.html#an-rtes-settings)).

---

## 6. Avviarlo

Un file compose tiene l'intera definizione in un solo posto, accanto alle impostazioni. Metti l'immagine del passaggio 4 in `image:`:

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

Docker lo riavvia dopo un reboot (`unless-stopped`). Podman non ha un demone che lo faccia: abilita `podman-restart.service`
(`sudo systemctl enable --now podman-restart`), o esegui il container come servizio systemd con un file Quadlet. Su un host con SELinux
in modalità enforcing, aggiungi `:Z` a ogni volume (`./data:/app/dist/persistent:Z`).

Senza compose, lo stesso container con un solo comando:

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

## 7. Verificarlo sull'host

```bash
docker ps --filter name=af_rte_dc2        # STATUS ends in (healthy): the process listens
docker logs -f af_rte_dc2                 # Ctrl+C to stop following
curl -s http://127.0.0.1:8000/ready       # {"status":"ready"} once the socket to the app is open
```

Il log mostra l'RTE che parte, contatta l'app e si connette:

```
RTE 'rte-dc2' 7.3.0 (outbound, files transfer) listening on http port 8000, token fingerprint abcd-ef12
RTE 'rte-dc2': dialing the app at wss://forms.example.com/api/v2/rte/socket
RTE 'rte-dc2': connected to the app (node af-app1-8000)
```

Senza un join token, un'altra riga dice che è in attesa:
`RTE 'rte-dc2': waiting for an admin to approve it under Connections > Runners (fingerprint abcd-ef12)`. Annota l'impronta.

`/ready` risponde `503` con `not connected to the app` finché il socket non è aperto. L'healthcheck dice solo che il processo è in ascolto.

---

## 8. Approvarlo

Senza un join token, l'RTE ha chiesto di unirsi: **Connessioni > Runner** mostra un avviso arancione sopra la lista,
**1 Runner attende l'approvazione**. Aprilo, verifica che l'**Impronta** sia quella del log dell'RTE e che **Modalità** dica
In uscita, poi fai clic su **Approva** (vedi [Approvare un RTE](../runners/registration.html#approving-an-rte)). Solo un admin approva. Una richiesta
che nessuno gestisce entro 24 ore viene rimossa, e l'RTE chiede di nuovo la prossima volta che contatta l'app.

Con un join token, il runner viene approvato subito e la sua descrizione indica il join token. In entrambi i casi l'app conserva il token dell'RTE
in una nuova credenziale RTE, `rte-dc2-rte`, e da quel momento l'RTE accede con il proprio `RTE_TOKEN`: `RTE_JOIN_TOKEN` non viene più
usato, e puoi rimuoverlo da `rte.env`.

---

## 9. Verificarlo in AnsibleForms

1. **Connessioni > Runner** elenca il runner `rte-dc2`, tipo RTE. Attiva **Colonne > Connessione** per vedere **Connesso** nella lista
2. Aprilo. La sua scheda **RTE** mostra **Modalità** In uscita e il badge **Connessione** **Connesso**; al passaggio del puntatore indica il nodo dell'app che
   detiene il socket, la versione dell'RTE e quanti dei suoi job sono in esecuzione
3. Fai clic su **Testa connessione**: dice **Runner connection is OK**. Non chiama nulla: legge quale nodo dell'app detiene il socket dell'RTE
   (`runner_leases`) e verifica il contratto che l'RTE ha parlato quando si è connesso
4. Dagli una descrizione, come *Datacenter 2*
5. Lascia **Predefinito** sul runner del datacenter 1, a meno che ogni modulo di playbook senza `runner:` non debba girare nel datacenter 2

La pagina **Stato** elenca il nuovo RTE con la sua versione, accanto agli altri.

---

## 10. Un primo job

Prova l'intero percorso con un playbook che non cambia nulla. Nei playbook dell'app (la sua cartella dei playbook o il suo repository, come nel
datacenter 1), aggiungi `ping-dc2.yaml`:

```yaml
- name: Reach the hosts of datacenter 2
  hosts: all
  gather_facts: false
  tasks:
    - name: Ping
      ansible.builtin.ping:
```

Poi aggiungi nel designer un modulo che indica il nuovo runner:

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

Avvialo. L'app invia la cartella dei playbook e l'inventario con il job, e l'RTE li conserva in base al loro hash, così una cartella invariata
non viene mai inviata due volte. L'output inizia con `Running on RTE rte-dc2 (outbound)`, mostra `pong` per ogni host, e il job
termina con successo. Una cartella più grande di [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (512 per impostazione predefinita) non viene
inviata: il job fallisce e lo segnala.

---

## 11. Mandargli i moduli

Un modulo gira sull'RTE che indica, quindi aggiungi la stessa riga a ogni modulo per il datacenter 2:

```yaml
runner: rte-dc2
```

Vedi [Runner](../runners.html) per il runner predefinito e gli altri tipi di runner.

---

## Quando qualcosa non funziona

L'RTE scrive in `docker logs` da `notice` in su. Una connessione che fallisce prima che il socket si apra (un nome DNS, una porta rifiutata, un
certificato) compare solo come `RTE: dialing the app again in <n> seconds`, a livello `info`: imposta
[`LOG_CONSOLE_LEVEL=debug`](../customization/logging.html#env_LOG_CONSOLE_LEVEL) in `rte.env` e riavvialo per vedere
`RTE: socket to wss://...: <the error>`.

| Cosa vedi | Dove | Cosa fare |
|---|---|---|
| `RTE: set RTE_TOKEN (at least 16 characters) ; refusing to start` | `docker logs` | `RTE_TOKEN` manca o è troppo corto in `rte.env` |
| `RTE: RTE_MODE=outbound needs APP_URL, the app's address (https://forms.example.com) ; refusing to start` | `docker logs` | Imposta `APP_URL` in `rte.env` |
| `RTE: APP_URL must be an http or https address, not ... ; refusing to start` | `docker logs` | `APP_URL` deve iniziare con `https://` (o `http://`) |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set)` | `docker logs` | Manca `RTE_MODE=outbound` in `rte.env` |
| Nessuna riga `connected to the app`, `/ready` resta `503` | `docker logs`, `/ready` | La rete del passaggio 2: fai `curl` all'app da questo host, il proxy (`HTTPS_PROXY`, `NO_PROXY`), il certificato dell'app (`NODE_EXTRA_CA_CERTS`, passaggio 5). Imposta `LOG_CONSOLE_LEVEL=debug` per vedere l'errore |
| `the app refused the socket (404)` o un altro stato diverso da 401, 403 e 409 | `docker logs` | Un reverse proxy non fa passare il WebSocket su `/api/v2/rte/socket`, o ad `APP_URL` manca il percorso di base dell'app |
| `the app refused the socket (401): ... the token of RTE 'rte-dc2' is not the one stored for its runner: check its RTE_TOKEN` | `docker logs` | Esiste un runner `rte-dc2` con un altro token. Dai all'RTE quel token (la password della credenziale del runner), o elimina il runner così che chieda di unirsi |
| `the app refused the socket (401): ... the join token (RTE_JOIN_TOKEN) is unknown, revoked, expired or used up` | `docker logs` | Crea un nuovo join token, o rimuovi `RTE_JOIN_TOKEN` e approva l'RTE (passaggio 8) |
| `the app refused the socket (409): ... runner 'rte-dc2' exists and is approved: a join token cannot give it a new token ...` | `docker logs` | L'RTE è stato reinstallato con un nuovo token: usa il token della credenziale del suo runner, o fallo cambiare a un admin |
| `the app refused this RTE (401): dialing again in 10 minutes, or restart it once an admin acted` | `docker logs` | Segue un rifiuto. Correggine la causa, poi `docker restart af_rte_dc2` invece di aspettare |
| `waiting for an admin to approve it under Connections > Runners` | `docker logs` | Approvalo (passaggio 8). È connesso, ma fino ad allora non riceve job |
| `the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds` | `docker logs` | L'app e l'RTE eseguono versioni con un altro [contratto](images.html#the-contract): aggiorna l'RTE alla versione dell'app (vedi Aggiornarlo) |
| **Non connesso**, o **Testa connessione** dice *the RTE 'rte-dc2' (outbound) is not connected: it has not dialed the app* | L'app | Nessun nodo dell'app detiene il suo socket: l'RTE è fermo, o non riesce a raggiungere l'app. Leggi i suoi `docker logs` |
| Un job attende, poi fallisce con *no app node holds a socket to RTE 'rte-dc2' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?* | L'output del job | L'RTE non era connesso mentre il job attendeva |
| `Permission denied` sulla chiave ssh | L'output del job | I file di `data/` devono appartenere all'uid 1000 (passaggio 3) |
| `UNREACHABLE` per gli host gestiti | L'output del job | ssh da questo host: la chiave, `known_hosts`, e il firewall verso gli host |

Sul lato dell'app, un RTE rifiutato compare nel log dell'app come `Refused an RTE socket from <address>: <why>`.

---

## Aggiornarlo

Quando l'app passa a una nuova versione, seguila anche su questo host. Un RTE con lo stesso contratto continua a funzionare nel frattempo; quando una versione
cambia il contratto, le sue note di rilascio lo dicono (vedi [Il contratto](images.html#the-contract)). Con `:7` in `compose.yml`, o nel
`FROM` del tuo Dockerfile:

```bash
cd /opt/af-rte
docker compose pull                 # option A; for option B: docker build --pull -t af-rte-dc2 build
docker compose up -d
docker image prune -f               # removes the image it no longer uses
```

Aggiornalo quando non c'è nessun playbook in esecuzione su di esso: un arresto attende `RTE_DRAIN_SECONDS` (25) per i playbook in esecuzione, e quelli ancora in esecuzione
terminano allora come abbandonati. Ciò che hanno stampato prima dell'arresto viene conservato nello spool e inviato quando l'RTE torna. Offline, esegui `docker load`
della nuova immagine (passaggio 4) prima di `docker compose up -d`.

---

## Tornare indietro

```bash
cd /opt/af-rte && docker compose down     # or: docker rm -f af_rte_dc2
```

Il socket si chiude, e il runner mostra subito **Non connesso**: nessun nodo dell'app detiene più il suo socket (`runner_leases`). Un host
che se ne va senza chiuderlo mostra **Non connesso** entro circa un minuto, quando il nodo dell'app non sente più nulla sul socket. Il
runner resta: un runner che si è unito tramite un socket non viene mai rimosso da solo. Eliminalo in **Connessioni > Runner**, e la sua
credenziale `rte-dc2-rte` in **Connessioni > Credenziali**. Rimuovi prima la riga `runner:` dai moduli che lo indicavano: fino ad
allora i loro job attendono l'RTE, fino a `RTE_QUEUE_MINUTES`, e falliscono.

---

## Più capacità nel datacenter 2

Ripeti i passaggi da 1 a 9 su altri host del datacenter 2, ognuno con il proprio `RTE_NAME` e `RTE_TOKEN`, come `rte-dc2-b`: ognuno si unisce come
runner proprio e riceve fino a [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbook. Un modulo ne sceglie uno con
`runner:`. Due RTE con lo stesso `RTE_NAME` non si dividono il lavoro: il secondo prende il socket al primo (vedi
[Più RTE](several.html#several-rtes)).

---

## Un RTE in modalità database

Prima della 7.3.0 questo runbook configurava un RTE in modalità database: conteneva le credenziali del database (`DB_*`, `ENCRYPTION_SECRET`), si connetteva
al database del datacenter 1 sulla porta `3306`, e l'app lo chiamava sulla sua porta `8000`. Quella modalità è deprecata dalla 7.3.0 e
verrà rimossa nella 8.0.0. Per passare un RTE del genere alla modalità in uscita senza un nuovo runner, imposta su di esso `RTE_MODE=outbound`, `APP_URL` e `RTE_NAME` (il nome del
suo runner), mantieni il suo `RTE_TOKEN`, e rimuovi `DB_*`, `ENCRYPTION_SECRET` e `RTE_REGISTER`: vedi
[Database (deprecata)](modes.html#database-deprecated). Poi chiudi la porta `8000` e la porta del database di cui non ha più bisogno.
