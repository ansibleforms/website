---
layout: default
title: Docker Compose
parent: Mise à niveau
nav_order: 2
translated_from: e0588e18950ebc7164327833bdc85871783048ba
---

# Docker Compose
{: .no_toc }

Mettre à niveau une installation faite avec le projet docker-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Le projet docker-compose fait tourner trois conteneurs : MySQL (`mysqldb`), AnsibleForms (`app`) et le RTE qui exécute les
playbooks (`rte`). AnsibleForms et le RTE utilisent le tag d'image `7`, qui pointe toujours vers la version 7.x la plus récente. Une
mise à niveau récupère à nouveau les images et recrée les conteneurs dont l'image a changé. Tout ce qui doit persister est stocké
dans le dossier `data` et est conservé.

---

## Avant la mise à niveau

Préparez la mise à niveau pour pouvoir revenir en arrière si quelque chose se passe mal :

* **Faites une sauvegarde** sous **Paramètres → Sauvegardes**. La nouvelle version met à niveau le schéma de la base de données à son premier démarrage.
* **Lisez le [changelog](../changelog)** des versions entre la vôtre et la nouvelle.
* **Vous passez à une nouvelle version majeure ?** Suivez d'abord [Passer à la v7](../upgrade-7.html).
* **Vous venez de la 6.5 ?** Le projet 6.x, sur sa branche `v6`, n'a pas de conteneur `rte`. Mettez votre copie du projet à jour sur
  sa branche `main`, en gardant vos paramètres `.env` et votre dossier `data`, pour que `docker-compose.yml` contienne le service `rte`.
  Ce fichier compose définit `CONFIG_SEED_PATH`, et un dossier `data` de la 6.x n'a pas de `seed.yaml` : copiez `data/seed.yaml` depuis
  le dépôt, et ajoutez `RTE_TOKEN` (au moins 16 caractères) à votre `.env`, comme dans le `.env` du dépôt. Sans eux,
  l'application refuse de démarrer. Les images 7 tournent sous l'uid 1000 au lieu de root : donnez une fois le dossier `data` à cet utilisateur, en laissant les fichiers
  MySQL à MySQL, avec `sudo find data -path data/mysql -prune -o -exec chown 1000:1000 {} +`.
  Le dossier `data/ssh` est désormais monté sur `/home/node/.ssh` au lieu de `/root/.ssh`.
* **Vous venez de la 7.2 ?** Mettez à jour `docker-compose.yml` et `data/seed.yaml` ensemble : voir d'abord [De la 7.2 à la 7.3](#from-72-to-73).

---

## De la 7.2 à la 7.3

Jusqu'à la 7.2.0, le service `rte` recevait les paramètres de la base de données et son runner, déclaré dans `data/seed.yaml`, tournait en mode base de données,
obsolète en 7.3.0 et supprimé en 8.0.0. Depuis la 7.3.0, l'application appelle le RTE sur `http://rte:8000` et garde un WebSocket ouvert
(`RTE_MODE=inbound`, voir [Modes](../rte/modes.html)), et le RTE ne détient aucun paramètre de base de données. Prenez les deux fichiers sur la branche
`main` du dépôt, en gardant votre `.env` :

| Fichier | Ce qui change |
|---|---|
| `docker-compose.yml` | Le service `rte` ne lit plus `.env` : il reçoit `RTE_MODE=inbound`, `RTE_TOKEN` et `RTE_FILES=local`, et aucun `DB_*` |
| `data/seed.yaml` | Un identifiant RTE `rte`, avec `url: http://rte:8000` et `password: ${RTE_TOKEN}`, et le runner `rte` avec `rte_mode: inbound` et `credential: rte` |

Changez les deux. Avec seulement le nouveau fichier compose, le seed garde le runner `rte` en mode base de données : l'application appelle le RTE comme un RTE 7.2,
ce à quoi le nouveau RTE ne répond pas, et aucun playbook ne s'exécute. Un seed que vous avez modifié vous-même a besoin du même identifiant et du même `rte_mode`.

Un runner que le seed a créé reste géré, en lecture seule sous **Connexions → Runners**, même après la suppression de `CONFIG_SEED_PATH` : seul un
seed appliqué libère un runner qu'il ne déclare plus. Gardez donc le seed et définissez-y `rte_mode`, plutôt que de supprimer
`CONFIG_SEED_PATH` pour modifier le runner à la main.

L'[installateur](../installation/installer.html#upgrade) le fait tout seul : sa mise à niveau remplace `docker-compose.yml`, et `data/seed.yaml`
quand c'est celui livré par le dépôt, non modifié. Un seed modifié à la main est conservé, et le nouveau est enregistré à côté.

---

## 1. Récupérer les nouvelles images

Téléchargez les images les plus récentes des tags de `docker-compose.yml` :

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
cd /srv/apps/ansibleforms-docker
sudo docker compose pull
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
cd /srv/apps/ansibleforms-docker
sudo podman-compose pull
```

</div>
</div>

---

## 2. Recréer les conteneurs

Redémarrez le projet ; les conteneurs dont l'image a changé sont recréés :

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose down
sudo podman-compose up -d
```

</div>
</div>

---

## 3. Vérifier la mise à niveau

Suivez le journal d'AnsibleForms pendant son démarrage. Le premier démarrage d'une nouvelle version met à niveau le schéma de la base de données, et le RTE
démarre dès qu'AnsibleForms est en bonne santé :

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose logs -f app
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose logs -f app
```

</div>
</div>

Dans AnsibleForms, **Aide → À propos** affiche la version en cours d'exécution, et **Paramètres → Statut** affiche l'état de santé de la
base de données, du schéma et des autres systèmes dont AnsibleForms dépend.

---

## Revenir en arrière

Pour revenir à la version que vous utilisiez avant, celle qu'affichait **Aide → À propos** avant la mise à niveau, fixez son tag exact dans
`docker-compose.yml` pour l'image AnsibleForms comme pour l'image RTE, à la place de `7`, et relancez l'étape 2. Si cette version
ne démarre pas sur la base de données mise à niveau, restaurez la sauvegarde faite sous **Paramètres → Sauvegardes**. Remettez les tags à
`7` pour recevoir à nouveau les mises à jour.

**VIDÉO** : [Comment mettre à niveau AnsibleForms](https://www.youtube.com/watch?v=5ZDJ8CcUx5c)
