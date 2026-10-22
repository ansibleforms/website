---
layout: default
title: Docker Compose
parent: Installation
nav_order: 4
translated_from: 74a6833ea71d65db337025978672afeab0425666
---

# Docker Compose
{: .no_toc }

Installer AnsibleForms, son RTE et MySQL ensemble avec docker-compose ou podman-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Le [projet docker-compose](https://github.com/ansibleforms/docker) fait tourner trois conteneurs : MySQL, l'application AnsibleForms et le RTE
(runtime environment) qui exécute les playbooks. Il contient leurs paramètres, des formulaires et des playbooks d'exemple, la seule autre exigence est donc
Docker ou Podman avec son outil compose.

L'[installateur](installer.html) télécharge ce projet, remplit ses paramètres et ses secrets, et le démarre en une seule commande. Cette page
le met en place à la main.

---

## Prérequis

Avant de commencer, il vous faut :

* **Une machine Linux** : n'importe quelle distribution, avec un CPU et une mémoire modestes
* **Un accès à GitHub** : pour télécharger ou cloner le projet docker-compose depuis GitHub
* **Docker ou Podman** : un moteur de conteneurs, installé plus bas
* **Un outil compose** : Docker Compose ou podman-compose, pour démarrer les trois conteneurs à partir de quelques fichiers de configuration

**VIDÉO** : [Comment installer AnsibleForms](https://www.youtube.com/watch?v=IHGIggmtTuA)

---

## Choisir un emplacement d'installation

Créez un dossier pour le projet ; les exemples utilisent `/srv/apps` :

```bash
sudo mkdir /srv/apps
cd /srv/apps
```

---

## Cloner le projet docker-compose

Installez Git :

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y git
```

</div>
</div>

Clonez ensuite le projet docker-compose dans ce dossier :

```bash
sudo git clone https://github.com/ansibleforms/docker.git ansibleforms-docker
cd ansibleforms-docker
```

---

## Définir les bonnes permissions

L'application et le RTE tournent sous l'utilisateur `node` (uid 1000), donnez donc le dossier `data` à cet utilisateur :

```bash
sudo chown -R 1000:1000 ./data
```

Si vous venez de la 6, dont le conteneur tournait en root, lancez le même `chown` une fois avant de démarrer la 7. MySQL reprend son propre dossier à son démarrage.

---

## Installer un moteur de conteneurs

Installez Docker ou Podman, chacun avec son outil compose :

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

Installez Docker Engine avec le plugin Compose depuis le dépôt de Docker
(voir les [manuels d'installation de Docker](https://docs.docker.com/engine/install)) :

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
# Docker's own dnf repository (Rocky / Alma : use .../linux/centos/docker-ce.repo)
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
</div>

Faites ensuite en sorte que les noms se résolvent dans les conteneurs, et démarrez Docker comme service :

```bash
sudo mkdir -p /etc/docker
echo "{\"dns-opts\":[\"ndots:15\"]}" | sudo tee /etc/docker/daemon.json
sudo systemctl enable --now docker
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman ne nécessite pas de service. Installez-le avec podman-compose :

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y podman
# podman-compose comes from EPEL (on RHEL, enable EPEL as Red Hat documents it)
sudo dnf install -y epel-release
sudo dnf install -y podman-compose
```

</div>
</div>

</div>
</div>

---

## Personnaliser

Passez en revue les variables des fichiers `.env` et `docker-compose.yml`, et changez tous les mots de passe : `MYSQLDB_ROOT_PASSWORD`,
`MYSQLDB_PASSWORD`, `ADMIN_PASSWORD` et `RTE_TOKEN`. [En savoir plus sur les variables d'environnement](../customization)

L'application se connecte à MySQL en tant que `ansibleforms` (`MYSQLDB_USER`), avec tous les droits sur le schéma `AnsibleForms` et aucun
ailleurs ; root ne sert qu'à MySQL lui-même. MySQL ne crée cet utilisateur qu'à son premier démarrage : une installation qui se connectait jusqu'ici en root
le crée une fois, comme le montre le [README](https://github.com/ansibleforms/docker#database) du projet.

Le RTE n'est pas publié sur l'hôte. Depuis la 7.3.0, l'application l'appelle sur `http://rte:8000` avec `RTE_TOKEN` et garde un WebSocket ouvert
(`RTE_MODE=inbound`, voir [Modes](../rte/modes.html)) : le RTE ne reçoit aucun paramètre de base de données ni le `.env`, seulement son jeton et quelques
paramètres à lui dans `docker-compose.yml`. Le seed de configuration `data/seed.yaml` déclare un identifiant RTE avec le jeton et cette
adresse, et le runner par défaut `rte`, en mode entrant, qui s'authentifie avec. Le RTE exécute les playbooks depuis le même dossier `data`
(`RTE_FILES=local`). Quand vos playbooks ont besoin de plus de collections ou de bibliothèques Python, construisez votre propre RTE
et faites pointer le service `rte` dessus (voir [Construire votre propre RTE](../rte/images.html#build-your-own-rte)).

---

## Démarrer le projet docker-compose

Démarrez les trois conteneurs en arrière-plan. L'application attend que MySQL soit en bonne santé, puis appelle le RTE :

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
# with the older standalone tool : sudo docker-compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose up -d
# podman is service-less : you can run it as any user, with or without sudo
```

</div>
</div>

---

## Tester l'application

Une fois les conteneurs démarrés, ouvrez AnsibleForms dans un navigateur :

* Ouvrez `https://your_ip` (port 443, voir `WEBAPP_LOCAL_PORT` dans le fichier .env)
* Connectez-vous en tant que `admin` avec le `ADMIN_PASSWORD` du fichier `.env` ; tant que c'est encore la valeur par défaut `AnsibleForms!123`, choisissez un nouveau mot de passe
* Vérifiez sous **Connexions > Runners** que le RTE est listé comme `rte`, le runner par défaut, et que sa page affiche sa
  **Connexion** comme **Connecté**
* Étapes suivantes :
  * Créez des formulaires en ajoutant des fichiers YAML au dossier data/forms/ ou en utilisant le concepteur intégré
  * Ajoutez vos playbooks au dossier data/playbooks/
  * Ajoutez une connexion LDAP
  * Ajoutez des utilisateurs et des groupes
  * Ajoutez des runners pour les formulaires de modèle : AWX, AAP ou Ascender, Semaphore, Rundeck ou Jenkins
  * Ajoutez des identifiants pour les connexions externes, comme d'autres serveurs MySQL ou des API REST, ou à transmettre aux playbooks Ansible
  * Connectez des dépôts Git et choisissez si vos formulaires et/ou vos playbooks se synchronisent avec un dépôt

---

## Structure des fichiers

Le projet docker-compose a la structure de dossiers suivante :

```bash
.
├── docker-compose.yml # the mysqldb, app and rte containers
├── .env # the settings, see the variables below
└── data # everything that must survive an upgrade, mounted in the app and the rte
    ├── ansible # mounted in the rte only
    │   ├── ansible.cfg # ansible settings
    │   ├── roles # roles you install
    │   └── collections # collections you install
    ├── forms # 1 or more yaml files with forms
    ├── functions # custom javascript functions and jq definitions
    ├── git # .gitconfig for repository connections
    ├── mysql
    │   ├── my.cnf # MySQL settings
    │   └── db # the database files (created at first start)
    ├── playbooks # your ansible playbooks, with sample maintenance playbooks
    ├── repositories # local clones of your git repositories
    ├── ssh # the client sshkey (created at first start)
    ├── config.yaml # categories, roles and constants
    ├── seed.yaml # the config seed: registers the rte as the default runner
    ├── certificates # self-signed certificates (created at first start) - replace with your own
    ├── logs # the logfiles (created at first start)
    ├── backups # database backups (created when needed)
    └── forms_backups # form backups (created when needed)
```
