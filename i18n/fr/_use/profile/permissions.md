---
layout: default
title: Autorisations
parent: Votre profil
nav_order: 4
translated_from: 08770187a1159539d1d450cf7dddf80c6943cfed
---

# Autorisations
{: .no_toc }

Ce que vos rôles vous permettent de faire
{: .fs-6 .fw-300 }

---

Les options de rôle sont regroupées en onglets, chacun avec le nombre de ses options dont vous disposez, comme `5/8` :

| Onglet | Options concernant |
|---|---|
| **Accès et intégrations** | La connexion, l'assistant de chat, le serveur MCP, les envois de fichiers et les jetons d'API |
| **Concepteur** | L'ouverture du concepteur, et la modification des formulaires, playbooks, workflows, inventaires et fichiers de variables |
| **Jobs** | La consultation des jobs et de leurs extravars ou artefacts, la relance, la suppression, la planification et l'enregistrement de jobs |
| **Paramètres** | Les pages de paramètres, les journaux, le journal d'audit et les sauvegardes |
| **Autres** | Une option définie à la main dans un rôle et qui ne figure dans aucun autre onglet ; toujours le dernier onglet |

Les autres onglets sont classés par ordre alphabétique. Chaque onglet est un tableau avec les colonnes **Paramètre** (l'option), **Description**
(ce qu'elle fait) et **Votre accès** : **Autorisé** ou **Non autorisé**. Une option qui s'applique à cause d'une autre l'indique
sous sa description : **Inclus dans** une option dont vous disposez l'active, et **Nécessite** une option qui vous manque la laisse désactivée.

Les options proviennent des `options` de vos rôles dans `config.yaml` ; la page [Rôles](../config/roles.html) explique comment
elles se combinent.
