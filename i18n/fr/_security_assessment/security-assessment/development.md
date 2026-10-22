---
layout: default
title: Développement sécurisé
nav_order: 3
translated_from: b5b66a3ebecfb686b0cf33ed8724fe96622c7d0f
---

# Développement sécurisé
{: .no_toc }

Comment les modifications sont vérifiées et publiées, et ce qui est pris en charge
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Le code source

AnsibleForms est open source : tout ce qui figure sur cette page peut donc être vérifié dans le dépôt lui-même :

* Le code, son historique et ses pipelines de build sont publics sur [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms).
* La [licence](https://github.com/ansibleforms/ansibleforms/blob/main/LICENSE) est la GPL-3.0.
* Le [journal des modifications](../changelog.html) liste chaque modification de chaque version, correctifs de sécurité compris.

---

## Comment une modification est fusionnée

Chaque modification arrive sur `main` par une pull request, selon un ruleset que personne ne peut contourner :

| Règle | Ce qu'elle signifie |
|---|---|
| Pull request obligatoire | Rien n'est poussé directement sur `main` |
| Vérifications obligatoires | La pull request n'est fusionnée que lorsque toutes les vérifications ci-dessous passent |
| Pas de force push, pas de suppression | L'historique de `main` ne peut être ni réécrit ni supprimé |
| Historique linéaire | Chaque pull request devient un seul commit : chaque modification peut ainsi être tracée et annulée isolément |

Les vérifications qu'une pull request doit passer :

| Vérification | Ce qu'elle fait |
|---|---|
| Client, Server | Les tests unitaires de l'interface web et du serveur |
| CodeQL | L'analyse statique de GitHub sur le code JavaScript et TypeScript, à la recherche d'injections, de cross-site scripting et d'autres faiblesses |
| Public schema is up to date | Le schéma de base de données attendu par le code correspond à celui qu'il livre |
| Title, Branch | La pull request suit les règles de nommage, pour que le journal des modifications reste exact |

Deux autres s'exécutent sur chaque pull request et en rendent compte :

* **Database** teste le serveur sur MySQL et MariaDB, et **Browser** pilote l'interface dans un navigateur.
* **Dependency review** bloque une nouvelle dépendance présentant une vulnérabilité connue de gravité élevée ou critique.

---

## Analyse du code et dépendances

Le code et ce dont il dépend sont de nouveau vérifiés après la fusion :

* **CodeQL** analyse aussi chaque push sur `main` et sur les branches de release, ainsi que toute la base de code chaque semaine :
  une nouvelle règle CodeQL vérifie alors aussi le code fusionné avant elle.
* **Dependabot** ouvre une pull request pour chaque nouvelle version d'une dépendance : les paquets npm du serveur et de
  l'interface, les paquets Python de l'environnement d'exécution et les GitHub Actions des pipelines chaque semaine, et
  les images de base des conteneurs chaque jour.
* Les images de base sont épinglées par digest (`node:26-trixie-slim@sha256:...`) : un build utilise donc exactement l'image relue.
  Dependabot met à jour le digest quand l'image est reconstruite en amont.

---

## Versions et images

Une version est construite et publiée uniquement par GitHub Actions, jamais depuis la machine d'un développeur :

* Une version est créée à partir de `main` (ou de `release/6.x`), avec un journal des modifications construit à partir de ses pull requests.
* Les images sont construites par le [workflow Publish](https://github.com/ansibleforms/ansibleforms/blob/main/.github/workflows/publish.yml)
  et poussées vers le GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, avec les images de l'environnement d'exécution
  à côté. Le workflow et ses journaux sont publics : chacun peut voir ce qui est entré dans une image.
* Les images de l'application et de l'environnement d'exécution s'exécutent avec l'utilisateur non privilégié `node` (uid 1000), jamais en root.

---

## Versions prises en charge

Les correctifs de sécurité sont intégrés à la version la plus récente de chaque branche prise en charge :

| Version | Reçoit des correctifs de sécurité |
|---|---|
| 7.x | Oui |
| 6.5.x | Oui |
| Antérieure à 6.5 | Non : la mise à niveau est le correctif |

Le [guide de mise à niveau](../upgrading/) couvre le passage à une version plus récente, et [Passer à la v7](../upgrade-7.html) celui depuis la 6.5.
