---
layout: default
title: Types de runners
parent: Runners
nav_order: 2
translated_from: d15bc7b93c01adc1a74f67135e114eca6b432a27
---

# Types de runners
{: .no_toc }

Les produits que peut être un runner, leur adresse et leur accès
{: .fs-6 .fw-300 }

L'étape **Type** propose un choix par produit, chacun avec une indication ; celle du RTE donne son nom en toutes lettres, *Environnement d'exécution*. AAP et
Ascender sont stockés comme un runner de type `awx` avec une variante (`aap` ou `ascender`), ce qu'utilise aussi le seed de configuration :

| Type | Exemple d'URI | Projet | Authentification |
|---|---|---|---|
| RTE | `https://rte-vmware:8000` | | Le `RTE_TOKEN` du RTE |
| AAP | `https://aap.example.com/api/controller/v2` | | Un jeton d'API, ou un utilisateur et un mot de passe |
| Ascender | `https://ascender.example.com/api/v2` | | Un jeton d'API, ou un utilisateur et un mot de passe |
| AWX | `https://awx.example.com/api/v2` | | Un jeton d'API, ou un utilisateur et un mot de passe |
| Jenkins | `https://jenkins.example.com` | Le dossier qui contient les jobs (facultatif) | Un utilisateur et son jeton d'API |
| Rundeck | `https://rundeck.example.com` | Le nom du projet | Le jeton d'API d'un utilisateur |
| Semaphore | `https://semaphore.example.com` | L'id du projet, le nombre dans `/project/<id>` | Le jeton d'API d'un utilisateur |

Une adresse AWX, AAP ou Ascender porte son chemin d'API : `/api/v2`, ou `/api/controller/v2` pour AAP 2.5 et ultérieur.
Un RTE est l'image AnsibleForms démarrée avec `AF_ROLE=rte` ; la façon d'en exécuter un est décrite dans
[Environnements d'exécution](../rte/).
