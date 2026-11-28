---
layout: default
title: Mise à l'échelle
parent: Exploitation en production
nav_order: 4
translated_from: d18732c9af35c09cfbe63654540f98a730463f43
---

# Mise à l'échelle
{: .no_toc }

AnsibleForms réparti sur plusieurs nœuds du contrôleur et un worker, à côté d'un ou plusieurs RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Rôles

Chaque conteneur AnsibleForms exécute le même code serveur, et [`AF_ROLE`](../customization/server.html#env_AF_ROLE) décide de ce qu'il fait :

| `AF_ROLE` | Image | Exécute | Combien |
|---|---|---|---|
| `all` (non défini) | `ansibleforms` | L'interface web et l'API du contrôleur, et le worker, dans un seul processus : le choix par défaut | 1 |
| `controller` | `ansibleforms` | L'interface web et l'API | Autant que vous voulez, derrière un répartiteur de charge |
| `worker` | `ansibleforms` | Le travail en arrière-plan : le schéma de la base de données et ses mises à jour, le seed de configuration, les planifications, la sauvegarde nocturne, les synchronisations de dépôts et les nettoyages | Un seul au travail ; les autres attendent et prennent le relais |
| `rte` | `ansibleforms-rte-full` (ou `-rte-core`, `-rte-base`) | Les playbooks | Autant que vous voulez |

La plus petite installation est un conteneur sans `AF_ROLE` à côté d'un RTE : c'est ce qu'exécutent le [projet Docker Compose](../installation/docker-compose.html)
et le [chart Helm](../installation/kubernetes.html). Toute autre valeur d'`AF_ROLE` arrête le processus dès son démarrage.

Jusqu'à la 7.7, le rôle `controller` s'appelait `app`. Depuis la 7.8.0, `AF_ROLE=app` est déprécié et sera retiré dans la 8.0 : il tourne toujours comme
`controller`, avec un avertissement dans le journal au démarrage, et le nœud garde son nom `app-`, si bien qu'il retrouve ses propres jobs après la mise à jour.

---

## Le RTE

Le RTE, l'environnement d'exécution qui exécute les playbooks, a sa propre section : [Environnements d'exécution](../rte/). Elle explique comment un RTE
exécute un job, [ses images](../rte/images.html), [comment en exécuter un](../rte/run.html), [plusieurs RTE](../rte/several.html) comme runners ou
répliques, et [un RTE dans un autre datacenter](../rte/another-datacenter.html).

---

## Plusieurs nœuds du contrôleur

Pour servir plus d'utilisateurs, ou survivre à la perte d'un nœud, répartissez AnsibleForms en nœuds `controller` derrière un répartiteur de charge et un `worker`.

### Ce que partagent les nœuds
{: .no_toc }

Les nœuds se coordonnent via la base de données et un volume partagé :

* **La base de données** : les jobs, le verrou du worker, le verrou du concepteur, la liste des nœuds, les baux des runners (quel nœud du contrôleur détient le
  socket de chaque RTE) et les avis de modification qui gardent à jour les caches de chaque nœud. Un identifiant, un runner ou une planification modifiés
  sur un nœud sont en vigueur sur tous en moins de 5 secondes
* **Le volume persistant** (`/app/dist/persistent`) : formulaires, config, dépôts, fichiers téléversés, sauvegardes et le `.env` géré.
  Chaque nœud du contrôleur et le worker montent le même, en lecture-écriture
* **Le dossier ssh** (`/home/node/.ssh`) : la clé et les hôtes connus pour git via ssh ; le worker crée la clé à son premier démarrage
* **[`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET)** : le même sur chaque nœud du contrôleur, sinon un jeton signé
  par un nœud est refusé par le suivant. Un nœud du contrôleur refuse de démarrer sans lui
* **[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET)** : le même sur chaque nœud du contrôleur et chaque worker, sinon un
  identifiant stocké par l'un ne peut pas être lu par un autre. Un RTE en mode socket ne le lit jamais ; seul un RTE en mode base de données, déprécié,
  qui s'enregistre lui-même en a besoin

Donnez aussi à chaque conteneur le même utilisateur de base de données : un worker en attente ne peut mettre fin à la session d'un worker mort que si c'est la sienne.

### Le verrou du worker
{: .no_toc }

Un seul worker travaille à la fois. Il détient le verrou de base de données `ansibleforms_worker` ; quand il s'arrête, la base de données libère le verrou et un
worker en attente le prend en moins de 10 secondes. Quand l'hôte du worker meurt sans prévenir, la base de données pourrait garder le verrou pendant des heures,
si bien qu'un worker en attente met fin à cette session dès qu'aucun worker n'a écrit de heartbeat pendant deux minutes, et prend le relais.

Un worker qui perd le verrou au profit d'un autre s'arrête, et son conteneur redémarre comme worker en attente. Un worker dont le démarrage échoue s'arrête
aussi, afin de ne jamais détenir le verrou sans rien faire. Galera et la réplication de groupe ne partagent pas le verrou entre les nœuds de base de données : pointez chaque
worker vers le même nœud de base de données.

### Jobs et nœuds
{: .no_toc }

Chaque conteneur se nomme `<role>-<hostname>-<port>`, sans rien à définir, et la page **Statut** les liste tous avec leur rôle
et leur version, celui qui est le worker, et un avertissement quand ils exécutent des versions différentes.

Un job qui tourne sur un RTE appartient à ce RTE, et continue quand le nœud du contrôleur qui l'a lancé disparaît. Tout autre job (un job de modèle
sur AWX ou un autre runner, un job de workflow, ou les étapes d'un formulaire multistep déprécié) appartient au nœud du contrôleur qui l'a lancé. Un conteneur qui redémarre termine ses propres jobs inachevés, et le
worker termine les jobs d'un conteneur qui ne répond plus depuis deux minutes, comme un pod remplacé.

Un `SIGHUP` envoyé à n'importe quel nœud réapplique le [seed de configuration](../seed/) : un nœud du contrôleur demande au worker de le faire.

### Mise à jour
{: .no_toc }

Mettez à jour **le worker d'abord**, puis les nœuds du contrôleur. Le worker patche le schéma, et un nœud du contrôleur de la nouvelle version attend que le
schéma soit patché et journalise ce qu'il attend. Les nœuds du contrôleur mis à jour en premier restent non prêts jusqu'à ce que le worker suive, tandis que les anciens continuent
de servir. Les RTE peuvent suivre à tout moment, tant qu'ils parlent le même contrat.

### Limites
{: .no_toc }

Quelques éléments restent liés à un seul nœud :

* **L'assistant de chat** garde ses conversations dans la mémoire d'un nœud du contrôleur : utilisez des sessions persistantes sur le répartiteur de charge (nginx
  `ip_hash`), ou un seul nœud du contrôleur
* **Les journaux** restent dans chaque conteneur. Placez [`LOG_PATH`](../customization/logging.html#env_LOG_PATH) hors du volume partagé, car plusieurs
  processus qui font tourner un même fichier perdent des lignes. La visionneuse de journaux montre le journal du nœud qui répond, centralisez donc la collecte des journaux
* **Les paramètres** modifiés sur les pages de paramètres sont écrits dans le `.env` géré sur le volume partagé et s'appliquent sur chaque nœud ; ceux
  qui nécessitent un redémarrage le nécessitent sur chaque nœud

---

## Exemple de disposition

Le dépôt docker contient un point de départ complet dans [scale](https://github.com/ansibleforms/docker/tree/main/scale) :

| Service | Image | Rôle |
|---|---|---|
| `db` | `mariadb:11` | La base de données, avec un utilisateur qui n'a de droits que sur le schéma `AnsibleForms` |
| `controller1`, `controller2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=controller`, derrière le répartiteur de charge |
| `worker1`, `worker2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=worker` : le second attend et prend le relais |
| `rte` | `ghcr.io/ansibleforms/ansibleforms-rte-full:7` | Exécute les playbooks avec `RTE_MODE=inbound` et `RTE_FILES=local` : le contrôleur le contacte |
| `lb` | `nginx:stable` | Termine HTTPS sur le port 8443 et répartit les navigateurs sur les nœuds du contrôleur avec `ip_hash` |

Le runner `rte` du RTE et l'identifiant avec lequel il se connecte (son adresse `http://rte:8000` et `RTE_TOKEN`) sont déclarés dans le
[seed de configuration](../seed/) `seed.yaml`, que le worker applique à chaque démarrage ; le RTE ne définit aucun `RTE_URL` et n'est pas publié sur l'hôte.

Les nœuds du contrôleur et les workers partagent un même `.env`, avec l'utilisateur de la base de données, `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET`, `RTE_TOKEN`,
`CONFIG_SEED_PATH`, `HTTPS=0` derrière le répartiteur de charge et un `LOG_PATH` hors du volume partagé. Le RTE n'a pas d'`env_file` : il ne reçoit
que `RTE_TOKEN` depuis `compose.yaml`, il ne détient donc aucun mot de passe de base de données. Les nœuds du contrôleur, les workers et le RTE montent les mêmes
volumes persistant et ssh :

```bash
cp .env.example .env   # and fill in the secrets
docker compose up -d   # then https://localhost:8443
```
