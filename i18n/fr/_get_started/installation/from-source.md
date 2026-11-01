---
layout: default
title: Depuis les sources
parent: Installation
nav_order: 5
translated_from: 5a30cd6f93473aa6d47bf91aabbe13af37d97127
---

# Depuis les sources
{: .no_toc }

Construire AnsibleForms depuis les sources et le faire tourner avec Node.js
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Organisation du code

Le dépôt contient deux applications Node.js, qu'une construction réunit en une seule :

* **client** : l'interface web, écrite en Vue 3 et construite en fichiers statiques avec Vite
* **server** : l'API, écrite avec Express. Elle confie les jobs aux runners, se connecte à la base de données et sert le client construit.
  Démarré avec `AF_ROLE=rte`, le même serveur est le RTE (runtime environment) qui exécute les playbooks

Seul le client est construit ; sa sortie va dans le dossier `views` du serveur, comme dans l'[image Docker](https://github.com/ansibleforms/ansibleforms/blob/main/docker/controller/Dockerfile).

---

## Prérequis

Construire et exécuter depuis les sources demande de solides compétences Linux et quelques connaissances de Node.js. Vous installez chaque composant vous-même. Pour
faire tourner AnsibleForms sans conteneurs et sans le construire, l'[installation native](native.html) de l'installateur fait tout cela pour vous :

* **Node.js 26** (la version de `.nvmrc` ; 24 au minimum), avec npm
* **Git**, pour récupérer le code et synchroniser les dépôts
* **Le client OpenSSH**, pour git en SSH, et **sshpass**, pour les playbooks qui se connectent avec un mot de passe SSH
* **Le client MariaDB** (`mariadb`, `mariadb-dump`), pour les sauvegardes et les restaurations, y compris avec un serveur MySQL
* **MySQL 8+ ou MariaDB**, joignable depuis le serveur
* **Ansible**, pour le processus RTE qui exécute les playbooks (`ansible-playbook` dans son path). Le processus de l'application lui-même n'a besoin
  ni d'Ansible ni de Python, et avec seulement des formulaires de modèle (AWX, AAP, Ascender et les autres runners), vous n'avez besoin d'aucun RTE

Installez-les pour votre distribution :

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Node.js 26 vient du dépôt NodeSource, les autres outils d'Ubuntu lui-même :

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Node.js 26 vient du dépôt NodeSource, les autres outils de Debian lui-même :

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

Node.js vient de NodeSource et `sshpass` d'EPEL (sur RHEL lui-même, activez EPEL comme Red Hat le documente) :

```bash
curl -fsSL https://rpm.nodesource.com/setup_26.x | sudo bash -
sudo dnf install -y epel-release
sudo dnf install -y nodejs git openssh-clients sshpass mariadb python3 python3-pip ansible-core
```

</div>
</div>

