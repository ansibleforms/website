---
layout: default
title: Docker
parent: Mise à niveau
nav_order: 1
translated_from: 4b3babaa4c1dd9c7848cf92c8bd75af68e6fac97
---

# Docker
{: .no_toc }

Mettre à niveau un conteneur autonome, sans docker-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Une installation autonome se met à niveau en remplaçant ses conteneurs : récupérez les nouvelles images, supprimez les anciens conteneurs et
démarrez-en de nouveaux avec les mêmes commandes `run`. Depuis la version 7, il y en a deux : AnsibleForms et le RTE qui exécute les
playbooks, toujours sur la même version. Vos fichiers sont stockés dans le dossier monté `/app/dist/persistent` et vos données dans
MySQL, les deux sont donc conservés.

---

## Avant la mise à niveau

Préparez la mise à niveau pour pouvoir revenir en arrière si quelque chose se passe mal :

* **Faites une sauvegarde** sous **Paramètres → Sauvegardes**. La nouvelle version met à niveau le schéma de la base de données à son premier démarrage.
* **Lisez le [changelog](../changelog)** des versions entre la vôtre et la nouvelle.
* **Vous passez à une nouvelle version majeure ?** Suivez d'abord [Passer à la v7](../upgrade-7.html).
* **Vous venez de la 6.5 ?** Les images 7 tournent sous l'uid 1000 au lieu de root : donnez une fois à cet utilisateur les dossiers que vous montez, par
  exemple `sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh`.
* **Vous venez de la 7.2 ?** Le RTE reçoit son propre fichier et l'application l'appelle : voir d'abord [De la 7.2 à la 7.3](#from-72-to-73).

---

## De la 7.2 à la 7.3

Jusqu'à la 7.2.0, le RTE lisait le fichier d'environnement de l'application, avec les paramètres de la base de données, et s'ajoutait lui-même comme runner à partir de `RTE_URL`. C'est
le mode base de données, obsolète en 7.3.0 et supprimé en 8.0.0. Depuis la 7.3.0, l'application appelle le RTE et garde un WebSocket ouvert
(`RTE_MODE=inbound`, voir [Modes](../rte/modes.html)), et le RTE ne détient aucun paramètre de base de données. Une seule fois, avant l'étape 2 :

1. Créez `/srv/apps/ansibleforms/rte.env` comme le fait l'[installation](../installation/docker.html#prepare-the-folders), avec
   `RTE_MODE=inbound`, le même `RTE_TOKEN`, `RTE_FILES=local`, `PORT=8000` et `HTTPS=0`. Pas de `DB_*`, pas d'`ENCRYPTION_SECRET`, pas de `RTE_URL`
2. Déclarez le runner dans ce mode. Soit vous ajoutez le [seed de configuration](../seed/) de l'installation, `persistent/seed.yaml` avec l'identifiant RTE
   (`url: http://rte:8000`, `password: ${RTE_TOKEN}`) et le runner `rte` (`rte_mode: inbound`), et vous ajoutez
   `CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml` au fichier d'environnement de l'application. Soit, sans seed, vous ouvrez le runner sous
   **Connexions → Runners**, mettez son **Mode** à **Entrant**, et choisissez un identifiant RTE qui contient `http://rte:8000` et le jeton

Avec le seed, le fichier d'environnement de l'application contient aussi `RTE_TOKEN`, le même jeton, puisque le seed le lit à cet endroit.

---

## 1. Récupérer les nouvelles images

Téléchargez les images AnsibleForms et RTE les plus récentes du tag que vous utilisez :

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker pull ghcr.io/ansibleforms/ansibleforms:7
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman pull ghcr.io/ansibleforms/ansibleforms:7
podman pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

---

## 2. Remplacer les conteneurs

Supprimez les anciens conteneurs et démarrez-en de nouveaux avec les commandes `run` de l'[installation](../installation/docker.html). L'application
lit la connexion à la base de données dans son fichier d'environnement, avec l'utilisateur de base de données d'AnsibleForms (pas root). Le RTE lit son propre
`rte.env`, sans les paramètres de la base de données, et l'application l'appelle sur un réseau que les deux conteneurs partagent :

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker stop ansibleforms rte
docker rm ansibleforms rte

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

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman stop ansibleforms rte
podman rm ansibleforms rte

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

</div>
</div>

Si vous venez de la 6.5, il n'y a pas encore de conteneur RTE : les commandes `stop` et `rm` ne trouvent que l'application. Créez le réseau partagé
une fois avec `docker network create ansibleforms` (ou `podman network create ansibleforms`). Comme le fait
l'[installation](../installation/docker.html#prepare-the-folders), mettez la connexion à la base de données, `ENCRYPTION_SECRET`, un `RTE_TOKEN`
d'au moins 16 caractères et `CONFIG_SEED_PATH` dans le fichier d'environnement de l'application, et créez `rte.env` et le seed de configuration. Utilisez vos propres
dossiers là où votre installation 6.5 en montait d'autres. Le seed ajoute le RTE sous **Connexions → Runners** comme runner par défaut `rte` ;
voir [Passer à la v7](../upgrade-7.html#playbooks-run-on-an-rte).

---

## 3. Vérifier la mise à niveau

Suivez le journal d'AnsibleForms pendant son démarrage. Le premier démarrage d'une nouvelle version met à niveau le schéma de la base de données :

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker logs -f ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman logs -f ansibleforms
```

</div>
</div>

Le RTE écrit son propre journal, que `docker logs rte` affiche. Dans AnsibleForms, **Aide → À propos** affiche la version en cours d'exécution, et **Paramètres → Statut** affiche l'état de santé de la
base de données, du schéma et des autres systèmes dont AnsibleForms dépend.

---

## Revenir en arrière

Pour revenir à la version que vous utilisiez avant, celle qu'affichait **Aide → À propos** avant la mise à niveau, relancez l'étape 2 avec
son tag exact à la place de `7`, pour l'image AnsibleForms comme pour l'image RTE. Si cette version ne démarre pas sur la base de données
mise à niveau, restaurez la sauvegarde faite sous **Paramètres → Sauvegardes**.
