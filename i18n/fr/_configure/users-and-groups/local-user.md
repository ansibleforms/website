---
layout: default
title: Un utilisateur local
parent: Utilisateurs et groupes
nav_order: 1
translated_from: 830382a6160c7dd5632ad0f8d89b7ad520d7ae52
---

# Un utilisateur local
{: .no_toc }

Ajouter un utilisateur local, et les onglets de sa page
{: .fs-6 .fw-300 }

**Ajouter un utilisateur** ouvre l'assistant **Nouveau utilisateur** en quatre étapes :

| Étape | Ce qu'elle demande |
|---|---|
| **Utilisateur** | Le nom d'utilisateur, la description et l'e-mail ; seul le nom d'utilisateur est requis |
| **Mot de passe** | Le mot de passe, saisi deux fois : **Suivant** attend que les deux soient identiques |
| **Groupe** | Le groupe local auquel appartient l'utilisateur, et qui lui donne les rôles du groupe |
| **Rôles** | Les rôles donnés à l'utilisateur lui-même, chacun choisi avec **Ajouter un rôle** ; aucun n'est nécessaire |

L'étape **Rôles** et le mot de passe saisi deux fois sont nouveaux dans la 7.8.0. **Enregistrer**, à la dernière étape, crée l'utilisateur puis lui donne
les rôles choisis : un rôle qui n'a pas pu lui être donné est nommé dans un message, et l'utilisateur est créé malgré tout.

La page d'un utilisateur, `/settings/users/<id>`, a ces onglets :

| Onglet | Ce qu'il montre |
|---|---|
| **Détails** | L'interrupteur **Autoriser la connexion**, le nom d'utilisateur, la description, l'e-mail et, depuis la 7.3.0, la **Dernière connexion** |
| **Groupes** | Les groupes auxquels appartient l'utilisateur |
| **Rôles** | Les rôles qu'a l'utilisateur, et ce qui donne chacun : **Directement**, **Via** un groupe, ou **Tout le monde** |
| **Formulaires** | Les formulaires qu'ouvrent ces rôles |
| **Jobs** | Les jobs lancés par l'utilisateur, le plus récent en premier |
| **Jobs enregistrés** | Les valeurs de formulaire que l'utilisateur a enregistrées pour les relancer |
| **Planifications** | Les jobs que l'utilisateur a planifiés avec Exécuter plus tard |
| **Activité** | Ce que le journal d'audit a enregistré des actions de l'utilisateur |
| **Jetons d'API** | Les jetons d'API de l'utilisateur, avec leur date de création, d'expiration et de dernière utilisation ; **Révoquer** met fin à l'un d'eux immédiatement |

Depuis la 7.3.0, les connexions d'un utilisateur local sont enregistrées, comme l'étaient déjà celles d'un utilisateur LDAP ou SSO : **Dernière connexion** montre la plus récente, et
la liste des utilisateurs a une colonne triable **Dernière connexion** pour chaque origine, si bien qu'un compte que personne n'utilise saute aux yeux. Une connexion refusée n'est pas
enregistrée, et un utilisateur local qui ne s'est pas connecté depuis la mise à jour affiche `–`.

**Changer le mot de passe** et **Supprimer** se trouvent en haut à droite. L'utilisateur `admin` ne peut jamais être supprimé ni renommé.
