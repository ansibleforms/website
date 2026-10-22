---
layout: default
title: Un utilisateur local
parent: Utilisateurs et groupes
nav_order: 1
translated_from: 9b36582b1f0f8b333a6e9dbb4524eb10723af183
---

# Un utilisateur local
{: .no_toc }

Ajouter un utilisateur local, et les onglets de sa page
{: .fs-6 .fw-300 }

**Ajouter un utilisateur** ouvre un assistant en trois étapes : **Utilisateur** (nom d'utilisateur, description, e-mail), **Mot de passe** et **Groupe**.

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
