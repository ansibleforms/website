---
layout: default
title: Un groupe local
parent: Utilisateurs et groupes
nav_order: 3
translated_from: 41f71dbf24df7e6a6f6a619a7d5147f28e80d466
---

# Un groupe local
{: .no_toc }

La page d'un groupe local et ses onglets
{: .fs-6 .fw-300 }

Depuis la 7.8.0, **Ajouter un groupe** ouvre l'assistant **Nouveau groupe** en trois étapes : **Détails** (le nom et la description), **Utilisateurs**
(les utilisateurs locaux à mettre dans le groupe) et **Rôles** (les rôles à lui donner, pour que ses utilisateurs les aient). Seul le nom est requis.
**Enregistrer**, à la dernière étape, crée le groupe, puis ajoute les utilisateurs et donne les rôles : celui qui échoue est nommé dans un message, et le groupe reste.

La page d'un groupe, `/settings/groups/<id>`, a ces onglets :

| Onglet | Ce qu'il montre |
|---|---|
| **Détails** | Le nom et la description |
| **Utilisateurs** | Les utilisateurs du groupe ; **Ajouter un utilisateur** en ajoute un, le menu d'une ligne ou les cases à cocher en retirent un |
| **Rôles** | Les rôles qui nomment le groupe |
| **Formulaires** | Les formulaires qu'ouvrent ces rôles |

Un groupe qui a des utilisateurs ne peut pas être supprimé : retirez d'abord ses utilisateurs. Le groupe `admins` ne peut jamais être supprimé ni renommé.
