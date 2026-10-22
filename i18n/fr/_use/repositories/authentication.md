---
layout: default
title: Authentification
parent: Dépôts git
nav_order: 2
translated_from: 9e2bb180b35951e97851c21f388db0d7d54d4c73
---

# Authentification
{: .no_toc }

HTTPS avec un jeton, SSH avec la clé générée, et commandes git personnalisées
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Authentification

La façon dont AnsibleForms s'authentifie dépend de la forme de l'**URI**.

### HTTPS avec un jeton

Pour un dépôt distant HTTPS privé, choisissez un **Identifiant** dont l'utilisateur est l'utilisateur git et dont le mot de passe est un jeton d'accès personnel
(ou le mot de passe).

Depuis la 7.3.0, git se connecte via `GIT_ASKPASS` : l'utilisateur et le jeton sont transmis à chaque commande git qui communique avec le serveur, jamais dans
l'URL ; ils ne sont donc pas conservés dans le `.git/config` du clone, et un jeton modifié est utilisé au pull ou au push suivant. Le jeton a besoin
d'un accès en lecture pour le pull, et en écriture pour le push. Un dépôt distant public n'a besoin d'aucun identifiant.

Jusqu'à la 7.2.0, les deux étaient insérés dans l'URL, sous la forme `https://<user>:<token>@git.example.com/team/forms.git`. Un clone créé à cette époque conserve
cette URL jusqu'à son prochain pull ou push, qui rétablit son remote sur l'**URI** propre au dépôt.

### SSH avec la clé générée

Pour un dépôt distant SSH, AnsibleForms s'authentifie avec sa propre paire de clés, qu'il génère au premier démarrage.

1. Ouvrez **Paramètres > Connexions > SSH**, dans son onglet **Clé**, et copiez la **Clé publique**.
2. Ajoutez-la sur le serveur git, comme clé de déploiement du dépôt (avec un accès en écriture si vous faites des push), ou à un utilisateur qui a accès.
3. Ajoutez le dépôt avec une **URI** SSH, par exemple `git@git.example.com:team/forms.git`, et ne choisissez aucun identifiant.

La paire de clés se trouve dans `.ssh/id_rsa` sous [`HOME_PATH`](../customization/paths.html#env_HOME_PATH) : gardez donc ce dossier sur
un stockage persistant, sinon la clé change quand le conteneur est recréé.

Lors du clonage avec une URI `user@host:path`, AnsibleForms exécute d'abord `ssh-keyscan` sur l'hôte et ajoute sa clé aux
hôtes connus. Pour les autres dépôts distants, ajoutez l'hôte dans l'onglet **Hôtes connus** de **Paramètres > Connexions > SSH** avant le
premier clonage.

### Commandes git personnalisées

Les commandes de clonage, de pull et de push peuvent être remplacées, par exemple pour ajouter des options git, avec trois réglages.

| Réglage | Valeur par défaut | Ce qu'AnsibleForms ajoute |
|---|---|---|
| [`GIT_CLONE_COMMAND`](../customization/configuration.html#env_GIT_CLONE_COMMAND) | `git clone` | `-b <branch>`, `--verbose`, l'URI et le nom |
| [`GIT_PULL_COMMAND`](../customization/configuration.html#env_GIT_PULL_COMMAND) | `git pull` | `--verbose` |
| [`GIT_PUSH_COMMAND`](../customization/configuration.html#env_GIT_PUSH_COMMAND) | `git push` | `-u origin HEAD` |

Depuis la 7.3.0, ces commandes s'exécutent sans shell : les guillemets fonctionnent, mais un opérateur de shell comme `;`, `|`, `&&` ou `>` est refusé.
