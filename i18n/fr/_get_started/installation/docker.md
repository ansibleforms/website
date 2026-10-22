---
layout: default
title: Docker
parent: Installation
nav_order: 3
translated_from: d178cc481311c66fba52c62ac7bf5841b5f83316
---

# Docker
{: .no_toc }

Lancer les images de l'application et du RTE d'AnsibleForms avec Docker ou Podman, à côté de votre propre serveur MySQL
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Vous pouvez faire tourner AnsibleForms avec Docker ou Podman sous forme de deux conteneurs, l'application et le RTE qui exécute les playbooks, connectés à une base de données MySQL.

---

## Prérequis

Avant de commencer, il vous faut :

* **Docker ou Podman** : l'un des deux installé et en fonctionnement
* **MySQL** : installé et en fonctionnement

---

## Installer MySQL

Installez MySQL 8+, ou MariaDB, sur un serveur Linux que le conteneur peut joindre :

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Ubuntu fournit MySQL 8 :

```bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Debian fournit MariaDB à la place de MySQL, qu'AnsibleForms prend aussi en charge :

```bash
sudo apt-get update
sudo apt-get install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mariadb-secure-installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

RHEL 8 et ultérieur, ainsi que ses recompilations, fournissent MySQL 8 dans AppStream :

```bash
sudo dnf install -y mysql-server
sudo systemctl enable --now mysqld
sudo mysql_secure_installation
```

</div>
</div>

AnsibleForms se connecte à la base de données par le réseau, en tant que `DB_USER` avec `DB_PASSWORD`. Donnez-lui un utilisateur dédié, avec des droits sur
le seul schéma `AnsibleForms`, pas root :

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

C'est tout ce dont AnsibleForms a besoin : avec cela, il crée et met à jour son schéma et fait ses sauvegardes. La page **Statut** et le journal
avertissent quand l'utilisateur a des droits sur toutes les bases de données. Sur Ubuntu et Debian, le serveur n'écoute que sur localhost : définissez `bind-address` dans sa
configuration pour que les conteneurs puissent le joindre.

---

## Préparer les dossiers

AnsibleForms 7 tourne dans deux conteneurs : l'application, et le RTE (runtime environment) qui exécute les playbooks. Les deux montent un dossier pour
votre `config.yaml`, vos formulaires, playbooks, journaux et certificats, et un dossier pour la clé SSH. Les images tournent sous l'utilisateur `node` (uid 1000),
donnez donc les deux dossiers à cet utilisateur :

```bash
sudo mkdir -p /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
```

Mettez les paramètres de l'application dans un fichier d'environnement : la connexion à la base de données,
[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) avant d'enregistrer le moindre identifiant, le jeton que l'application et le
RTE partagent ([`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN), au moins 16 caractères) et le seed de configuration qui déclare le RTE :

```bash
sudo tee /srv/apps/ansibleforms/ansibleforms.env > /dev/null <<'END'
DB_HOST=192.168.0.1
DB_PORT=3306
DB_USER=ansibleforms
DB_PASSWORD=<password>
ENCRYPTION_SECRET=<a long random string>
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml
END
sudo chmod 600 /srv/apps/ansibleforms/ansibleforms.env
```

Le RTE reçoit son propre fichier, sans les paramètres de la base de données : depuis la 7.3.0, l'application l'appelle et garde un WebSocket ouvert
(`RTE_MODE=inbound`, voir [Modes](../rte/modes.html)), et il exécute les playbooks depuis les mêmes dossiers (`RTE_FILES=local`) :

```bash
sudo tee /srv/apps/ansibleforms/rte.env > /dev/null <<'END'
RTE_MODE=inbound
RTE_TOKEN=<the same token>
RTE_FILES=local
PORT=8000
HTTPS=0
END
sudo chmod 600 /srv/apps/ansibleforms/rte.env
```

Le [seed de configuration](../seed/) déclare un identifiant RTE avec l'adresse du RTE et son jeton, et le runner par défaut `rte` qui s'authentifie
avec :

```bash
sudo tee /srv/apps/ansibleforms/persistent/seed.yaml > /dev/null <<'END'
version: 1
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://rte:8000
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
END
sudo chown 1000:1000 /srv/apps/ansibleforms/persistent/seed.yaml
```

---

## Démarrer les conteneurs

Lancez les images publiées sur le GitHub Container Registry (voir [Tags d'image](./#image-tags)) :
[`ghcr.io/ansibleforms/ansibleforms`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms) pour l'application et
[`ghcr.io/ansibleforms/ansibleforms-rte-full`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms-rte-full) pour le RTE.

Le seed ajoute le RTE sous **Connexions > Runners** comme runner `rte`, celui par défaut, les formulaires de playbook s'exécutent donc dessus sans autre
configuration. L'application crée le schéma à son premier démarrage, et appelle le RTE dès que les deux tournent (un exemple de `config.yaml` se trouve dans le
[projet docker-compose](https://github.com/ansibleforms/docker/blob/main/data/config.yaml)) :

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker network create ansibleforms

docker run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Une fois démarrés, les deux conteneurs sont listés :

```bash
docker ps
CONTAINER ID   IMAGE                                          COMMAND                  CREATED          STATUS                    PORTS                    NAMES
5c0e2a91d7f4   ghcr.io/ansibleforms/ansibleforms-rte-full:7   "/usr/bin/tini -- no…"   10 seconds ago   Up 9 seconds (healthy)                             rte
d91f7b05b67e   ghcr.io/ansibleforms/ansibleforms:7            "/usr/bin/tini -- no…"   2 minutes ago    Up 2 minutes (healthy)    0.0.0.0:8000->8000/tcp   ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman accepte les mêmes options et ne nécessite pas de service :

```bash
podman network create ansibleforms

podman run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

podman run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Une fois démarrés, les deux conteneurs sont listés :

```bash
podman ps
```

</div>
</div>

L'application écoute sur le port `8000`, en HTTP sauf si vous définissez `HTTPS=1`. Le RTE n'est pas publié sur l'hôte : seule l'application l'appelle, à l'intérieur
du réseau. `--stop-timeout 30` laisse au RTE le temps de terminer ses playbooks en cours lors d'un arrêt (voir
[Faire tourner un RTE](../rte/run.html) pour les paramètres du RTE et pour construire votre propre RTE).

---

## Tester l'application

Une fois les conteneurs démarrés, ouvrez AnsibleForms dans un navigateur :

* Ouvrez `http://your_ip:8000` (ou HTTPS, si vous avez défini `HTTPS=1`)
* Connectez-vous en tant que `admin` / `AnsibleForms!123` (ou avec le mot de passe défini par `ADMIN_PASSWORD`), et choisissez un nouveau mot de passe
* Vérifiez sous **Connexions > Runners** que le RTE est listé comme `rte`, le runner par défaut, et que sa page affiche sa
  **Connexion** comme **Connecté**
* Étapes suivantes :
  * Créez des formulaires en ajoutant des fichiers YAML au dossier `forms` ou en utilisant le concepteur intégré
  * Ajoutez vos playbooks au dossier `playbooks` du dossier persistant monté
  * Ajoutez une connexion LDAP
  * Ajoutez des utilisateurs et des groupes
  * Ajoutez des runners pour les formulaires de modèle : AWX, AAP ou Ascender, Semaphore, Rundeck ou Jenkins
  * Ajoutez des identifiants pour les connexions externes, comme d'autres serveurs MySQL ou des API REST, ou à transmettre aux playbooks Ansible
