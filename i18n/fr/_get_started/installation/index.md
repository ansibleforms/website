---
layout: default
title: Installation
nav_order: 1
has_children: true
has_toc: false
permalink: /installation/
translated_from: c5efb1a569cf31ab6b1817687a024e12c26eb128
---

# Installation
{: .no_toc }

Choisir une méthode d'installation pour AnsibleForms
{: .fs-6 .fw-300 }

---

Pour les administrateurs qui mettent en place une nouvelle instance : choisissez une méthode d'installation, puis suivez sa page.

---

## Dans cette section

AnsibleForms prend en charge plusieurs méthodes d'installation, chacune décrite sur sa propre page :

| Page | Ce qu'elle couvre |
|---|---|
| [Installateur](installer.html) | Une seule commande qui installe un contrôleur ou un Runner sur Docker, Podman, Kubernetes ou en natif, puis le met à niveau et le sauvegarde |
| [Natif](native.html) | L'installation de l'installateur sans conteneurs : Node.js, MariaDB et Ansible sur le serveur, AnsibleForms sous forme de services systemd |
| [Docker](docker.html) | Installer MySQL et lancer l'image Docker préconstruite avec les variables d'environnement requises |
| [Docker Compose](docker-compose.html) | Télécharger le [projet docker-compose](https://github.com/ansibleforms/docker) et utiliser docker-compose pour démarrer à la fois MySQL et AnsibleForms |
| [Depuis les sources](from-source.html) | Installer toutes les dépendances à la main, puis construire et démarrer le code |
| [Kubernetes](kubernetes.html) | Installer le chart Helm et utiliser Kubernetes pour démarrer AnsibleForms et sa base de données MySQL |

{: .note }
> **Recommandation** L'installateur, depuis la 7.3.0, est le moyen le plus rapide d'obtenir une instance fonctionnelle : il met en place le projet Docker Compose sur
> Docker ou Podman, ou l'une des autres méthodes, à partir de quelques questions. Les images Docker contiennent toutes les dépendances.

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

Pour passer une installation existante à une version plus récente, voir [Mise à niveau](../upgrading/).

Chaque méthode fait tourner un RTE à côté de l'application, le conteneur (ou le service) qui exécute les playbooks. Pour en ajouter un autre, sur un autre hôte ou dans un autre
datacenter, installez un Runner avec l'[installateur](installer.html#a-runner) : il appelle AnsibleForms via un WebSocket (sortant, voir
[Modes](../rte/modes.html)) et ne détient aucun identifiant de base de données. Voir aussi [Environnements d'exécution](../rte/) et son guide pratique
[Un RTE dans un autre datacenter](../rte/another-datacenter.html).

---

## Tags d'image

L'image est publiée sous `ghcr.io/ansibleforms/ansibleforms` sur le GitHub Container Registry, qui appartient au
projet et ne limite pas le débit des récupérations anonymes. Toutes les versions à partir de la 7.0.0 sont publiées uniquement là, et les versions 6.x
s'y trouvent aussi.

Depuis la 7, les playbooks s'exécutent sur un RTE, publié en trois couches à côté de l'application (voir [Les images RTE](../rte/images.html)) :

| Image | Ce que c'est |
|---|---|
| `ghcr.io/ansibleforms/ansibleforms` | L'application web et l'API, sans python ni ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Le RTE sans python ni ansible : la base pour le vôtre |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | La base avec python, ansible-core et quelques bibliothèques : celle à laquelle ajouter vos collections |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | Le core avec le paquet `ansible`, ses collections et ses bibliothèques : le RTE par défaut |

Les quatre images sont construites dans la même exécution et portent les mêmes tags, un tag RTE correspond donc toujours à celui de l'application.

L'ancien dépôt Docker Hub, `ansibleguy/ansibleforms`, n'est plus mis à jour. Il garde ses versions
existantes mais ne reçoit aucune nouvelle version d'aucune des deux branches. Si vous récupérez vos images depuis là, passez
à `ghcr.io/ansibleforms/ansibleforms` avec le même tag pour continuer à recevoir les mises à jour.

Les tags suivants sont disponibles sur chaque image ; les images RTE commencent à la 7.0.0, elles n'ont donc pas de tags 6.x :

| Tag | Pointe vers |
|---|---|
| `latest` | la version la plus récente de la version majeure la plus récente |
| `7`, `6` | la version la plus récente de cette version majeure |
| `7.0`, `6.5` | la version la plus récente de cette version mineure |
| `7.0.0`, `6.5.5` | exactement cette version |
| `latest-rc` | la release candidate la plus récente, ou la version la plus récente quand elle est plus récente ; chaque candidate a aussi son propre tag |

`latest` ne fait qu'avancer : un correctif pour une version majeure plus ancienne (par exemple une 6.5.x publiée
après la 7.0.0) fait avancer `6` et `6.5`, mais jamais `latest`.

Pour rester sur une version majeure, utilisez son numéro (`6`) au lieu de `latest`.
