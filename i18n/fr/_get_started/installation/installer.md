---
layout: default
title: Installateur
parent: Installation
nav_order: 1
translated_from: 72dbe0a987c93d1b54d1972827c2b26e8cad5fe9
---

# L'installateur
{: .no_toc }

Installer, mettre à niveau et entretenir AnsibleForms sur un serveur Linux, en une seule commande
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs : le moyen le plus rapide d'obtenir une instance fonctionnelle, ou un Runner pour un AnsibleForms installé ailleurs. Depuis la 7.3.0.

---

## Ce qu'il installe

L'installateur pose quelques questions dans un assistant en plein écran, affiche chaque réponse pour vérification, et seulement ensuite modifie le serveur.
Il installe l'un de deux rôles, sur l'un de quatre moteurs :

| Rôle | Ce que c'est |
|---|---|
| Contrôleur | L'application complète : l'interface web, sa base de données et son propre Runner. Choisissez-le pour une première installation |
| Runner | Un RTE qui exécute les playbooks d'un AnsibleForms installé ailleurs, par exemple dans un autre réseau, une DMZ ou un autre datacenter. Il communique avec AnsibleForms via un seul WebSocket et ne détient aucun identifiant de base de données |

Les moteurs sur lesquels il les installe :

| Moteur | Comment il tourne |
|---|---|
| Docker | Le [projet Docker Compose](docker-compose.html), sur Docker Engine avec son plugin compose. Les conteneurs redémarrent avec Docker |
| Podman | Le même projet sur Podman, rootless ou en root, avec podman-compose. Une unité systemd démarre les conteneurs au boot |
| Kubernetes | Le [chart Helm](kubernetes.html), sur le cluster que `kubectl` atteint. Un contrôleur est servi derrière un ingress ; un Runner utilise le mode runner du chart |
| Directement sur ce serveur | Sans conteneurs : Node.js, MariaDB et Ansible sur le serveur, et AnsibleForms sous forme de services systemd. Voir [Installation native](native.html) |

