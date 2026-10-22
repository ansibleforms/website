---
layout: default
title: Un altre centre de dades
parent: RTE
nav_order: 5
translated_from: e2e67586abfd6c910942d1775e5331c1f889727e
---

# Un RTE en un altre centre de dades
{: .no_toc }

D'un host buit en un segon centre de dades a un RTE sortint que executa el seu primer playbook
{: .fs-6 .fw-300 }

* TOC
{:toc}

---

Per a administradors: quan els hosts gestionats d'un segon centre de dades s'han de gestionar des d'un RTE d'aquell centre de dades, no des del primer.

{: .note }
> **El camí fàcil.** L'[instal·lador](../installation/installer.html#a-runner) fa tots els passos de més avall a l'host de l'RTE amb una sola ordre:
> `curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner`, amb `--join afj_...` perquè s'aprovi a l'instant.
> Aquest runbook fa el mateix a mà, amb Docker o Podman, perquè puguis veure i adaptar cada part.

---

## Què tindràs al final

L'aplicació, el seu worker i la seva base de dades es queden on són, al centre de dades 1. El centre de dades 2 rep un host que executa un contenidor RTE en
mode sortint ([`RTE_MODE=outbound`](../customization/server.html#env_RTE_MODE), vegeu [Modes](modes.html#outbound)): truca a l'aplicació per
HTTPS i manté un WebSocket obert, s'uneix com a runner propi, i executa els playbooks dels formularis que el nomenen contra els hosts
gestionats del centre de dades 2.

| On | Què s'hi executa | Parla amb |
|---|---|---|
| Centre de dades 1 | Els nodes d'aplicació, el worker, la base de dades (com fins ara) | Res de nou: rep el sòcol de l'RTE a la seva adreça HTTPS habitual |
| Centre de dades 2, l'host de l'RTE | Docker o Podman, i el contenidor RTE | L'aplicació a `APP_URL` per HTTPS, i els hosts gestionats del centre de dades 2 |

L'RTE no té cap credencial de base de dades ni cap `ENCRYPTION_SECRET`, només un token propi. Res no s'hi connecta, així que no necessita cap port
obert, ni cap nom DNS, ni cap certificat. L'aplicació envia els playbooks i els inventaris amb cada tasca (`RTE_FILES=transfer`, el
predeterminat), així que l'RTE no en necessita cap còpia ni cap disc compartit.

Totes les ordres de més avall s'executen en un terminal a l'host de l'RTE, com a usuari amb `sudo`, tret que s'indiqui el contrari. Calen uns 20 minuts,
la major part esperant la imatge.

---

## 0. Abans de començar

Recull això:

| Què | D'on surt |
|---|---|
| L'adreça de l'aplicació | `APP_URL`: l'adreça que la gent obre en un navegador, com ara `https://forms.example.com`, amb el seu camí base si en té |
| El certificat de l'aplicació | Signat per una CA pública, per una CA privada (en necessites el certificat, pas 6), o autosignat |
| Un proxy | L'`HTTPS_PROXY` que fa servir aquest centre de dades per arribar al centre de dades 1, si n'hi ha |
| El nom de l'RTE | El nom del seu runner a **Connexions > Runners**, el que els formularis nomenen amb `runner:`, com ara `rte-dc2`: lletres, xifres i `_ . : @ -` |
| Un token d'unió | Opcional: un [token d'unió](../runners/registration.html#join-tokens) (`afj_...`) aprova l'RTE a l'instant. Sense, l'aprova un admin (pas 8) |
| La clau ssh | La clau privada que fan servir els playbooks per arribar als hosts gestionats, o el permís per crear-ne una |

L'aplicació ha de funcionar amb la 7.3.0 o posterior. Per crear un token d'unió només per a aquest RTE, un admin crida l'API una vegada (vegeu
[Tokens d'unió](../runners/registration.html#join-tokens)):

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <an admin's token>" -H "Content-Type: application/json" \
  -d '{ "name": "rte-dc2", "expiresInHours": 24, "maxUses": 1 }'
```

---

## 1. Preparar l'host

L'RTE és un contenidor, així que l'host necessita un motor de contenidors i res més: Node.js, python i ansible són a la imatge.

| Cal | Per què |
|---|---|
| Linux en **x86_64** (amd64) | Les imatges de l'RTE només es publiquen per a amd64 |
| 2 CPU i 4 GB de memòria, o més | Un RTE executa fins a [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks alhora (10), cadascun amb els seus forks: dimensiona'l per a ells |
| 20 GB de disc lliure | La imatge `-rte-full` fa uns 3,3 GB, més una imatge durant les actualitzacions, els fitxers de tasca que envia l'aplicació i els fitxers temporals de les tasques |
| Docker, o Podman amb podman-compose | Per descarregar i executar la imatge |
| L'hora sincronitzada per NTP | Les hores de les tasques es comparen amb les de l'aplicació |

**Docker**, a Ubuntu o Debian (altres distribucions: [docs.docker.com/engine/install](https://docs.docker.com/engine/install/)):

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl chrony
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker chrony
sudo usermod -aG docker $USER          # log out and in again, so docker works without sudo
docker run --rm hello-world
docker compose version
```

**Podman**, a RHEL, Rocky o Alma Linux:

```bash
sudo dnf install -y podman podman-compose chrony
sudo systemctl enable --now chronyd
podman run --rm quay.io/podman/hello
```

Amb Podman, escriu `podman` en lloc de `docker` i `podman-compose` en lloc de `docker compose` a totes les ordres de més avall.

---

## 2. Xarxa i tallafocs

L'RTE obre ell mateix totes les connexions. Res no hi arriba des de fora:

| Des de | Cap a | Port | Per què |
|---|---|---|---|
| L'host de l'RTE | L'aplicació, a `APP_URL` (a través d'`HTTPS_PROXY` si està definit) | El port de l'aplicació, `443` darrere de la majoria de proxies | El sòcol per on passen les tasques, els seus fitxers i la seva sortida |
| L'host de l'RTE | Els hosts gestionats del centre de dades 2 | ssh (`22`), WinRM, les seves API | Els playbooks s'executen des d'aquí |
| L'host de l'RTE | `ghcr.io` | `443` | Per descarregar la imatge, tret que vingui del teu propi registre o d'un fitxer (pas 4) |

No obris cap port d'entrada per a l'RTE. El seu `PORT` (`8000`) només serveix `/live`, `/ready` i `/metrics`, per a les sondes d'aquest host.

L'RTE truca a `APP_URL` amb `/api/v2/rte/socket` afegit, com a WebSocket. Un proxy invers davant de l'aplicació ha de deixar passar l'upgrade
en aquest camí (vegeu [WebSockets dels runners](../production/reverse-proxy.html#runner-websockets)). Comprova des d'aquí que l'aplicació respon:

```bash
curl -sS https://forms.example.com/api/v2/version
```

---

## 3. Carpetes

Tot és sota `/opt/af-rte`. L'RTE s'executa com l'usuari `node` (uid 1000), així que les seves dades pertanyen a aquest uid:

```bash
sudo mkdir -p /opt/af-rte/data/{ssh,certificates,ansible/roles,ansible/collections,git}
sudo touch /opt/af-rte/data/ansible/ansible.cfg /opt/af-rte/data/git/.gitconfig
```

| Carpeta | Al contenidor | Conté |
|---|---|---|
| `data/` | `/app/dist/persistent` | L'spool (`rte-spool`: la sortida i el final de cada tasca fins que l'aplicació els ha desat), els fitxers de tasca que ha enviat l'aplicació (`rte-files`), una CA privada, les biblioteques de python que instal·la un playbook |
| `data/ssh/` | `/home/node/.ssh` | La clau ssh i el `known_hosts` dels playbooks |
| `data/ansible/` | `/etc/ansible/...` | Un `ansible.cfg`, rols i col·leccions propis, muntats en lloc d'incloure'ls a la imatge |

Mantén `data/` a l'host: un RTE reiniciat encara envia el que l'aplicació no havia desat, i conserva la seva memòria cau de fitxers de tasca.

**Clau ssh.** Copia la clau que fan servir els playbooks al centre de dades 1, o crea'n una per a aquest centre de dades i dona'n la part pública als hosts gestionats:

```bash
sudo ssh-keygen -t ed25519 -N "" -C "ansibleforms-rte-dc2" -f /opt/af-rte/data/ssh/id_ed25519
sudo cat /opt/af-rte/data/ssh/id_ed25519.pub      # add it to ~/.ssh/authorized_keys of the managed user on each host
sudo sh -c 'ssh-keyscan host1.dc2.example.com host2.dc2.example.com >> /opt/af-rte/data/ssh/known_hosts'
```

Després dona-ho tot a l'uid 1000, amb la clau llegible només pel seu propietari:

```bash
sudo chown -R 1000:1000 /opt/af-rte/data
sudo chmod 700 /opt/af-rte/data/ssh && sudo chmod 600 /opt/af-rte/data/ssh/id_*
```

---

## 4. La imatge

Tria una de les dues opcions.

### Opció A: la imatge oficial
{: .no_toc }

Les imatges publicades són al GitHub Container Registry, públiques, sense necessitat d'iniciar sessió (vegeu [Imatges](images.html) per a les tres capes).
Agafa la mateixa capa que al centre de dades 1. `:7` segueix la darrera versió 7, igual que el `:7` de l'aplicació:

```bash
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Un host sense accés a internet obté la imatge d'un que en té:

```bash
# on a host with internet
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
docker save ghcr.io/ansibleforms/ansibleforms-rte-full:7 | gzip > rte-full-7.tar.gz
# copy the file to the RTE host, then there
docker load < rte-full-7.tar.gz
```

O puja-la una vegada al teu propi registre (`docker tag` i `docker push`), i fes servir aquest nom als passos següents.

### Opció B: la teva pròpia imatge
{: .no_toc }

Quan els playbooks del centre de dades 2 necessiten col·leccions o biblioteques de python que la imatge oficial no té (les de VMware per al vCenter d'aquest centre de dades,
per exemple), construeix sobre `ansibleforms-rte-core`:

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

Torna-la a construir a cada versió nova de l'aplicació (vegeu [Construir el teu propi RTE](images.html#build-your-own-rte)). Amb diversos hosts RTE, construeix-la
una vegada i puja-la al teu propi registre. Sense connexió, fes `docker save` i `docker load` de la imatge construïda com a l'opció A.

---

## 5. Ajustos

Un [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) nou i propi, d'almenys 16 caràcters. És la contrasenya d'aquest RTE: l'aplicació
el conserva a la credencial RTE del runner, i hi segella els secrets de cada tasca.

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

| Variable | Significat |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | `outbound`: l'RTE truca a l'aplicació. Sense aquesta variable l'RTE arrenca en el mode base de dades obsolet |
| [`APP_URL`](../customization/server.html#env_APP_URL) | L'adreça de l'aplicació, `http://` o `https://`, amb el seu camí base si en té |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | El nom del seu runner. Si no es defineix: el seu id de node, `rte-<hostname>-<port>`, que canvia amb el contenidor |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | El seu propi token, d'almenys 16 caràcters. Conserva'l: el runner hi inicia sessió a partir d'ara |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Opcional: un token d'unió, que només es fa servir mentre el seu runner encara no existeix o espera aprovació |

Afegeix aquests quan la xarxa els necessiti:

| Variable | Quan |
|---|---|
| `HTTPS_PROXY`, `NO_PROXY` | L'RTE arriba a l'aplicació a través d'un proxy: `HTTPS_PROXY=http://proxy.dc2.example.com:3128`. Un host llistat a `NO_PROXY` (separats per comes, `.example.com` per a un domini) es truca directament |
| `NODE_EXTRA_CA_CERTS` | El certificat de l'aplicació ve d'una CA privada: posa el certificat de la CA a `/opt/af-rte/data/certificates/ca.pem` i defineix `NODE_EXTRA_CA_CERTS=/app/dist/persistent/certificates/ca.pem` |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `0` accepta qualsevol certificat de l'aplicació, un d'autosignat inclòs. Només dins d'una xarxa de confiança: millor `NODE_EXTRA_CA_CERTS` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (predeterminat) obté els playbooks i els inventaris amb cada tasca. Deixa'l així, tret que els muntis tu mateix a l'RTE (`local`) |

Els altres ajustos que llegeix un RTE són a [Executar un RTE](run.html#settings). `RTE_MAX_JOBS`, `RTE_CACHE_MB`, `RTE_FILES` i
`RTE_DRAIN_SECONDS` també es poden definir més endavant a la seva pàgina de runner, que guanya a la variable (vegeu
[La configuració d'un RTE](../runners/runner-page.html#an-rtes-settings)).

---

## 6. Iniciar-lo

Un fitxer compose manté tota la definició en un sol lloc, al costat dels ajustos. Posa la imatge del pas 4 a `image:`:

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

Docker el torna a iniciar després d'un reinici (`unless-stopped`). Podman no té cap dimoni que ho faci: activa `podman-restart.service`
(`sudo systemctl enable --now podman-restart`), o executa el contenidor com a servei systemd amb un fitxer Quadlet. En un host amb SELinux
en mode enforcing, afegeix `:Z` a cada volum (`./data:/app/dist/persistent:Z`).

Sense compose, el mateix contenidor amb una sola ordre:

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

## 7. Comprovar-lo a l'host

```bash
docker ps --filter name=af_rte_dc2        # STATUS ends in (healthy): the process listens
docker logs -f af_rte_dc2                 # Ctrl+C to stop following
curl -s http://127.0.0.1:8000/ready       # {"status":"ready"} once the socket to the app is open
```

El registre mostra com l'RTE arrenca, truca a l'aplicació i s'hi connecta:

```
RTE 'rte-dc2' 7.3.0 (outbound, files transfer) listening on http port 8000, token fingerprint abcd-ef12
RTE 'rte-dc2': dialing the app at wss://forms.example.com/api/v2/rte/socket
RTE 'rte-dc2': connected to the app (node af-app1-8000)
```

Sense token d'unió, una línia més indica que espera:
`RTE 'rte-dc2': waiting for an admin to approve it under Connections > Runners (fingerprint abcd-ef12)`. Anota't l'empremta.

`/ready` respon `503` amb `not connected to the app` fins que el sòcol està obert. El healthcheck només indica que el procés escolta.

---

## 8. Aprovar-lo

Sense token d'unió, l'RTE ha demanat unir-se: **Connexions > Runners** mostra un avís taronja damunt de la llista,
**1 Runner espera aprovació**. Obre'l, comprova que l'**Empremta** és la del registre de l'RTE i que el **Mode** diu
Sortint, i després fes clic a **Aprova** (vegeu [Aprovar un RTE](../runners/registration.html#approving-an-rte)). Només un admin pot aprovar. Una sol·licitud
que ningú no gestiona en 24 hores s'elimina, i l'RTE ho torna a demanar el proper cop que truca a l'aplicació.

Amb un token d'unió, el runner s'aprova a l'instant i la seva descripció nomena el token d'unió. En tots dos casos l'aplicació conserva el token de l'RTE
en una credencial RTE nova, `rte-dc2-rte`, i l'RTE hi inicia sessió amb el seu propi `RTE_TOKEN` a partir d'aleshores: `RTE_JOIN_TOKEN` ja no
es fa servir, i el pots treure de `rte.env`.

---

## 9. Comprovar-lo a AnsibleForms

1. **Connexions > Runners** llista el runner `rte-dc2`, de tipus RTE. Activa **Columnes > Connexió** per veure **Connectat** a la llista
2. Obre'l. La seva pestanya **RTE** mostra el **Mode** Sortint i la insígnia de **Connexió** **Connectat**; en passar-hi el punter nomena el node d'aplicació que
   té el sòcol, la versió de l'RTE i quantes de les seves tasques s'executen
3. Fes clic a **Prova la connexió**: diu **Runner connection is OK**. No crida res: llegeix quin node d'aplicació té el sòcol de l'RTE
   (`runner_leases`) i comprova el contracte que l'RTE ha parlat en connectar-se
4. Dona-li una descripció, com ara *Centre de dades 2*
5. Deixa **És el predeterminat** al runner del centre de dades 1, tret que tots els formularis de playbook sense `runner:` s'hagin d'executar al centre de dades 2

La pàgina **Estat** llista l'RTE nou amb la seva versió, al costat dels altres.

---

## 10. Una primera tasca

Prova tot el camí amb un playbook que no canviï res. Als playbooks de l'aplicació (la seva carpeta o el seu repositori de playbooks, com al
centre de dades 1), afegeix `ping-dc2.yaml`:

```yaml
- name: Reach the hosts of datacenter 2
  hosts: all
  gather_facts: false
  tasks:
    - name: Ping
      ansible.builtin.ping:
```

Després afegeix al dissenyador un formulari que nomeni el runner nou:

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

Llança'l. L'aplicació envia la carpeta de playbooks i l'inventari amb la tasca, i l'RTE els conserva pel seu hash, de manera que una carpeta
sense canvis no s'envia mai dues vegades. La sortida comença amb `Running on RTE rte-dc2 (outbound)`, mostra `pong` per a cada host, i la tasca
acaba amb èxit. Una carpeta més gran que [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (512 per defecte) no
s'envia: la tasca falla i ho indica.

---

## 11. Enviar-li els formularis

Un formulari s'executa a l'RTE que nomena, així que afegeix la mateixa línia a cada formulari per al centre de dades 2:

```yaml
runner: rte-dc2
```

Vegeu [Runners](../runners.html) per al runner predeterminat i els altres tipus de runner.

---

## Quan alguna cosa falla

L'RTE escriu a `docker logs` a partir de `notice`. Una connexió que falla abans que el sòcol s'obri (un nom DNS, un port rebutjat, un
certificat) només es mostra com a `RTE: dialing the app again in <n> seconds`, a `info`: defineix
[`LOG_CONSOLE_LEVEL=debug`](../customization/logging.html#env_LOG_CONSOLE_LEVEL) a `rte.env` i reinicia'l per veure
`RTE: socket to wss://...: <the error>`.

| Què veus | On | Què cal fer |
|---|---|---|
| `RTE: set RTE_TOKEN (at least 16 characters) ; refusing to start` | `docker logs` | Falta `RTE_TOKEN` a `rte.env` o és massa curt |
| `RTE: RTE_MODE=outbound needs APP_URL, the app's address (https://forms.example.com) ; refusing to start` | `docker logs` | Defineix `APP_URL` a `rte.env` |
| `RTE: APP_URL must be an http or https address, not ... ; refusing to start` | `docker logs` | `APP_URL` ha de començar per `https://` (o `http://`) |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set)` | `docker logs` | Falta `RTE_MODE=outbound` a `rte.env` |
| Cap línia `connected to the app`, `/ready` continua a `503` | `docker logs`, `/ready` | La xarxa del pas 2: fes `curl` a l'aplicació des d'aquest host, el proxy (`HTTPS_PROXY`, `NO_PROXY`), el certificat de l'aplicació (`NODE_EXTRA_CA_CERTS`, pas 5). Defineix `LOG_CONSOLE_LEVEL=debug` per veure l'error |
| `the app refused the socket (404)` o un altre estat que no sigui 401, 403 o 409 | `docker logs` | Un proxy invers no deixa passar el WebSocket a `/api/v2/rte/socket`, o a `APP_URL` li falta el camí base de l'aplicació |
| `the app refused the socket (401): ... the token of RTE 'rte-dc2' is not the one stored for its runner: check its RTE_TOKEN` | `docker logs` | Ja existeix un runner `rte-dc2` amb un altre token. Dona a l'RTE aquest token (la contrasenya de la credencial del runner), o suprimeix el runner perquè demani unir-se |
| `the app refused the socket (401): ... the join token (RTE_JOIN_TOKEN) is unknown, revoked, expired or used up` | `docker logs` | Crea un token d'unió nou, o treu `RTE_JOIN_TOKEN` i aprova l'RTE (pas 8) |
| `the app refused the socket (409): ... runner 'rte-dc2' exists and is approved: a join token cannot give it a new token ...` | `docker logs` | L'RTE s'ha tornat a instal·lar amb un token nou: fes servir el token de la credencial del seu runner, o demana a un admin que el canviï |
| `the app refused this RTE (401): dialing again in 10 minutes, or restart it once an admin acted` | `docker logs` | Ve després d'un rebuig. Corregeix-ne la causa, i després `docker restart af_rte_dc2` en lloc d'esperar |
| `waiting for an admin to approve it under Connections > Runners` | `docker logs` | Aprova'l (pas 8). Està connectat, però fins aleshores no rep cap tasca |
| `the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds` | `docker logs` | L'aplicació i l'RTE executen versions d'un altre [contracte](images.html#the-contract): actualitza l'RTE a la versió de l'aplicació (vegeu Actualitzar-lo) |
| **No connectat**, o **Prova la connexió** diu *the RTE 'rte-dc2' (outbound) is not connected: it has not dialed the app* | L'aplicació | Cap node d'aplicació no té el seu sòcol: l'RTE està aturat, o no arriba a l'aplicació. Llegeix els seus `docker logs` |
| Una tasca espera i després falla amb *no app node holds a socket to RTE 'rte-dc2' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?* | La sortida de la tasca | L'RTE no estava connectat mentre la tasca esperava |
| `Permission denied` a la clau ssh | La sortida de la tasca | Els fitxers de `data/` han de pertànyer a l'uid 1000 (pas 3) |
| `UNREACHABLE` per als hosts gestionats | La sortida de la tasca | L'ssh des d'aquest host: la clau, el `known_hosts` i el tallafocs cap als hosts |

A la banda de l'aplicació, un RTE rebutjat apareix al registre de l'aplicació com a `Refused an RTE socket from <address>: <why>`.

---

## Actualitzar-lo

Quan l'aplicació passa a una versió nova, segueix-la també en aquest host. Mentrestant, un RTE del mateix contracte continua funcionant; quan una versió
canvia el contracte, les seves notes de versió ho diuen (vegeu [El contracte](images.html#the-contract)). Amb `:7` a `compose.yml`, o al
`FROM` del teu Dockerfile:

```bash
cd /opt/af-rte
docker compose pull                 # option A; for option B: docker build --pull -t af-rte-dc2 build
docker compose up -d
docker image prune -f               # removes the image it no longer uses
```

Actualitza'l quan no s'hi executi cap playbook: una aturada espera `RTE_DRAIN_SECONDS` (25) els playbooks en execució, i els que encara s'executen
llavors acaben com a abandonats. El que han escrit abans de l'aturada es conserva a l'spool i s'envia un cop l'RTE torna. Sense connexió, fes `docker load`
de la imatge nova (pas 4) abans de `docker compose up -d`.

---

## Revertir-lo

```bash
cd /opt/af-rte && docker compose down     # or: docker rm -f af_rte_dc2
```

El sòcol es tanca, i el runner mostra **No connectat** a l'instant: cap node d'aplicació no té ja el seu sòcol (`runner_leases`). Un host
que desapareix sense tancar-lo mostra **No connectat** en un minut aproximadament, quan el node d'aplicació no sent res pel sòcol. El
runner es queda: un runner que s'ha unit per un sòcol no s'elimina mai tot sol. Suprimeix-lo a **Connexions > Runners**, i la seva
credencial `rte-dc2-rte` a **Connexions > Credencials**. Primer treu la línia `runner:` dels formularis que el nomenaven: fins
aleshores les seves tasques esperen l'RTE, fins a `RTE_QUEUE_MINUTES`, i fallen.

---

## Més capacitat al centre de dades 2

Repeteix els passos de l'1 al 9 en més hosts del centre de dades 2, cadascun amb el seu propi `RTE_NAME` i `RTE_TOKEN`, com ara `rte-dc2-b`: cadascun s'uneix com a
runner propi i accepta fins a [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks. Un formulari en tria un amb
`runner:`. Dos RTE amb el mateix `RTE_NAME` no es reparteixen la feina: el segon pren el sòcol al primer (vegeu
[Diversos RTE](several.html#several-rtes)).

---

## Un RTE en mode base de dades

Abans de la 7.3.0 aquest runbook configurava un RTE en mode base de dades: tenia les credencials de la base de dades (`DB_*`, `ENCRYPTION_SECRET`), es connectava
a la base de dades del centre de dades 1 pel port `3306`, i l'aplicació el cridava al seu port `8000`. Aquest mode és obsolet des de la 7.3.0 i
s'elimina a la 8.0.0. Per passar un RTE d'aquests a sortint sense un runner nou, defineix-hi `RTE_MODE=outbound`, `APP_URL` i `RTE_NAME` (el nom del
seu runner), conserva el seu `RTE_TOKEN`, i treu `DB_*`, `ENCRYPTION_SECRET` i `RTE_REGISTER`: vegeu
[Base de dades (obsolet)](modes.html#database-deprecated). Després tanca el port `8000` i el port de la base de dades, que ja no necessita.
