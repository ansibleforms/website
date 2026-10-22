---
layout: default
title: Un autre datacenter
parent: RTE
nav_order: 5
translated_from: e2e67586abfd6c910942d1775e5331c1f889727e
---

# Un RTE dans un autre datacenter
{: .no_toc }

D'un hôte nu dans un second datacenter à un RTE sortant qui exécute son premier playbook
{: .fs-6 .fw-300 }

* TOC
{:toc}

---

Pour les administrateurs : quand les hôtes gérés d'un second datacenter doivent être joints depuis un RTE de ce datacenter, et non depuis le premier.

{: .note }
> **La voie facile.** L'[installeur](../installation/installer.html#a-runner) réalise toutes les étapes ci-dessous sur l'hôte du RTE en une seule commande :
> `curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner`, avec `--join afj_...` pour le faire approuver immédiatement.
> Ce runbook fait la même chose à la main, avec Docker ou Podman, pour que vous puissiez voir et adapter chaque partie.

---

## Le résultat

L'application, son worker et sa base de données restent où ils sont, dans le datacenter 1. Le datacenter 2 reçoit un hôte qui exécute un conteneur RTE en
mode sortant ([`RTE_MODE=outbound`](../customization/server.html#env_RTE_MODE), voir [Modes](modes.html#outbound)) : il contacte l'application en
HTTPS et garde un WebSocket ouvert, rejoint comme runner à part entière, et exécute les playbooks des formulaires qui le nomment sur les hôtes
gérés du datacenter 2.

| Où | Ce qui y tourne | Parle à |
|---|---|---|
| Datacenter 1 | Les nœuds d'application, le worker, la base de données (comme aujourd'hui) | Rien de nouveau : il accepte le socket du RTE sur son adresse HTTPS habituelle |
| Datacenter 2, l'hôte du RTE | Docker ou Podman, et le conteneur RTE | L'application à `APP_URL` en HTTPS, et les hôtes gérés du datacenter 2 |

Le RTE ne détient aucun identifiant de base de données ni `ENCRYPTION_SECRET`, seulement un jeton à lui. Rien ne s'y connecte, il n'a donc besoin d'aucun port
ouvert, d'aucun nom DNS ni d'aucun certificat. L'application envoie les playbooks et les inventaires avec chaque job (`RTE_FILES=transfer`, la valeur
par défaut), le RTE n'a donc besoin ni d'en avoir une copie ni d'un disque partagé.

Toutes les commandes ci-dessous s'exécutent dans un terminal sur l'hôte du RTE, en tant qu'utilisateur disposant de `sudo`, sauf indication contraire. Comptez environ 20 minutes,
dont la plupart à attendre l'image.

---

## 0. Avant de commencer

Rassemblez ceci :