Après l'installation, le même programme met à niveau l'installation, la sauvegarde, affiche son état et la supprime. Il prend aussi en charge un
AnsibleForms qu'il n'a pas installé, comme un AnsibleForms mis en place à la main à partir du projet Docker Compose (voir [Une installation existante](#an-existing-installation)).

---

## Le lancer

Le script d'installation télécharge l'installateur pour ce serveur et le démarre :

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

Les variantes habituelles : en root, pour installer Docker ou Podman, pour installer directement sur le serveur ou sous `/opt` ; avec une commande ou
des options (voir [Options](#flags)) ; et l'installateur d'une version donnée au lieu de la dernière :

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh
curl -fsSL https://ansibleforms.com/install | sh -s -- --lang es
curl -fsSL https://ansibleforms.com/install | AF_INSTALLER_VERSION=7.3.0 sh
```

Le script :

1. Vérifie que le serveur tourne sous Linux sur amd64 ou arm64, et trouve `curl` ou `wget` et `sha256sum`
2. Télécharge `ansibleforms-installer_linux_<arch>` depuis la dernière release de
   [ansibleforms/installer](https://github.com/ansibleforms/installer/releases), ou depuis la release que nomme `AF_INSTALLER_VERSION`
3. Le vérifie avec le `checksums.txt` de la release, et n'utilise aucun téléchargement dont la somme de contrôle diffère
4. Le garde sous le nom `ansibleforms-installer`, dans `/usr/local/bin` pour root et `~/.local/bin` sinon, pour les mises à niveau et les sauvegardes ultérieures.
   Via sudo, lancez-le par son chemin complet : le `secure_path` de sudo, comme sur les systèmes Red Hat, omet souvent `/usr/local/bin`
5. Le démarre avec les options données, en lisant le clavier depuis le terminal même si le script est arrivé par un pipe

Sans terminal, par exemple dans un job de CI, l'installateur tourne sans surveillance (voir [Sans surveillance](#unattended)).

---

## L'assistant

L'assistant pose une question à la fois, avec les étapes listées à gauche. **Échap** revient à l'étape précédente, en gardant sa réponse :

| Étape | Ce qu'elle demande |
|---|---|
| Langue | La langue de l'installateur, d'après la locale de ce serveur par défaut : catalan, allemand, anglais, espagnol, français, italien, japonais, néerlandais, polonais, portugais ou chinois. Demandée en premier, avant que l'installateur ne dise quoi que ce soit d'une installation qu'il a trouvée |
| Nouveautés | Ce qui est nouveau dans la version qu'il installe, avec d'abord les changements incompatibles, les suppressions et les obsolescences |
| Rôle | Contrôleur ou Runner |
| Moteur | Docker, Podman, Kubernetes, ou directement sur ce serveur |
| Dossier | Le dossier d'installation, et le nom de l'instance |
| Adhésion, Application, Mode | Un Runner seulement : voir [Un Runner](#a-runner). Pas le mode sur Kubernetes |
| Réseau | Le port de l'interface web, ou du Runner. Pas sur Kubernetes |
| HTTPS | La façon dont les navigateurs se connectent à un contrôleur |
| Admin | Le mot de passe du premier admin, saisi deux fois |
| Cluster, Ingress, Stockage | Kubernetes seulement : le namespace et la release, l'ingress (un contrôleur), la classe de stockage |
| Vérification | Toutes les réponses : **Installer**, ou **Modifier les réponses** |

**Moteur.** La liste montre ce que ce serveur possède. Un moteur absent est proposé comme *Docker (non installé : l'installateur l'installe)*
ou de même pour Podman : une fois que vous confirmez, l'installateur installe Docker avec le script de Docker lui-même (`get.docker.com`, plugin compose
inclus) ou Podman avec podman-compose depuis les paquets de la distribution. Cela nécessite root. Kubernetes est proposé quand `kubectl` et
`helm` sont installés et atteignent un cluster. *Directement sur ce serveur* nécessite root et un Linux pris en charge, et indique pourquoi quand il est grisé.

**Dossier.** Les valeurs par défaut :

| | Contrôleur | Runner |
|---|---|---|
| Dossier, en root | `/opt/ansibleforms` | `/opt/ansibleforms-runner` |
| Dossier, avec un autre utilisateur | `~/ansibleforms` | `~/ansibleforms-runner` |
| Nom d'instance, Docker ou Podman | `af` | `runner` |
| Nom d'instance, natif | `ansibleforms` | `ansibleforms-runner` |

Avec Docker ou Podman, le dossier contient le fichier compose et son `.env` avec les secrets, ainsi que toutes les données : base de données, formulaires, playbooks
et journaux. Il doit être vide. Le nom d'instance, en lettres minuscules, chiffres et `-`, préfixe les conteneurs (`af_app`, `af_db`, `af_rte`), si bien que plusieurs
instances peuvent partager un serveur. Le nom d'instance d'un Runner est aussi le nom de son runner sous **Connexions > Runners** (`RTE_NAME`).

**Réseau.** L'interface web d'un contrôleur écoute sur `443`, ou sur le port libre suivant. **HTTPS** propose ensuite :

| Choix | Ce qu'il fait |
|---|---|
| HTTPS avec un certificat autosigné créé pour ce serveur | Un certificat pour les noms de ce serveur, valable dix ans. Les navigateurs vous demandent de l'accepter une fois |
| HTTPS avec mon propre certificat et ma clé | Votre propre certificat et votre clé, au format PEM, de votre CA ou de Let's Encrypt |
| HTTP, avec HTTPS géré par un reverse proxy placé devant | Du HTTP simple sur le port, pour nginx, Traefik ou un répartiteur de charge qui gère le HTTPS |

**Admin.** Le mot de passe de l'utilisateur `admin`, saisi deux fois pour qu'une faute de frappe ne vous bloque pas. Laissé vide, l'installateur en génère
un robuste.

**La fin.** L'installateur génère le mot de passe de la base de données et les secrets, démarre AnsibleForms et attend qu'il réponde. Il
affiche ensuite l'adresse à ouvrir, l'utilisateur et le mot de passe, et le dossier. Les Runners installés pour lui demandent à rejoindre, et un admin les approuve
sous **Connexions > Runners** (voir [Un Runner](#a-runner)).

---

## Un Runner

Un Runner est un RTE pour un AnsibleForms qui tourne ailleurs, en version 7.3.0 ou ultérieure. Il ne détient aucun identifiant de base de données : il s'authentifie
avec un jeton à lui, qu'AnsibleForms garde dans un identifiant RTE (voir [Modes](../rte/modes.html)). Après le dossier, l'assistant
demande trois choses de plus :

| Étape | Ce qu'elle demande |
|---|---|
| Application | L'adresse de l'AnsibleForms pour lequel travaille ce Runner, celle que les gens ouvrent dans un navigateur |
| Mode | **Sortant : le Runner se connecte à AnsibleForms** (par défaut), ou **Entrant : AnsibleForms se connecte au Runner** |
| Réseau | Le port du Runner, `8000` par défaut. En sortant, seuls les contrôles de santé y écoutent, joignables depuis ce serveur uniquement. En entrant, aussi l'adresse de ce serveur telle qu'AnsibleForms l'atteint |

`--role runner` saute la question du rôle, si bien que cette commande, lancée sur le serveur du Runner, commence par les questions d'un Runner :

```bash
curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner
```

L'installateur se connecte ensuite à AnsibleForms. Un certificat autosigné, ou d'une CA privée, fait demander **Faire confiance à ce certificat ?** :
oui définit [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY) sur le Runner. Il lit la version qu'exécute AnsibleForms,
refuse une version antérieure à la 7.3.0, et installe le Runner avec cette même version, quelle que soit la version que l'installateur lui-même installerait.

Choisissez sortant pour une DMZ, du NAT, ou une zone qui n'autorise aucune connexion entrante : uniquement du trafic de ce serveur vers AnsibleForms, sur son
port. Choisissez entrant pour les réseaux où c'est le côté central qui ouvre chaque connexion.

La vérification affiche **Inscription : demande l'approbation**, ou **lui-même, avec un jeton d'adhésion** quand `--join` en a fourni un. À la fin, l'installateur
affiche le nom du Runner, son mode, l'application et, en entrant, son adresse, puis indique qu'il a demandé à rejoindre AnsibleForms : approuvez-le sous
**Connexions > Runners**, après avoir vérifié que l'empreinte qui y est affichée est celle qu'il imprime :

```
Fingerprint: abcd-ef12
```

L'empreinte correspond aux 8 premiers chiffres hexadécimaux du SHA-256 du jeton du Runner, `RTE_TOKEN`, qui est conservé dans le fichier
`.env` du dossier (`rte.env` pour une [installation native](native.html)). Voir [Approuver un RTE](../runners/registration.html#approving-an-rte). Avec `--join`, le Runner est approuvé tout de suite :
il s'est inscrit lui-même, et apparaît comme connecté sous **Connexions > Runners**.

Un Runner entrant sert son socket en HTTPS. L'installateur crée un certificat autosigné pour l'adresse par laquelle AnsibleForms
l'atteint, valable dix ans, dans le `data/certificates` du dossier, et définit `RTE_URL` à `https://<address>:<port>`.
Le Runner envoie le certificat quand il demande à rejoindre, et AnsibleForms l'épingle : il n'appelle ce Runner que lorsqu'il présente
ce même certificat, aucune CA n'est donc nécessaire. L'installateur imprime l'empreinte du certificat sous celle du jeton :

```
Fingerprint: abcd-ef12
Certificate fingerprint: 3f9c-07a1
```

Ce sont les 8 premiers chiffres hexadécimaux du SHA-256 des octets DER du certificat, sous la forme `xxxx-xxxx`. Avant d'approuver le Runner,
vérifiez que la boîte de dialogue d'approbation affiche la même empreinte de certificat. Un Runner inscrit avec `--join` l'imprime aussi.

Sur Kubernetes, un Runner est le mode runner du chart Helm, et toujours sortant : l'assistant ne demande ni mode ni réseau, puisque rien
ne l'atteint de l'extérieur (voir [Kubernetes](#kubernetes)).

---

## Kubernetes

Pour un contrôleur sur Kubernetes, l'installateur installe le [chart Helm](kubernetes.html) sur le cluster que `kubectl` atteint :

| Question | Valeur par défaut |
|---|---|
| Namespace | `ansibleforms` |
| Nom de la release Helm | `ansibleforms` |
| Nom d'hôte servi par l'ingress | Aucune : obligatoire, par exemple `ansibleforms.example.com` |
| Classe d'ingress | L'une de celles du cluster, `nginx` par défaut |
| Le servir en HTTPS (avec le certificat de l'ingress) ? | Oui |
| Classe de stockage pour les volumes | Celle par défaut du cluster |

Le mot de passe admin se trouve dans le Secret `<release>-secrets` de ce namespace, sous la clé `ADMIN_PASSWORD`. L'installateur garde les
valeurs du chart dans un fichier à côté de son fichier d'état, `<release>-values.yaml`, et les réapplique lors des mises à niveau ; `--values` ajoute un fichier à vous. Le chart d'une version est publié peu après elle.

Pour un Runner, l'installateur installe le même chart dans son [mode runner](kubernetes.html#a-runner-on-kubernetes) (`runner.enabled`) : un RTE
seul, sans application, sans base de données et sans ingress, qui appelle AnsibleForms (sortant). Après l'adresse de l'application, l'assistant demande :

| Question | Valeur par défaut |
|---|---|
| Namespace | `ansibleforms` |
| Nom de la release Helm | `ansibleforms-runner`, qui est aussi le nom de son runner sous **Connexions > Runners** |
| Classe de stockage pour les volumes | Celle par défaut du cluster |

L'installateur crée le jeton du Runner et définit l'adresse de l'application, le nom du runner et, quand vous faites confiance au certificat de l'application,
`runner.appTlsVerify: false`. Avec `--join`, le jeton d'adhésion approuve le Runner tout de suite ; sans lui, le Runner demande à rejoindre, et
l'installateur imprime son empreinte à vérifier avant que vous ne l'approuviez sous **Connexions > Runners**.

---

## Commandes

L'installateur prend une commande, avant ou après ses options. Sans commande, il installe :

| Commande | Ce qu'elle fait |
|---|---|
| `install` | Installe AnsibleForms, comme contrôleur ou comme Runner (par défaut). Sur un serveur qui a déjà une installation, la sienne ou une qu'il trouve, il propose de la mettre à niveau |
| `upgrade` | Met à niveau vers une version plus récente, en affichant d'abord ses notes de version (voir [Mise à niveau](#upgrade)) |
| `status` | Affiche l'installation (son rôle, son moteur et sa version) et ses conteneurs, pods ou services, et si elle répond. Il liste ensuite tout autre AnsibleForms qu'il trouve sur le serveur |
| `backup` | Sauvegarde la base de données tout de suite, dans `installer-backups` du dossier d'installation (sur Kubernetes, `backups` à côté du fichier d'état de l'installateur). Un Runner n'a aucune donnée à sauvegarder |
| `release-notes` | Affiche les notes de version d'une version, `--version` ou celle de cet installateur, les changements incompatibles d'abord |
| `uninstall` | Supprime l'installation, et avec `--purge` ses données |
| `version` | Affiche la version de l'installateur |

L'installateur mémorise l'installation dans `/etc/ansibleforms/installer.json` pour root, ou `~/.config/ansibleforms/installer.json`
pour un autre utilisateur, si bien que les commandes après `install` n'ont besoin d'aucune option et trouvent l'installation d'elles-mêmes. Ce dossier ne contient aucun binaire,
et n'existe qu'une fois que l'installateur a installé un AnsibleForms ou en a pris un en charge :

```bash
sudo /usr/local/bin/ansibleforms-installer status
sudo /usr/local/bin/ansibleforms-installer backup
sudo /usr/local/bin/ansibleforms-installer upgrade
```

`uninstall` demande **Supprimer aussi ses données (base, formulaires, playbooks, journaux) ?**. Pour les supprimer, tapez le nom de l'instance (la release Helm
sur Kubernetes) ; sinon il supprime les conteneurs, pods ou services et garde les données.

---

## Options

Chaque option répond à une question, que l'assistant saute alors. `ansibleforms-installer --help` les liste :

| Option | Ce à quoi elle répond |
|---|---|
| `--lang <code>` | La langue : `ca`, `de`, `en`, `es`, `fr`, `it`, `ja`, `nl`, `pl`, `pt` ou `zh` |
| `--version <version>` | La version d'AnsibleForms à installer ou vers laquelle mettre à niveau ; celle de cet installateur par défaut |
| `--role <role>` | `controller` ou `runner` |
| `--mode <mode>` | `compose`, `kubernetes` ou `native` |
| `--runtime <runtime>` | `docker` ou `podman` (compose) |
| `--install-runtime` | Installer Docker ou Podman s'il manque, sans demander |
| `--dir <folder>` | Le dossier d'installation (compose) |
| `--name <name>` | Le nom de l'instance, le préfixe de ses conteneurs (compose, `af` par défaut) |
| `--port <port>` | Le port sur l'hôte : l'interface web pour un contrôleur, le RTE pour un Runner |
| `--tls <choice>` | `self`, `own` ou `off` (un contrôleur compose) |
| `--cert <file>`, `--key <file>` | Les fichiers du certificat et de la clé, avec `--tls own` |
| `--admin-password <password>` | Le mot de passe du premier admin ; généré par défaut |
| `--join <token>` | Un jeton d'adhésion (`afj_...`), créé via l'API, qui approuve le Runner tout de suite (un Runner, sans surveillance ; voir [Jetons d'adhésion](../runners/registration.html#join-tokens)) |
| `--app-url <address>` | L'adresse de l'application, par exemple `https://forms.example.com` (un Runner) |
| `--runner-mode <mode>` | `outbound` (le RTE appelle l'application) ou `inbound` (l'application appelle le RTE) (un Runner) |
| `--host <address>` | L'adresse de ce serveur, que l'application appelle (un Runner entrant) |
| `--namespace <namespace>` | Le namespace Kubernetes, `ansibleforms` par défaut |
| `--release <release>` | La release Helm, `ansibleforms` par défaut |
| `--hostname <name>` | Le nom d'hôte de l'ingress (kubernetes) |
| `--ingress-class <class>` | La classe d'ingress (kubernetes) |
| `--storage-class <class>` | La classe de stockage (kubernetes) |
| `--values <file>` | Un fichier de valeurs Helm supplémentaire (kubernetes) |
| `--purge` | Avec `uninstall` : supprimer aussi les données |
| `--source <folder>` | Une copie locale du dépôt [ansibleforms/docker](https://github.com/ansibleforms/docker) à partir de laquelle installer (hors ligne) |
| `--bundle <file>` | Un bundle de version, `ansibleforms-<version>-linux-<arch>.tar.gz`, à partir duquel installer en natif (voir [Installation native](native.html#air-gapped)) |
| `--yes` | Répondre à chaque question avec sa valeur par défaut (sans surveillance) |
| `--verbose` | Afficher chaque commande exécutée |

---

## Sans surveillance

Avec `--yes`, ou sans terminal, l'installateur ne demande rien : les options répondent à leurs questions et les valeurs par défaut au reste. Il
saute la langue, les nouveautés, le mot de passe admin (généré, sauf si `--admin-password` en fournit un) et la vérification, et affiche
à la place le lien vers les notes de version. Il n'installe un Docker ou un Podman manquant qu'avec `--install-runtime` ou `--yes`, et un Runner
a besoin de `--app-url`. Sans `--join`, le Runner demande à rejoindre et attend l'approbation d'un admin ; avec, il est approuvé tout de suite.

Un contrôleur sur Docker, en installant Docker s'il manque :

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role controller --runtime docker --install-runtime --tls self --admin-password '<password>'
```

Un Runner entrant sur Podman, que l'application appelle sur `rte-dmz.example.com:8000` :

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role runner --runtime podman --install-runtime --app-url https://forms.example.com --join afj_<...> \
  --runner-mode inbound --host rte-dmz.example.com --port 8000
```

---

## Une installation existante

L'installateur mémorise ce qu'il a installé dans `installer.json`. Sans ce fichier, `install`, `upgrade` et `status` cherchent d'abord un
AnsibleForms déjà présent sur le serveur, quel que soit ce qui l'a installé :

| Trouvé | Comment il est trouvé | Pris en charge quand |
|---|---|---|
| Docker ou Podman | Des conteneurs de l'image de l'application ou du RTE, regroupés par projet compose | Le dossier contient le fichier compose et le `.env` du dépôt [ansibleforms/docker](https://github.com/ansibleforms/docker) : les services `mysqldb`, `app` et `rte`, dans les conteneurs `<name>_db`, `<name>_app` et `<name>_rte` |
| Un Runner 7.2 | Un RTE seul dans son projet compose, avec les `DB_*` de l'application et sans `RTE_MODE` (mode base de données) | Son fichier compose est lisible. Sa mise à niveau le fait passer en mode socket (voir [Un Runner 7.2](#a-72-runner)) |
| Kubernetes | Des releases Helm du chart `ansibleforms`, et des Deployments et StatefulSets de ses images | C'est une release du chart : ses valeurs actuelles deviennent son fichier de valeurs |
| Natif | Des services systemd qui font tourner AnsibleForms avec Node.js | Ils suivent la disposition de l'installateur : `releases/`, `current`, `app.env` et `rte.env` (voir [Installation native](native.html#the-folder)) |
| Aucun moteur | L'application ou un RTE qui répond sur un port habituel : 443, 3000, 3001, 8000, 8001, 8010 ou 8443 | Jamais : il tourne depuis les sources ou à la main. L'installateur se contente de le signaler |

Seules les images de l'application et du RTE comptent : un conteneur MySQL nommé d'après AnsibleForms n'est pas une installation. L'installateur liste ce
qu'il a trouvé, une ligne par élément, avec la raison et ce qu'il faut faire à la main pour un élément qu'il ne peut pas prendre en charge : son fichier compose n'est pas celui du dépôt,
sa base de données est hors de son projet compose, il tourne sur Kubernetes sans le chart Helm, il est géré par Argo CD (mettez-le à niveau là,
en changeant la version du chart de l'Application), ou sa version ne peut pas être lue.

Pour une installation qu'il peut prendre en charge, `install` propose trois choix :

| Choix | Ce qu'il fait |
|---|---|
| Prendre en charge et mettre à jour | Montre ce qu'il va mémoriser, puis écrit `installer.json` une fois que vous confirmez, et continue avec la [mise à niveau](#upgrade) |
| Installer quand même un nouvel AnsibleForms à côté | Une seconde installation, avec son propre dossier, ses ports et sa base de données, après une confirmation à part |
| Arrêter | Rien n'est modifié |

Pour une installation qui exécute déjà la version que l'installateur installerait, le premier choix est **Prendre en charge** à la place : l'installateur
mémorise où elle se trouve et comment elle tourne, pour ses sauvegardes, son état et ses prochaines mises à niveau, et rien n'est modifié pour l'instant.

`upgrade` propose la même chose sans le deuxième choix, et s'arrête quand rien ne peut être pris en charge. Sans surveillance, `install` s'arrête avec un message,
et `upgrade --yes` ne prend une installation en charge que lorsqu'il en trouve exactement une qu'il peut prendre en charge. Les valeurs actuelles d'une release Kubernetes sont
enregistrées à côté de `installer.json`, et les mises à niveau les réappliquent avec le chart de la nouvelle version.

---

## Mise à niveau

`ansibleforms-installer upgrade` fait passer l'installation à une version plus récente de la même version majeure. Il liste les versions plus récentes,
la dernière en premier (sans surveillance, il prend la dernière), et affiche les notes de version de chaque version qu'il franchit, avec d'abord les changements incompatibles
et les suppressions. Quand elles contiennent des changements incompatibles, il vous demande de confirmer que vous les avez lues ; sans surveillance, seul `--yes` permet de continuer.

L'installateur sauvegarde la base de données avant tout changement. Quand la nouvelle version ne répond pas, il propose de revenir en arrière : la version
précédente revient, et sa base de données est restaurée depuis cette sauvegarde. Il ne rétrograde pas, et il ne franchit pas de version majeure : suivez
le [guide de mise à niveau](../upgrade-7.html) pour cela, par exemple de la 6.x à la 7.x, avec ce qu'il faut faire en 6.5 avant la mise à niveau.

Sur Docker ou Podman, la mise à niveau d'un contrôleur met aussi ses fichiers à jour avec la nouvelle version du dépôt docker :

| Fichier | Ce que fait la mise à niveau |
|---|---|
| `docker-compose.yml` | Remplacé par celui de la nouvelle version, après en avoir enregistré une copie dans `installer-backups` |
| `.env` | Chaque ligne existante est conservée, et les clés dont la nouvelle version a besoin sont ajoutées, avec des secrets créés comme lors d'une nouvelle installation. Une copie est enregistrée d'abord |
| `data/seed.yaml` | Remplacé quand c'est un seed livré par le dépôt docker, non modifié. Un seed modifié à la main est conservé, et le nouveau est enregistré à côté |
| `data/` | Les nouveaux fichiers qu'apporte la version, comme un nouveau playbook, sont ajoutés. Chaque fichier existant est conservé |

Un paramètre de base de données manquant (`MYSQLDB_USER` ou un mot de passe) ne peut pas être inventé pour une base de données qui existe, la mise à niveau s'arrête donc alors avant
tout changement. Un retour arrière remet le fichier compose, le `.env` et le seed tels qu'ils étaient.

Un Runner exécute la même version que son AnsibleForms : mettez d'abord AnsibleForms à niveau, puis ses Runners. La mise à niveau d'un Runner réécrit son
fichier compose pour la nouvelle image RTE et garde son `.env` et ses données tels quels.

---

## Un Runner 7.2

Un Runner de la 7.2 tourne en mode base de données, obsolète depuis la 7.3.0 : son RTE détient les paramètres de base de données d'AnsibleForms. L'installateur le
trouve (voir [Une installation existante](#an-existing-installation)), et sa mise à niveau le fait passer en mode socket sous le même runner :

1. Il lit le nom du runner (`RTE_NAME`) et son jeton (`RTE_TOKEN`) dans l'ancien conteneur RTE. Quand le RTE ne s'est pas inscrit lui-même
   (`RTE_REGISTER=0`), vous tapez le nom qu'a son runner sous **Connexions > Runners**
2. Il demande l'adresse de l'application et le mode, **sortant** par défaut ou entrant, et pour le mode entrant le port et l'adresse de ce serveur
3. Il montre le plan, puis sauvegarde l'ancien fichier compose et le `.env` dans `installer-backups`
4. Il écrit la disposition de Runner de l'installateur sans les paramètres `DB_*`. Il garde `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`,
   `PROCESS_MAX_BUFFER` et `METRICS_TOKEN`, qu'un RTE en mode socket lit toujours
5. Il démarre le nouveau RTE à côté de l'ancien. Le nouveau RTE s'authentifie avec le propre jeton du runner, et AnsibleForms fait passer le runner au
   nouveau mode de lui-même, **sans approbation** : ses jobs et les formulaires qui le nomment restent inchangés
6. Une fois le nouveau RTE connecté, l'ancien conteneur est arrêté et supprimé

Un Runner entrant sert du HTTPS avec un certificat épinglé, comme un nouveau (voir [Un Runner](#a-runner)), et l'installateur imprime l'empreinte de son
certificat. Quand l'ancien RTE occupe le port dont le nouveau a besoin, il est arrêté d'abord, le Runner est donc hors ligne jusqu'à ce que le
nouveau se connecte. Le nouveau RTE d'un Runner sortant prend un port libre sur `127.0.0.1` et tourne à côté de l'ancien sans interruption.

Quand l'installateur ne parvient pas à lire un jeton dans l'ancien RTE, vous choisissez comment le nouveau RTE s'authentifie :

| Choix | Ce qui suit |
|---|---|
| Saisir le jeton du runner | Le mot de passe de l'identifiant RTE du runner sous **Connexions > Identifiants**. Le runner garde son nom et ses jobs |
| Rejoindre comme nouveau runner avec un jeton d'adhésion | Un [jeton d'adhésion](../runners/registration.html#join-tokens) ajoute un nouveau runner sous un autre nom. Retirez l'ancien runner à la main |

Quand le nouveau RTE ne se connecte pas, l'installateur propose de remettre les anciens fichiers et de redémarrer l'ancien conteneur ; si AnsibleForms
avait déjà fait passer le runner au nouveau mode, remettez son mode à base de données sous **Connexions > Runners**. Une fois le nouveau RTE connecté, il n'y a
plus de retour possible : les anciens fichiers restent dans `installer-backups`.

Quand AnsibleForms ne connaît aucun runner de ce nom, le nouveau RTE demande à rejoindre à la place et attend une approbation. Rejetez cette demande sous
**Connexions > Runners**, puis relancez la mise à niveau avec le nom qu'a le runner à cet endroit.

---

## Versions

La version de l'installateur suit celle de l'application : chaque version d'AnsibleForms est accompagnée d'un installateur de la même version, publié avec elle, et
cet installateur installe cette version par défaut. `--version` en installe une autre. Chaque release de la
[page Releases de l'installateur](https://github.com/ansibleforms/installer/releases) a des binaires pour Linux sur amd64 et arm64, avec leurs
sommes de contrôle.