Vérifiez `node --version` (26) et `ansible-playbook --version` ; pour la base de données et son utilisateur, voir [Installer MySQL](docker.html#install-mysql).

---

## Récupérer le code

Clonez le dépôt dans un dossier de votre choix, appartenant à l'utilisateur qui fera tourner l'application. Les exemples utilisent `/srv/apps/ansibleforms` :

```bash
sudo mkdir -p /srv/apps
sudo chown $USER /srv/apps
cd /srv/apps
git clone https://github.com/ansibleforms/ansibleforms.git
cd ansibleforms
```

---

## Construire

Construisez en trois étapes, depuis le dossier du dépôt. Construisez d'abord le client :

```bash
cd client
npm ci
npm run build
```

Installez ensuite les dépendances du serveur :

```bash
cd ../server
npm ci --omit=dev
```

Enfin, copiez le client construit dans le dossier `views` du serveur :

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

---

## Configurer

Le serveur lit ses paramètres dans des variables d'environnement et, en production, aussi dans `server/persistent/.env`, le fichier
dans lequel écrivent les pages de paramètres.

Partez du fichier d'exemple à la racine du dépôt et définissez au moins la connexion MySQL (`DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`) :

```bash
cd /srv/apps/ansibleforms/server
mkdir -p persistent
cp ../.env.example persistent/.env
```

Toutes les variables sont décrites sous [Variables d'environnement](../customization). Tout le reste est stocké par défaut dans `server/persistent` :
`config.yaml`, le dossier `forms` et des certificats auto-signés y sont créés au premier démarrage, à côté des journaux.
Mettez vos playbooks dans `server/persistent/playbooks`, ou faites pointer `ANSIBLE_PATH` ailleurs dans l'environnement du RTE, qui la lit.

---

## Exécuter

Faites tourner AnsibleForms en production, ou en mode développement pour travailler sur le code lui-même :

<div class="af-tabs" data-tab-group="mode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="production" aria-selected="true">Production</button>
<button type="button" role="tab" class="af-tab" data-tab="development" aria-selected="false">Développement</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="production" markdown="1">

Démarrez le serveur en mode production depuis le dossier `server` :

```bash
cd /srv/apps/ansibleforms/server
npm run start
```

Une application démarrée depuis la ligne de commande s'arrête quand vous vous déconnectez. [PM2](https://pm2.keymetrics.io/) la fait tourner en
arrière-plan, la redémarre après un plantage et la relance au boot :

```bash
sudo npm install -g pm2

cd /srv/apps/ansibleforms/server
NODE_ENV=production pm2 start index.js --name ansibleforms
pm2 save
pm2 startup   # prints the command that starts PM2 at boot
```

Les playbooks s'exécutent sur un RTE : démarrez le même serveur une seconde fois avec `AF_ROLE=rte`, sur un port à lui. L'application l'appelle et garde
un WebSocket ouvert (`RTE_MODE=inbound`, voir [Modes](../rte/modes.html)), et il exécute les playbooks depuis les mêmes dossiers
(`RTE_FILES=local`). Il lit aussi `persistent/.env`, mais n'utilise aucun de ses paramètres de base de données. Ajoutez à `persistent/.env` le jeton que l'application et le RTE partagent,
d'au moins 16 caractères, et le seed de configuration qui déclare le RTE :

```bash
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/srv/apps/ansibleforms/server/persistent/seed.yaml
```

Le [seed de configuration](../seed/) déclare un identifiant RTE avec l'adresse du RTE et son jeton, et le runner par défaut `rte` qui s'authentifie
avec :

```yaml
version: 1
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://127.0.0.1:8010
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

Sans seed, ajoutez-les sous **Connexions > Identifiants** (un identifiant RTE avec cette adresse et le jeton) et
**Connexions > Runners** (type RTE, **Mode** **Entrant**). Démarrez ensuite le RTE, sur `127.0.0.1` uniquement :

```bash
cd /srv/apps/ansibleforms/server
AF_ROLE=rte RTE_MODE=inbound RTE_FILES=local PORT=8010 HTTPS=0 LISTEN_HOST=127.0.0.1 \
  NODE_ENV=production pm2 start index.js --name ansibleforms-rte
pm2 save
```

Les paramètres du RTE sont décrits sur la page [Faire tourner un RTE](../rte/run.html). Vérifiez que PM2 liste les deux processus :

```bash
pm2 status
```

Les deux sont `online` :

```text
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| id | name             | mode | version | pid  | uptime | restarts | status | cpu | mem     | user | watching |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| 0  | ansibleforms     | fork | 7.0.0   | 3104 | 8s     | 0        | online | 0%  | 120.1mb | root | disabled |
| 1  | ansibleforms-rte | fork | 7.0.0   | 3187 | 5s     | 0        | online | 0%  | 80.4mb  | root | disabled |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="development" markdown="1" hidden>

Pour travailler sur le code lui-même, démarrez tout depuis la racine du dépôt avec rechargement à chaud : le serveur sur le port 3001, un RTE sur le port 8010
et le client sur `https://localhost:8443`. Dans ce mode, le serveur et le RTE lisent `server/.env.development` à la place :

```bash
cd /srv/apps/ansibleforms
npm install
(cd server && npm install && cp ../.env.example .env.development)
(cd client && npm install)
npm run dev
```

Le RTE (`npm run dev:rte`) a besoin de `ansible-playbook` dans le path, et s'ajoute lui-même comme runner en mode base de données, obsolète, pour
le développement seulement ; `npm run dev:local` démarre le client et le serveur sans lui. Le [guide de contribution](https://github.com/ansibleforms/ansibleforms/blob/main/CONTRIBUTING.md) décrit les tests et les vérifications à lancer.

</div>
</div>

---

## Premier démarrage

Ouvrez le serveur dans un navigateur (avec le `.env` d'exemple, `https://your_ip:8443`). Sur une base de données vide, le schéma est créé au
premier démarrage.

Les identifiants admin par défaut sont :

* nom d'utilisateur : `admin`
* mot de passe : `AnsibleForms!123`