| Quoi | D'où cela vient |
|---|---|
| L'adresse de l'application | `APP_URL` : l'adresse que les gens ouvrent dans un navigateur, comme `https://forms.example.com`, avec son chemin de base s'il en a un |
| Le certificat de l'application | Signé par une CA publique, une CA privée (il vous faut son certificat, étape 6), ou auto-signé |
| Un proxy | Le `HTTPS_PROXY` qu'utilise ce datacenter pour joindre le datacenter 1, s'il y en a un |
| Le nom du RTE | Le nom de son runner dans **Connexions > Runners**, que les formulaires nomment avec `runner:`, comme `rte-dc2` : lettres, chiffres et `_ . : @ -` |
| Un jeton d'adhésion | Facultatif : un [jeton d'adhésion](../runners/registration.html#join-tokens) (`afj_...`) approuve le RTE immédiatement. Sans lui, un admin l'approuve (étape 8) |
| La clé ssh | La clé privée qu'utilisent les playbooks pour joindre les hôtes gérés, ou le droit d'en créer une |

L'application doit être en 7.3.0 ou ultérieure. Pour créer un jeton d'adhésion pour ce seul RTE, un admin appelle l'API une fois (voir
[Jetons d'adhésion](../runners/registration.html#join-tokens)) :

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <an admin's token>" -H "Content-Type: application/json" \
  -d '{ "name": "rte-dc2", "expiresInHours": 24, "maxUses": 1 }'
```

---

## 1. Préparer l'hôte

Le RTE est un conteneur, l'hôte n'a donc besoin que d'un moteur de conteneurs : Node.js, python et ansible sont dans l'image.

| Besoin | Pourquoi |
|---|---|
| Linux sur **x86_64** (amd64) | Les images RTE ne sont publiées que pour amd64 |
| 2 CPU et 4 Go de mémoire, ou plus | Un RTE exécute jusqu'à [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks à la fois (10), chacun avec ses forks : dimensionnez-le en conséquence |
| 20 Go d'espace disque libre | L'image `-rte-full` fait environ 3,3 Go, plus une image pendant les mises à jour, les fichiers de job qu'envoie l'application et les fichiers temporaires des jobs |
| Docker, ou Podman avec podman-compose | Pour tirer et exécuter l'image |
| L'heure réglée par NTP | Les heures des jobs sont comparées à celles de l'application |

**Docker**, sur Ubuntu ou Debian (autres distributions : [docs.docker.com/engine/install](https://docs.docker.com/engine/install/)) :

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl chrony
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker chrony
sudo usermod -aG docker $USER          # log out and in again, so docker works without sudo
docker run --rm hello-world
docker compose version
```

**Podman**, sur RHEL, Rocky ou Alma Linux :

```bash
sudo dnf install -y podman podman-compose chrony
sudo systemctl enable --now chronyd
podman run --rm quay.io/podman/hello
```

Avec Podman, écrivez `podman` au lieu de `docker` et `podman-compose` au lieu de `docker compose` dans toutes les commandes ci-dessous.

---

## 2. Réseau et pare-feu

Le RTE ouvre lui-même chaque connexion. Rien ne l'atteint depuis l'extérieur :

| De | Vers | Port | Pourquoi |
|---|---|---|---|
| L'hôte du RTE | L'application, à `APP_URL` (via `HTTPS_PROXY` s'il est défini) | Le port de l'application, `443` derrière la plupart des proxies | Le socket par lequel passent les jobs, leurs fichiers et leur sortie |
| L'hôte du RTE | Les hôtes gérés du datacenter 2 | ssh (`22`), WinRM, leurs API | Les playbooks s'exécutent d'ici |
| L'hôte du RTE | `ghcr.io` | `443` | Pour tirer l'image, sauf si elle vient de votre propre registre ou d'un fichier (étape 4) |

N'ouvrez aucun port entrant pour le RTE. Son `PORT` (`8000`) ne sert que `/live`, `/ready` et `/metrics`, pour les sondes sur cet hôte.

Le RTE contacte `APP_URL` suivi de `/api/v2/rte/socket`, en WebSocket. Un reverse proxy devant l'application doit transmettre l'upgrade
pour ce chemin (voir [WebSockets des runners](../production/reverse-proxy.html#runner-websockets)). Vérifiez d'ici que l'application répond :

```bash
curl -sS https://forms.example.com/api/v2/version
```

---

## 3. Dossiers

Tout se trouve sous `/opt/af-rte`. Le RTE tourne en tant qu'utilisateur `node` (uid 1000), ses données appartiennent donc à cet uid :

```bash
sudo mkdir -p /opt/af-rte/data/{ssh,certificates,ansible/roles,ansible/collections,git}
sudo touch /opt/af-rte/data/ansible/ansible.cfg /opt/af-rte/data/git/.gitconfig
```

| Dossier | Dans le conteneur | Contient |
|---|---|---|
| `data/` | `/app/dist/persistent` | Le spool (`rte-spool` : la sortie et la fin de chaque job jusqu'à ce que l'application les ait enregistrées), les fichiers de job qu'a envoyés l'application (`rte-files`), une CA privée, les bibliothèques python qu'installe un playbook |
| `data/ssh/` | `/home/node/.ssh` | La clé ssh et le `known_hosts` des playbooks |
| `data/ansible/` | `/etc/ansible/...` | Un `ansible.cfg`, des rôles et des collections à vous, montés au lieu d'être intégrés |

Gardez `data/` sur l'hôte : un RTE redémarré envoie encore ce que l'application n'avait pas enregistré, et garde son cache de fichiers de job.

**Clé ssh.** Copiez la clé qu'utilisent les playbooks dans le datacenter 1, ou créez-en une pour ce datacenter et donnez sa partie publique aux hôtes gérés :

```bash
sudo ssh-keygen -t ed25519 -N "" -C "ansibleforms-rte-dc2" -f /opt/af-rte/data/ssh/id_ed25519
sudo cat /opt/af-rte/data/ssh/id_ed25519.pub      # add it to ~/.ssh/authorized_keys of the managed user on each host
sudo sh -c 'ssh-keyscan host1.dc2.example.com host2.dc2.example.com >> /opt/af-rte/data/ssh/known_hosts'
```

Donnez ensuite tout à l'uid 1000, avec la clé lisible par son seul propriétaire :

```bash
sudo chown -R 1000:1000 /opt/af-rte/data
sudo chmod 700 /opt/af-rte/data/ssh && sudo chmod 600 /opt/af-rte/data/ssh/id_*
```

---

## 4. L'image

Choisissez l'une des deux.

### Option A : l'image officielle
{: .no_toc }

Les images publiées se trouvent sur le GitHub Container Registry, publiques, sans connexion nécessaire (voir [Images](images.html) pour les trois couches).
Prenez la même couche que dans le datacenter 1. `:7` suit la dernière version 7, comme le fait le `:7` de l'application :

```bash
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Un hôte sans accès à internet obtient l'image depuis un hôte qui en a un :

```bash
# on a host with internet
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
docker save ghcr.io/ansibleforms/ansibleforms-rte-full:7 | gzip > rte-full-7.tar.gz
# copy the file to the RTE host, then there
docker load < rte-full-7.tar.gz
```

Ou poussez-la une fois vers votre propre registre (`docker tag` et `docker push`), et utilisez ce nom dans les étapes suivantes.

### Option B : votre propre image
{: .no_toc }

Quand les playbooks du datacenter 2 ont besoin de collections ou de bibliothèques python absentes de l'image officielle (celles de VMware pour le vCenter
de ce datacenter, par exemple), partez de `ansibleforms-rte-core` :

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

Reconstruisez-la à chaque nouvelle version de l'application (voir [Construire votre propre RTE](images.html#build-your-own-rte)). Avec plusieurs hôtes RTE, construisez
une fois et poussez vers votre propre registre. Hors ligne, faites `docker save` et `docker load` de l'image construite comme dans l'option A.

---

## 5. Paramètres

Un nouveau [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) qui lui est propre, d'au moins 16 caractères. C'est le mot de passe de ce RTE : l'application
le conserve dans l'identifiant RTE du runner, et scelle avec lui les secrets de chaque job.

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

| Variable | Signification |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | `outbound` : le RTE contacte l'application. Sans elle, le RTE démarre dans le mode base de données déprécié |
| [`APP_URL`](../customization/server.html#env_APP_URL) | L'adresse de l'application, `http://` ou `https://`, avec son chemin de base s'il y en a un |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | Le nom de son runner. Non définie : son id de nœud, `rte-<hostname>-<port>`, qui change avec le conteneur |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | Son propre jeton, d'au moins 16 caractères. Gardez-le : le runner se connecte avec lui à partir de maintenant |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Facultative : un jeton d'adhésion, utilisé uniquement tant que son runner n'existe pas encore ou attend l'approbation |

Ajoutez celles-ci quand le réseau l'exige :

| Variable | Quand |
|---|---|
| `HTTPS_PROXY`, `NO_PROXY` | Le RTE joint l'application via un proxy : `HTTPS_PROXY=http://proxy.dc2.example.com:3128`. Un hôte listé dans `NO_PROXY` (séparé par des virgules, `.example.com` pour un domaine) est contacté directement |
| `NODE_EXTRA_CA_CERTS` | Le certificat de l'application provient d'une CA privée : placez le certificat de la CA dans `/opt/af-rte/data/certificates/ca.pem` et définissez `NODE_EXTRA_CA_CERTS=/app/dist/persistent/certificates/ca.pem` |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `0` accepte n'importe quel certificat de l'application, y compris un certificat auto-signé. Uniquement à l'intérieur d'un réseau de confiance : préférez `NODE_EXTRA_CA_CERTS` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (par défaut) reçoit les playbooks et les inventaires avec chaque job. Laissez-la, sauf si vous les montez vous-même sur le RTE (`local`) |

Les autres paramètres que lit un RTE sont sur [Exécuter un RTE](run.html#settings). `RTE_MAX_JOBS`, `RTE_CACHE_MB`, `RTE_FILES` et
`RTE_DRAIN_SECONDS` peuvent aussi être définies plus tard sur sa page de runner, qui l'emporte sur la variable (voir
[Les paramètres d'un RTE](../runners/runner-page.html#an-rtes-settings)).

---

## 6. Le démarrer

Un fichier compose garde toute la définition au même endroit, à côté des paramètres. Mettez l'image de l'étape 4 dans `image:` :

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

Docker le redémarre après un reboot (`unless-stopped`). Podman n'a pas de démon pour cela : activez `podman-restart.service`
(`sudo systemctl enable --now podman-restart`), ou exécutez le conteneur comme service systemd avec un fichier Quadlet. Sur un hôte avec SELinux
en mode enforcing, ajoutez `:Z` à chaque volume (`./data:/app/dist/persistent:Z`).

Sans compose, le même conteneur en une seule commande :

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

## 7. Le vérifier sur l'hôte

```bash
docker ps --filter name=af_rte_dc2        # STATUS ends in (healthy): the process listens
docker logs -f af_rte_dc2                 # Ctrl+C to stop following
curl -s http://127.0.0.1:8000/ready       # {"status":"ready"} once the socket to the app is open
```

Le journal montre le RTE démarrer, contacter l'application et se connecter :

```
RTE 'rte-dc2' 7.3.0 (outbound, files transfer) listening on http port 8000, token fingerprint abcd-ef12
RTE 'rte-dc2': dialing the app at wss://forms.example.com/api/v2/rte/socket
RTE 'rte-dc2': connected to the app (node af-app1-8000)
```

Sans jeton d'adhésion, une ligne de plus indique qu'il attend :
`RTE 'rte-dc2': waiting for an admin to approve it under Connections > Runners (fingerprint abcd-ef12)`. Notez l'empreinte.

`/ready` répond `503` avec `not connected to the app` tant que le socket n'est pas ouvert. Le healthcheck indique seulement que le processus écoute.

---

## 8. L'approuver

Sans jeton d'adhésion, le RTE a demandé à rejoindre : **Connexions > Runners** affiche un avis orange au-dessus de la liste,
**1 Runner attend l'approbation**. Ouvrez-le, vérifiez que l'**Empreinte** est celle du journal du RTE et que **Mode** indique
Sortant, puis **Approuver** (voir [Approuver un RTE](../runners/registration.html#approving-an-rte)). Seul un admin approuve. Une demande
que personne ne traite dans les 24 heures est supprimée, et le RTE redemande à son prochain contact avec l'application.

Avec un jeton d'adhésion, le runner est approuvé immédiatement et sa description nomme le jeton d'adhésion. Dans les deux cas, l'application conserve le jeton du RTE
dans un nouvel identifiant RTE, `rte-dc2-rte`, et le RTE se connecte avec son propre `RTE_TOKEN` à partir de là : `RTE_JOIN_TOKEN` n'est plus
utilisé, et vous pouvez le retirer de `rte.env`.

---

## 9. Le vérifier dans AnsibleForms

1. **Connexions > Runners** liste le runner `rte-dc2`, de type RTE. Activez **Colonnes > Connexion** pour voir **Connecté** dans la liste
2. Ouvrez-le. Son onglet **RTE** montre **Mode** Sortant et le badge **Connexion** **Connecté** ; au survol, il nomme le nœud d'application qui
   détient le socket, la version du RTE et combien de ses jobs tournent
3. Cliquez sur **Tester la connexion** : il indique **Runner connection is OK**. Il n'appelle rien : il lit quel nœud d'application détient le socket du RTE
   (`runner_leases`) et vérifie le contrat qu'a parlé le RTE à sa connexion
4. Donnez-lui une description, comme *Datacenter 2*
5. Laissez **Par défaut** sur le runner du datacenter 1, sauf si chaque formulaire de playbook sans `runner:` doit s'exécuter dans le datacenter 2

La page **Statut** liste le nouveau RTE avec sa version, à côté des autres.

---

## 10. Un premier job

Prouvez tout le chemin avec un playbook qui ne change rien. Dans les playbooks de l'application (son dossier ou son dépôt de playbooks, comme dans le
datacenter 1), ajoutez `ping-dc2.yaml` :

```yaml
- name: Reach the hosts of datacenter 2
  hosts: all
  gather_facts: false
  tasks:
    - name: Ping
      ansible.builtin.ping:
```

Ajoutez ensuite dans le concepteur un formulaire qui nomme le nouveau runner :

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

Lancez-le. L'application envoie le dossier des playbooks et l'inventaire avec le job, et le RTE les conserve par leur hash, si bien qu'un dossier inchangé
n'est jamais envoyé deux fois. La sortie commence par `Running on RTE rte-dc2 (outbound)`, montre `pong` pour chaque hôte, et le job
se termine en succès. Un dossier plus gros que [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (512 par défaut) n'est pas
envoyé : le job échoue et l'indique.

---

## 11. Lui envoyer les formulaires

Un formulaire s'exécute sur le RTE qu'il nomme, ajoutez donc la même ligne à chaque formulaire destiné au datacenter 2 :

```yaml
runner: rte-dc2
```

Voir [Runners](../runners.html) pour le runner par défaut et les autres types de runners.

---

## Quand quelque chose échoue

Le RTE écrit dans `docker logs` à partir de `notice`. Une connexion qui échoue avant l'ouverture du socket (un nom DNS, un port refusé, un
certificat) n'apparaît que sous la forme `RTE: dialing the app again in <n> seconds`, au niveau `info` : définissez
[`LOG_CONSOLE_LEVEL=debug`](../customization/logging.html#env_LOG_CONSOLE_LEVEL) dans `rte.env` et redémarrez-le pour voir
`RTE: socket to wss://...: <the error>`.

| Ce que vous voyez | Où | Que faire |
|---|---|---|
| `RTE: set RTE_TOKEN (at least 16 characters) ; refusing to start` | `docker logs` | `RTE_TOKEN` manque ou est trop court dans `rte.env` |
| `RTE: RTE_MODE=outbound needs APP_URL, the app's address (https://forms.example.com) ; refusing to start` | `docker logs` | Définissez `APP_URL` dans `rte.env` |
| `RTE: APP_URL must be an http or https address, not ... ; refusing to start` | `docker logs` | `APP_URL` doit commencer par `https://` (ou `http://`) |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set)` | `docker logs` | `RTE_MODE=outbound` manque dans `rte.env` |
| Aucune ligne `connected to the app`, `/ready` reste à `503` | `docker logs`, `/ready` | Le réseau de l'étape 2 : faites un `curl` de l'application depuis cet hôte, le proxy (`HTTPS_PROXY`, `NO_PROXY`), le certificat de l'application (`NODE_EXTRA_CA_CERTS`, étape 5). Définissez `LOG_CONSOLE_LEVEL=debug` pour voir l'erreur |
| `the app refused the socket (404)` ou un autre statut que 401, 403 et 409 | `docker logs` | Un reverse proxy ne transmet pas le WebSocket sur `/api/v2/rte/socket`, ou il manque à `APP_URL` le chemin de base de l'application |
| `the app refused the socket (401): ... the token of RTE 'rte-dc2' is not the one stored for its runner: check its RTE_TOKEN` | `docker logs` | Un runner `rte-dc2` existe avec un autre jeton. Donnez ce jeton au RTE (le mot de passe de l'identifiant du runner), ou supprimez le runner pour qu'il demande à rejoindre |
| `the app refused the socket (401): ... the join token (RTE_JOIN_TOKEN) is unknown, revoked, expired or used up` | `docker logs` | Créez un nouveau jeton d'adhésion, ou retirez `RTE_JOIN_TOKEN` et approuvez le RTE (étape 8) |
| `the app refused the socket (409): ... runner 'rte-dc2' exists and is approved: a join token cannot give it a new token ...` | `docker logs` | Le RTE a été réinstallé avec un nouveau jeton : utilisez le jeton de l'identifiant de son runner, ou faites-le changer par un admin |
| `the app refused this RTE (401): dialing again in 10 minutes, or restart it once an admin acted` | `docker logs` | Suit un refus. Corrigez-en la cause, puis faites `docker restart af_rte_dc2` au lieu d'attendre |
| `waiting for an admin to approve it under Connections > Runners` | `docker logs` | Approuvez-le (étape 8). Il est connecté, mais ne prend aucun job d'ici là |
| `the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds` | `docker logs` | L'application et le RTE exécutent des versions d'un autre [contrat](images.html#the-contract) : mettez le RTE à la version de l'application (voir Le mettre à jour) |
| **Non connecté**, ou **Tester la connexion** indique *the RTE 'rte-dc2' (outbound) is not connected: it has not dialed the app* | L'application | Aucun nœud d'application ne détient son socket : le RTE est arrêté, ou ne peut pas joindre l'application. Lisez ses `docker logs` |
| Un job attend, puis échoue avec *no app node holds a socket to RTE 'rte-dc2' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?* | La sortie du job | Le RTE n'était pas connecté pendant l'attente du job |
| `Permission denied` sur la clé ssh | La sortie du job | Les fichiers de `data/` doivent appartenir à l'uid 1000 (étape 3) |
| `UNREACHABLE` pour les hôtes gérés | La sortie du job | Le ssh depuis cet hôte : la clé, `known_hosts`, et le pare-feu vers les hôtes |

Côté application, un RTE refusé apparaît dans le journal de l'application sous la forme `Refused an RTE socket from <address>: <why>`.

---

## Le mettre à jour

Quand l'application passe à une nouvelle version, suivez-la aussi sur cet hôte. Un RTE du même contrat continue de fonctionner entre-temps ; quand une version
change le contrat, ses notes de version l'indiquent (voir [Le contrat](images.html#the-contract)). Avec `:7` dans `compose.yml`, ou dans le
`FROM` de votre Dockerfile :

```bash
cd /opt/af-rte
docker compose pull                 # option A; for option B: docker build --pull -t af-rte-dc2 build
docker compose up -d
docker image prune -f               # removes the image it no longer uses
```

Mettez-le à jour quand aucun playbook n'y tourne : un arrêt attend `RTE_DRAIN_SECONDS` (25) pour les playbooks en cours, et ceux qui tournent encore
se terminent alors comme abandonnés. Ce qu'ils ont affiché avant l'arrêt est conservé dans le spool et envoyé une fois le RTE revenu. Hors ligne, faites `docker load`
de la nouvelle image (étape 4) avant `docker compose up -d`.

---

## Revenir en arrière

```bash
cd /opt/af-rte && docker compose down     # or: docker rm -f af_rte_dc2
```

Le socket se ferme, et le runner affiche immédiatement **Non connecté** : plus aucun nœud d'application ne détient son socket (`runner_leases`). Un hôte
qui disparaît sans le fermer affiche **Non connecté** en environ une minute, une fois que le nœud d'application n'entend plus rien sur le socket. Le
runner reste : un runner qui a rejoint via un socket n'est jamais supprimé de lui-même. Supprimez-le dans **Connexions > Runners**, et son
identifiant `rte-dc2-rte` dans **Connexions > Identifiants**. Retirez d'abord la ligne `runner:` des formulaires qui le nommaient : d'ici là,
leurs jobs attendent le RTE, jusqu'à `RTE_QUEUE_MINUTES`, et échouent.

---

## Plus de capacité dans le datacenter 2

Répétez les étapes 1 à 9 sur d'autres hôtes du datacenter 2, chacun avec son propre `RTE_NAME` et son propre `RTE_TOKEN`, comme `rte-dc2-b` : chacun rejoint comme
runner à part entière et prend jusqu'à [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks. Un formulaire en choisit un avec
`runner:`. Deux RTE avec le même `RTE_NAME` ne se partagent pas le travail : le second reprend le socket au premier (voir
[Plusieurs RTE](several.html#several-rtes)).

---

## Un RTE en mode base de données

Avant la 7.3.0, ce runbook mettait en place un RTE en mode base de données : il détenait les identifiants de la base de données (`DB_*`, `ENCRYPTION_SECRET`), se connectait
à la base de données du datacenter 1 sur le port `3306`, et l'application l'appelait sur son port `8000`. Ce mode est déprécié depuis la 7.3.0 et
sera supprimé dans la 8.0.0. Pour passer un tel RTE en sortant sans nouveau runner, définissez sur lui `RTE_MODE=outbound`, `APP_URL` et `RTE_NAME` (le nom de
son runner), gardez son `RTE_TOKEN`, et retirez `DB_*`, `ENCRYPTION_SECRET` et `RTE_REGISTER` : voir
[Base de données (obsolète)](modes.html#database-deprecated). Fermez ensuite le port `8000` et le port de la base de données dont il n'a plus besoin.
