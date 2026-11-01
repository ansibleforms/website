---
layout: default
title: La page des bases de données
parent: Bases de données
nav_order: 1
translated_from: 66ffec0a34395642b0208e81078dbc725bdc7123
---

# La page des bases de données
{: .no_toc }

La liste des bases de données, ses colonnes, et l'ajout d'une base
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La liste

La page **Connexions > Bases de données** liste chaque base de données avec ces colonnes :

| Colonne | Signification |
|---|---|
| Nom | Comment les formulaires y font référence, avec `dbConfig: <name>` |
| Description | À quoi elle sert |
| Type de base de données | Celui de son identifiant : MySQL, MSSQL, PostgreSQL, Oracle ou MongoDB |
| Base de données | La base que son identifiant ouvre |

**Colonnes** en ajoute deux autres, masquées par défaut : **Hôte**, où son identifiant se connecte, avec son port quand il en a un, et **Utilisé par**,
le nombre de formulaires qui l'interrogent, par son nom ou par celui de son identifiant (voir [Utilisé par](database-page.html#used-by)).

Le type de base de données, la base et l'hôte sont lus depuis l'identifiant : modifiez-les sur l'identifiant, dans
**Connexions > Identifiants**. Aucune colonne n'affiche un utilisateur ni un mot de passe.

---

## Ajouter une base de données

**Ajouter une base de données** ouvre une boîte de dialogue en deux étapes, comme celle d'un runner.

| Étape | Champs |
|---|---|
| Base de données | **Nom** et **Description**. Le nom est obligatoire et unique |
| Identifiants | **Identifiant**, obligatoire : un identifiant de type **Base de données**. Seuls ceux-là sont proposés |

À l'étape **Identifiants**, **Ajouter un identifiant** ouvre la boîte de dialogue d'un nouvel identifiant de type **Base de données** (voir
[La page des identifiants](../credentials/list.html)) et le choisit une fois enregistré, si bien qu'une base de données et son accès s'ajoutent en une fois.

---

## Le menu de la ligne

Une ligne ouvre la page propre de la base de données, et son menu propose :

| Action | Ce qu'elle fait |
|---|---|
| Modifier | Ouvre sa page |
| Tester la connexion | Se connecte avec son identifiant, exécute la requête minimale de son type de base de données, et dit si cela a fonctionné |
| Supprimer | Supprime la base de données, après confirmation. Son identifiant reste |

Supprimer une base de données que des formulaires nomment encore fait échouer leurs requêtes, sauf s'il reste un identifiant du même nom
vers lequel se replier (voir [Les bases de données dans les formulaires](in-forms.html)). Vérifiez d'abord son onglet **Utilisé par**.
