---
layout: default
title: Natif
parent: Installation
nav_order: 2
translated_from: eab01cbd3bc313b6a4cfd2b87dbcb2ac99408b78
---

# Installation native
{: .no_toc }

AnsibleForms directement sur le serveur, sans conteneurs, sous forme de services systemd que l'installateur met en place
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs de serveurs où les conteneurs ne sont pas autorisés : l'[installateur](installer.html) installe tout ce dont AnsibleForms a besoin sur
le serveur lui-même, puis le met à niveau et le désinstalle. Il installe AnsibleForms 7.3.0 ou ultérieur.

---

## Ce qu'il faut

Choisissez **Directement sur ce serveur, sans conteneurs** à l'étape **Moteur** de l'installateur, ou passez `--mode native`. Il faut :

* **Root** : lancez l'installateur avec `sudo` (`curl -fsSL https://ansibleforms.com/install | sudo sh`)
* **systemd** : les services tournent comme des unités systemd
* **Un Linux pris en charge** : Ubuntu, Debian, RHEL et ses recompilations comme Rocky Linux et AlmaLinux, SUSE Linux Enterprise ou openSUSE
* **amd64 ou arm64**
* **Un accès à Internet** : vers les dépôts de la distribution, GitHub, nodejs.org et les index de paquets Python et Ansible (voir
  [Hors ligne](#air-gapped) pour ce qu'un bundle de version remplace)

Sur un serveur qui ne remplit pas ces conditions, le moteur apparaît comme *Directement sur ce serveur (nécessite root : lancez-le avec sudo)* ou
*Directement sur ce serveur (non pris en charge sur ce Linux)*. Les deux rôles s'installent ainsi : un contrôleur, et un [Runner](installer.html#a-runner).

---

## Ce qu'il installe

L'installateur installe ceci depuis les paquets de la distribution, pour les deux rôles :

| Paquet | Pourquoi |
|---|---|
| `git` | Les dépôts |
| Le client ssh | Les connexions des playbooks |
| Le client MariaDB | Les sauvegardes de l'application : `app.env` définit [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) et [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) sur le client trouvé, `mariadb-dump` et `mariadb` ou les plus anciens `mysqldump` et `mysql` |
| `ca-certificates`, `curl`, `tar`, `gzip` | Les téléchargements |
| `libatomic` | Node.js en dépend, et les serveurs minimaux ne l'ont pas |
| `sshpass` | Les playbooks qui se connectent avec un mot de passe ssh. Sur RHEL et ses recompilations, il vient d'EPEL, que l'installateur tente d'activer avec `epel-release` ; quand il ne peut pas être installé, l'installation continue et le signale |
| Le serveur MariaDB | Un contrôleur seulement : sa base de données |

Ensuite, dans le dossier d'installation, chaque téléchargement étant vérifié avec sa somme de contrôle publiée :

* **AnsibleForms** : le bundle de version `ansibleforms-<version>-linux-<arch>.tar.gz` de la release GitHub de l'application, l'application construite pour
  Node.js. Une version sans bundle affiche *Sans conteneurs, il faut AnsibleForms 7.3.0 ou une version ultérieure.*
* **Node.js** : la version la plus récente de la version majeure que nomme le bundle, depuis nodejs.org
* **Python et Ansible** : uv, puis avec lui le Python des images RTE et un environnement virtuel avec Ansible et les bibliothèques de
  l'image RTE full, puis ses collections Ansible (voir [Les images RTE](../rte/images.html)). Cela prend quelques minutes
* **Les fichiers de départ** : les formulaires, les playbooks et les paramètres du dossier `data` du [projet docker-compose](https://github.com/ansibleforms/docker),
  tels qu'une nouvelle installation Docker Compose les reçoit. Un Runner ne garde que sa configuration Ansible et ses paramètres ssh et git

Pour un contrôleur, il crée ensuite le schéma `AnsibleForms` dans MariaDB, et un utilisateur de base de données nommé d'après l'instance avec tous les droits sur ce
schéma et aucun ailleurs, qui ne se connecte que depuis ce serveur.

---

## Le dossier

Tout se trouve dans le dossier d'installation, `/opt/ansibleforms` (ou `/opt/ansibleforms-runner` pour un Runner) par défaut :

| Chemin | Ce qu'il contient |
|---|---|
| `releases/<version>/` | Une version : le bundle, son lien vers Node.js, son environnement virtuel Python et ses collections |
| `current` | Le lien vers la version qui tourne ; une mise à niveau le déplace, un retour arrière aussi |
| `runtime/` | Node.js, uv et Python, partagés par les versions |
| `data/` | Ce que les conteneurs montent comme `/app/dist/persistent` : formulaires, playbooks, `config.yaml`, le seed de configuration, les certificats et les journaux |
| `home/` | Le dossier personnel de l'utilisateur système : `.ssh` et `.gitconfig`, liés à `data/ssh` et `data/git` |
| `app.env`, `rte.env` | Les paramètres et les secrets des services, lisibles uniquement par root et l'utilisateur système. Celui du RTE ne contient aucun paramètre de base de données |
| `installer-backups/` | Les sauvegardes de la base de données que fait l'installateur, avant une mise à niveau ou avec `backup` |

Les versions et les runtimes appartiennent à root, les services ne peuvent donc pas modifier leur propre code ; `data/` et `home/` appartiennent à l'utilisateur système.
Les fichiers de la base de données eux-mêmes sont gérés par MariaDB, hors du dossier.

---

## Les services

Un contrôleur fait tourner deux services systemd, un Runner un seul. Chacun tourne sous un utilisateur système nommé d'après l'instance (`ansibleforms` par défaut),
depuis `current/server`, avec son fichier de paramètres :

| Service | Ce qu'il exécute | Paramètres |
|---|---|---|
| `<name>` | L'application : l'interface web, l'API et le worker. Un contrôleur seulement | `app.env` |
| `<name>-rte` | Le RTE qui exécute les playbooks | `rte.env` |

Le RTE d'un contrôleur est `inbound` sur un port à lui sur `127.0.0.1` (`8001`, ou le suivant de libre, avec
[`LISTEN_HOST`](../customization/server.html#env_LISTEN_HOST)`=127.0.0.1`), exécute les playbooks depuis les dossiers de l'application (`RTE_FILES=local`),
et est déclaré par le seed de configuration `data/seed.yaml` comme runner par défaut.

Le RTE d'un Runner reçoit le mode, `APP_URL`, `RTE_NAME` et, avec `--join`, le jeton d'adhésion, et reçoit les playbooks avec chaque job (voir
[Modes](../rte/modes.html)). Un RTE sortant ne reçoit aucun appel de l'application, il n'écoute donc que sur `127.0.0.1` (`LISTEN_HOST=127.0.0.1`).
Un RTE entrant sert du HTTPS avec un certificat auto-signé de sa propre adresse dans `data/certificates`, qu'AnsibleForms épingle.
Sans jeton d'adhésion, il demande à rejoindre, et un admin l'approuve sous **Connexions > Runners**.

Ils démarrent au boot et redémarrent après une défaillance. Gérez-les et lisez leurs journaux avec les outils de systemd :

```bash
sudo systemctl status ansibleforms ansibleforms-rte
sudo systemctl restart ansibleforms
sudo journalctl -u ansibleforms -f
sudo journalctl -u ansibleforms-rte -f
```

L'application peut écouter sur un port inférieur à 1024, comme `443`, sans root. Le RTE garde le droit d'utiliser `sudo`, dont les playbooks avec
`become` ont besoin sur ce serveur, si bien qu'un playbook peut gérer le serveur sur lequel tourne le RTE.

---

## Mettre à niveau et revenir en arrière

`sudo /usr/local/bin/ansibleforms-installer upgrade` met à niveau une installation native comme les autres (voir [Mise à niveau](installer.html#upgrade)), dans
cet ordre :

1. Met la nouvelle version en place à côté de celle qui tourne : son bundle, Node.js, Python, Ansible et les collections. Les services en cours
   ne sont pas encore touchés
2. Ajoute les nouveaux fichiers de départ qu'apporte la version, en gardant chaque fichier existant
3. Sauvegarde la base de données (un contrôleur) dans `installer-backups/`, avec une copie de `app.env` et `rte.env`
4. Arrête les services, fait pointer `current` vers la nouvelle version, et les redémarre
5. Attend que l'application réponde avec la nouvelle version (un Runner : que son RTE écoute à nouveau)

Quand la nouvelle version ne répond pas, l'installateur propose de revenir en arrière : `current` pointe à nouveau vers la version précédente, la
base de données est restaurée depuis la sauvegarde, et les services démarrent. Seules la version en cours et la précédente sont conservées.

Des services natifs dans la disposition de l'installateur sans `installer.json` à côté, par exemple après sa suppression, sont détectés par `install`
et `upgrade`, qui proposent de les reprendre (voir [Une installation existante](installer.html#an-existing-installation)).

---

## Désinstaller

`sudo /usr/local/bin/ansibleforms-installer uninstall` arrête et supprime les services. Il garde le dossier et la base de données, sauf si vous choisissez de supprimer
les données (ou passez `--purge`) et tapez le nom de l'instance pour confirmer. Il supprime alors aussi la base de données et son utilisateur (un contrôleur),
efface le dossier et supprime l'utilisateur système.

Les paquets restent installés, MariaDB comprise : d'autres logiciels peuvent les utiliser.

---

## Hors ligne

`--bundle` installe depuis un bundle de version que vous avez copié sur le serveur, au lieu de le télécharger depuis GitHub. Prenez le fichier de son
architecture, `ansibleforms-<version>-linux-amd64.tar.gz` ou `-arm64`, dans les [Releases](https://github.com/ansibleforms/ansibleforms/releases) de l'application :

```bash
sudo /usr/local/bin/ansibleforms-installer install --mode native --bundle /tmp/ansibleforms-7.3.0-linux-amd64.tar.gz
```

`--source` fait de même pour les fichiers de départ, depuis une copie locale du dépôt [ansibleforms/docker](https://github.com/ansibleforms/docker).
Node.js, Python avec ses paquets et les collections Ansible sont toujours téléchargés pendant l'installation.
