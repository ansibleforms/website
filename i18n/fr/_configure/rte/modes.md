---
layout: default
title: Modes
parent: RTE
nav_order: 2
translated_from: fbf98e6673b13575df08bda488a4b2881bd87ec0
---

# Comment un RTE parle à l'application
{: .no_toc }

Sortant, entrant ou base de données : qui ouvre la connexion, et ce qui y circule
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs : depuis la 7.3.0, un RTE parle à l'application via un seul WebSocket et ne détient aucun identifiant de base de données. Choisissez le mode
qui convient au réseau entre eux : qui peut ouvrir une connexion vers qui, et à travers quels proxies et pare-feux elle passe.

---

## Les trois modes

[`RTE_MODE`](../customization/server.html#env_RTE_MODE) sur le RTE indique comment il joint l'application ; son runner a le même **Mode** :

| Mode | Qui ouvre la connexion | Ce que détient le RTE | Pour |
|---|---|---|---|
| `outbound` | Le RTE contacte l'application à [`APP_URL`](../customization/server.html#env_APP_URL) et garde un WebSocket ouvert | Son `RTE_TOKEN`, aucun identifiant de base de données | Une DMZ, du NAT, ou une zone qui n'autorise aucune connexion entrante : rien n'atteint le RTE depuis l'extérieur |
| `inbound` | L'application contacte le RTE à l'adresse de son runner et garde un WebSocket ouvert | Son `RTE_TOKEN`, aucun identifiant de base de données | Un réseau où le côté central ouvre toutes les connexions, un projet compose, un pod |
| `database` (obsolète) | L'application appelle l'API du RTE en HTTP, et le RTE lit et écrit lui-même la base de données de l'application | Les identifiants de la base de données (`DB_*`) et `ENCRYPTION_SECRET` | Le comportement de la 7.0 à la 7.2, supprimé dans la 8.0.0 |

Un RTE sans `RTE_MODE` tourne en mode base de données pendant toute la 7.x, et journalise un avertissement `[DEPRECATED] This RTE runs in database mode` à
son démarrage. Un runner ajouté avant la 7.3.0 a le mode **Base de données (obsolète)** ; mettez-le au mode dans lequel tourne son RTE quand vous le migrez.

---

## Sortant

Le RTE ouvre la connexion, cela fonctionne donc depuis un réseau qui n'accepte aucune connexion entrante :

* **Le socket** : le RTE contacte `APP_URL` suivi de `/api/v2/rte/socket`, en `wss://` (`ws://` pour une adresse `http://`), avec son
  `RTE_TOKEN` et le nom de son runner, [`RTE_NAME`](../customization/server.html#env_RTE_NAME). Il rappelle quand le socket tombe
* **La première fois** : il demande à rejoindre, et son runner attend l'approbation d'un admin dans **Connexions > Runners**, connecté
  mais sans jobs (voir [Demander à rejoindre](../runners/registration.html#asking-to-join)). Un jeton d'adhésion,
  [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), l'approuve immédiatement. À partir de là, il se connecte avec son propre jeton
* **Le réseau** : uniquement de la zone du RTE vers l'application, sur le port de l'application, via un proxy quand `HTTPS_PROXY` l'indique. Un reverse
  proxy devant l'application doit laisser passer le WebSocket sur ce chemin (voir [WebSockets des runners](../production/reverse-proxy.html#runner-websockets))
* **Le certificat** : le certificat de l'application est vérifié. Indiquez une CA privée avec `NODE_EXTRA_CA_CERTS`, ou, uniquement à l'intérieur d'un réseau de confiance,
  désactivez la vérification avec [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY)
* **Le runner** : il n'a besoin d'aucune adresse, son identifiant RTE ne contient donc que le jeton
* **Prêt** : `/ready` répond `503` tant que le socket vers l'application n'est pas ouvert

Avec plusieurs nœuds d'application derrière un répartiteur de charge, le nœud que joint le RTE détient son socket. N'importe quel nœud peut lancer un job : le nœud qui détient
le socket l'envoie au RTE, en moins de deux secondes quand le job a été lancé sur un autre nœud.

---

## Entrant

Le RTE écoute sur son `PORT`, et l'application le contacte à l'adresse de son runner, suivie de `/rte/v1/socket`, avec le jeton du RTE. Avec
plusieurs nœuds d'application, un seul à la fois détient le socket de chaque runner entrant ; quand ce nœud s'arrête, un autre prend le relais et rappelle.

L'application a besoin du runner du RTE avant de pouvoir le contacter : type RTE, mode **Entrant**, et un identifiant RTE avec l'adresse du RTE et son
`RTE_TOKEN`. Il y parvient de l'une de deux façons :

| Comment | Que définir |
|---|---|
| Le RTE demande à rejoindre | `APP_URL` et [`RTE_URL`](../customization/server.html#env_RTE_URL) (l'adresse que contacte l'application). Le RTE fait un seul appel, `POST /api/v2/rte/register`, et son runner attend l'approbation d'un admin : l'application le contacte une fois approuvé (voir [Demander à rejoindre](../runners/registration.html#asking-to-join)). Avec `RTE_JOIN_TOKEN`, il est approuvé immédiatement. Un RTE entrant avec `APP_URL` mais sans `RTE_URL` refuse de démarrer |
| Vous ajoutez le runner | Pas d'`APP_URL` : ajoutez le runner dans **Connexions > Runners**, ou dans le [seed de configuration](../seed/), comme dans [Exécuter un RTE](run.html#start-it) |

Le projet Docker Compose, le chart Helm et le contrôleur de l'installeur exécutent leur propre RTE de cette façon, en entrant, déclaré par le seed.

**Via HTTPS.** Avec [`HTTPS=1`](../customization/server.html#env_HTTPS), le RTE sert son socket en TLS, avec la clé et le certificat
de [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) et [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT)
(`key.pem` et `cert.pem` dans son dossier `certificates` par défaut). Un RTE avec un `RTE_URL` en `https://` envoie ce certificat quand il
demande à rejoindre, et l'application l'épingle : elle ne contacte le RTE que s'il présente le même certificat, si bien qu'un certificat auto-signé fonctionne sans CA.
Le RTE journalise l'empreinte du certificat à son démarrage (les 8 premiers chiffres hexadécimaux du SHA-256 de ses octets DER, sous la forme `abcd-ef12`),
et la boîte de dialogue d'approbation montre celle qu'a reçue l'application : vérifiez qu'elles correspondent avant de l'approuver.
L'[installeur](../installation/installer.html#a-runner) configure ainsi ses Runners entrants, avec un certificat pour leur propre adresse.

---

## Base de données (obsolète)

Le RTE de la 7.0 à la 7.2 : l'application appelle son API en HTTP, et le RTE réclame le job dans la base de données, y écrit la sortie et tient à jour sa
propre ligne de runner, avec [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER). [Mode base de données](./#database-mode-deprecated)
explique en quoi ses étapes diffèrent. Il fonctionne encore en 7.x, avec un avertissement à chaque démarrage, et sera supprimé dans la 8.0.0.

Pour passer un tel RTE à un mode socket, gardez son runner et son jeton :

1. Un runner du [seed de configuration](../seed/) : définissez d'abord `rte_mode: outbound` ou `rte_mode: inbound` pour lui dans le seed (entrant : avec
   l'adresse que contacte l'application dans le `url` de son identifiant). Le RTE ne peut pas déplacer lui-même un runner issu du seed
2. Sur le RTE, définissez `RTE_MODE=outbound` avec `APP_URL`, ou `RTE_MODE=inbound` (avec `APP_URL` et `RTE_URL` pour faire son unique
   appel d'enregistrement), et mettez [`RTE_NAME`](../customization/server.html#env_RTE_NAME) au nom qu'a son runner dans
   **Connexions > Runners**. Gardez son `RTE_TOKEN`
3. Retirez `DB_*` et `ENCRYPTION_SECRET` de son environnement, ainsi que `RTE_REGISTER`, que seul le mode base de données lit, puis redémarrez-le

Quand le RTE mis à jour se connecte avec le nom du runner et le jeton propre du runner, l'application passe immédiatement ce runner au mode du RTE,
sans approbation, et journalise *Runner '&lt;name&gt;' moved from database mode to outbound: its RTE signed in with the runner's own
token*. Le runner n'est plus une ligne que son RTE a enregistrée, si bien que le worker ne le supprime jamais quand l'ancien conteneur cesse de répondre. Un
runner du seed de configuration encore en mode base de données est refusé à la place, avec *runner '&lt;name&gt;' is managed by the config seed in
database mode: set rte_mode: outbound for it in the seed ..., then restart this RTE*. N'utilisez pas de jeton d'adhésion pour cela : un jeton
d'adhésion est refusé pour un runner déjà approuvé. Un RTE entrant sans `APP_URL` ne fait aucun appel : mettez plutôt le **Mode** de son runner à
**Entrant** dans **Connexions > Runners**, et l'application le contacte. L'[installeur](../installation/installer.html#a-72-runner)
met à jour un Runner 7.2 de cette façon.

---

## Ce qui circule sur le socket

Dans les deux modes socket, l'application envoie au RTE chaque job avec tout ce que le RTE lisait auparavant dans la base de données, et enregistre ce qui revient,
la sortie, les événements, le journal du job et la fin, exactement une fois. L'application envoie aussi les notifications de fin.

**Le spool.** Chaque lot de sortie, lot d'événements, journal, début et fin est numéroté et écrit dans le fichier spool du job
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) avant d'être envoyé, et conservé jusqu'à ce que l'application indique l'avoir enregistré.
Après une reconnexion, au même nœud d'application ou à un autre, le RTE renvoie ce qui n'a pas été acquitté, et l'application ignore ce qu'elle a déjà
enregistré : rien n'est perdu, et rien n'est enregistré deux fois. Gardez le spool sur un volume, afin qu'un RTE qui redémarre envoie encore ce qu'il n'avait pas
livré. Un playbook qui tournait quand le RTE a redémarré ne peut pas continuer : son job se termine comme abandonné.

**Capacité.** Le RTE exécute jusqu'à [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks à la fois, ou la valeur définie
sur sa [page de runner](../runners/runner-page.html#an-rtes-settings), et indique à l'application toutes les 20 secondes combien tournent. Un job destiné à un RTE
plein attend, comme décrit dans [Plusieurs RTE](several.html#several-jobs-on-one-rte).

**Les fichiers du job.** [`RTE_FILES`](../customization/server.html#env_RTE_FILES), ou le paramètre **Fichiers de job** de sa page de runner, indique
où le RTE obtient les playbooks et les inventaires :

| `RTE_FILES` | D'où viennent les fichiers |
|---|---|
| `transfer` (par défaut) | L'application envoie le dossier des playbooks et les inventaires avec le job, chacun empaqueté et nommé par un hash de son contenu. Le RTE les garde empaquetés sous [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH), les derniers utilisés jusqu'à [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) (1024 Mo par défaut), et ne demande qu'un hash qu'il n'a pas : un dossier inchangé n'est jamais envoyé deux fois. Le RTE n'a besoin d'aucun disque partagé ni d'aucun accès aux dépôts |
| `local` | Le RTE exécute depuis ses propres dossiers, comme un RTE en mode base de données : montez-y les playbooks ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)) et les dépôts ([`REPO_PATH`](../customization/paths.html#env_REPO_PATH)) |

Avec `transfer`, chaque job décompresse ses fichiers dans un dossier privé qui lui est propre, supprimé à la fin du job : aucun job ne voit ce qu'un autre
a écrit, et aucun fichier d'inventaire ou d'extravars ne reste décompressé sur le disque du RTE. Des RTE peuvent partager un même `RTE_CACHE_PATH` ; chacun garde ses jobs dans
un dossier à lui, et le dossier d'un RTE qui s'est arrêté (tué en plein job, ou recréé avec un autre nom d'hôte) est supprimé par les autres
au bout de 10 minutes. Un dossier plus gros que [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (512 par défaut, lu par
l'application, appliqué sans redémarrage) n'est pas envoyé : le job échoue et indique de monter plutôt le dossier sur le RTE. Le dossier ssh n'est jamais envoyé : le RTE garde sa propre
clé privée et son `known_hosts` dans `/home/node/.ssh`.

**Hôtes et tâches.** Depuis la 7.3.0, un RTE dans n'importe quel mode enregistre les événements structurés d'un playbook à côté de sa sortie texte : chaque play, tâche et
résultat d'hôte, et le récapitulatif, écrits par son plugin de callback `af_events`. La page du job les affiche sous **Hôtes et tâches** (voir
[Suivre un job](../jobs/following.html#hosts-and-tasks)).

---

## Réseau

Ce qu'il faut ouvrir entre l'application, le RTE et les hôtes gérés, par mode :

| Mode | De | Vers | Port |
|---|---|---|---|
| Sortant | Le RTE | L'application, à `APP_URL` | Le port de l'application (`443` derrière la plupart des proxies) |
| Entrant | Les nœuds d'application | Le RTE, à l'adresse de son runner | Le `PORT` du RTE (`8000`) |
| Base de données (obsolète) | Le RTE, ainsi que les nœuds d'application et le worker | La base de données, et le RTE | `3306`, et le `PORT` du RTE |
| Tous les modes | Le RTE | Les hôtes gérés | ssh (`22`), WinRM, leurs API |

En mode socket, le RTE ne se connecte jamais à la base de données. Son API ne répond qu'au socket et aux sondes : `/live`, `/ready`, `/metrics`.
