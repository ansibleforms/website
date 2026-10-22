---
layout: default
title: Prérequis
nav_order: 5
translated_from: 730eff82a2f1ae75eaf5d1cb57f10f6e1019d14b
---

# Prérequis
{: .no_toc }

Ce qu'il vous faut avant d'installer AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Environnement d'exécution

AnsibleForms tourne dans un conteneur, sous forme de services systemd sur le serveur lui-même ou, pour ceux qui le construisent eux-mêmes, comme une application Node.js :

| Installation | Il vous faut |
|---|---|
| [Installateur](installation/installer.html) | Linux sur amd64 ou arm64, `curl` ou `wget` et `sha256sum`, et ce dont a besoin le moteur sur lequel il installe (voir plus bas) |
| [Natif](installation/native.html) | Root, systemd et un Linux pris en charge (Ubuntu, Debian, RHEL et ses recompilations, SUSE) ; l'installateur installe le reste |
| [Docker](installation/docker.html) | Docker ou Podman, et votre propre serveur MySQL |
| [Docker Compose](installation/docker-compose.html) | Docker Compose ou podman-compose ; le projet démarre aussi MySQL |
| [Kubernetes](installation/kubernetes.html) | Un cluster, Helm 3 et une StorageClass (ou des PersistentVolumes créés à l'avance) |
| [Depuis les sources](installation/from-source.html) | Node.js 26 (24 au minimum) avec npm, Git, et Ansible pour le processus RTE qui exécute les playbooks |

L'image de l'application, `ghcr.io/ansibleforms/ansibleforms`, contient Node.js et les outils que le serveur appelle (git, ssh, le client mariadb et
ytt), mais ni Python ni Ansible. Les playbooks s'exécutent sur un RTE (runtime environment), un second conteneur basé sur
`ghcr.io/ansibleforms/ansibleforms-rte-full`, ou sur une image que vous construisez à partir de `ansibleforms-rte-core` (voir [Mise à l'échelle](rte/)).
Les formulaires qui ne font que lancer des modèles sur AWX, AAP, Ascender, Semaphore, Rundeck ou Jenkins n'ont besoin d'aucun RTE.

---

## Base de données

AnsibleForms stocke ses jobs, ses utilisateurs, ses identifiants et ses connexions dans MySQL 8 ou ultérieur, ou dans MariaDB.

Au premier démarrage, il crée lui-même le schéma `AnsibleForms`. Donnez-lui un utilisateur de base de données dédié, avec des droits sur ce seul schéma,
pas root :

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

C'est tout ce dont il a besoin : il crée et met à jour le schéma, fait ses sauvegardes et, avec plusieurs workers, termine la session d'un worker mort.
La page **Statut** et le journal avertissent quand l'utilisateur a des droits sur toutes les bases de données. Les nœuds d'application et les workers se connectent avec cet
utilisateur. Un RTE en mode socket (sortant ou entrant, voir [Modes](rte/modes.html)) ne détient aucun identifiant de base de données : seul un RTE en mode
base de données, obsolète depuis la 7.3.0, s'y connecte aussi. Pour créer le schéma vous-même, mettez [`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) à `0`.
Le projet Docker Compose et le chart Helm (qui utilise `mysql:8.4`) démarrent une base de données pour vous.

---

## Dimensionnement

Il n'y a pas d'exigences mesurées : la charge dépend surtout du nombre de jobs qui tournent en même temps et de la quantité de sortie qu'ils écrivent.
Les ressources par défaut du chart Helm sont un point de départ raisonnable pour une petite équipe :

| Composant | Requests | Limits | Volume |
|---|---|---|---|
| AnsibleForms | 1 CPU, 1 GiB de mémoire | 4 CPU, 4 GiB de mémoire | 10 GiB |
| MySQL | 0,5 CPU, 512 MiB de mémoire | 2 CPU, 2 GiB de mémoire | 10 GiB |

Le conteneur de l'application n'exécute aucun playbook. Chaque playbook est un processus `ansible-playbook`, avec ses forks, sur un RTE : dimensionnez le CPU et
la mémoire de chaque RTE pour les playbooks qu'il exécute à la fois, au plus [`RTE_MAX_JOBS`](customization/server.html#env_RTE_MAX_JOBS) (`10` par défaut), et ajoutez
des RTE pour en exécuter davantage. Les jobs qui tournent sur AWX, AAP, Ascender ou les autres runners de modèles coûtent peu à AnsibleForms.

Par défaut, la sortie des jobs est conservée indéfiniment dans la base de données. Définissez [`JOB_RETENTION_DAYS`](customization/retention.html#env_JOB_RETENTION_DAYS)
sur une instance chargée pour éviter que la base de données ne grossisse sans limite.

---

## Réseau

L'application et chaque RTE écoutent sur leur propre port, et ouvrent des connexions sortantes vers les systèmes qu'utilisent vos formulaires et vos paramètres.

### Entrant
{: .no_toc }

Le serveur écoute sur le port `8000` ([`PORT`](customization/server.html#env_PORT)), en HTTP ou, avec
[`HTTPS`](customization/server.html#env_HTTPS) à `1`, en HTTPS. Le projet Docker Compose le publie sur le port 443,
et le chart Helm l'expose via un service ou un ingress. Un RTE écoute aussi sur son propre `PORT`, mais seule l'application l'appelle :
gardez-le hors du réseau public. Un RTE sortant n'a besoin d'aucun port entrant : c'est lui qui appelle l'application sur le port de celle-ci.

### Sortant
{: .no_toc }

Ouvrez les connexions d'AnsibleForms vers les systèmes que vous utilisez :

| Destination | Utilisé pour |
|---|---|
| MySQL / MariaDB | La base de données d'AnsibleForms (`DB_HOST`, `DB_PORT`, `3306` par défaut) |
| Le RTE | Appeler un RTE entrant à l'adresse de son runner via un WebSocket, ou appeler un RTE en mode base de données à son [`RTE_URL`](customization/server.html#env_RTE_URL), qui se connecte alors lui-même à MySQL ; un RTE sortant appelle l'application à la place (voir [Modes](rte/modes.html)) |
| AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | Lancer et suivre des modèles et des jobs sur les [runners](runners.html), via leur API HTTP(S) |
| Les hôtes gérés | Les playbooks s'y connectent depuis le RTE, par exemple en SSH ou en WinRM |
| LDAP, Entra ID, OIDC | La connexion avec des comptes d'annuaire ou d'authentification unique |
| Serveurs Git | Cloner et mettre à jour les dépôts, en HTTPS ou en SSH |
| API REST et bases de données | Les sources de données des expressions et des requêtes de vos formulaires |
| HashiCorp Vault, CyberArk | Lire des identifiants depuis un [coffre de secrets](secret-stores/) |
| Serveurs de messagerie, Slack, Teams, Telegram, webhooks | Les notifications de jobs et les demandes d'approbation, via les [canaux de notification](notification-channels.html) |
| Fournisseur de modèles | L'[assistant de chat](chat/), seulement quand il est activé |

Pour limiter les hôtes que les fonctions REST des expressions peuvent appeler, voir
[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) et
[`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS).

---

## Navigateur

L'application web est conçue pour les navigateurs récents : Chrome ou Edge 111, Firefox 114, Safari 16.4 ou plus récent.
Les navigateurs plus anciens ne sont pas pris en charge.

---

## Mise à l'échelle

Par défaut, un seul conteneur AnsibleForms fait tourner ensemble l'application web et le travail en arrière-plan, à côté d'un RTE.

Pour servir plus d'utilisateurs, faites tourner plusieurs nœuds d'application derrière un répartiteur de charge (`AF_ROLE=app`) à côté d'un worker (`AF_ROLE=worker`), qui exécute
les planifications, les sauvegardes et le reste du travail en arrière-plan ; un seul worker travaille à la fois, et un second attend pour prendre le relais. Ils partagent
la base de données, le dossier persistant, `ACCESS_TOKEN_SECRET` et `ENCRYPTION_SECRET`. Voir [Mise à l'échelle](production/scaling.html). Ajoutez des
RTE pour exécuter plus de playbooks à la fois : voir [Plusieurs RTE](rte/several.html).
