---
layout: default
title: "La page d'une base de données"
parent: Bases de données
nav_order: 2
translated_from: b027ce5ca33397772148bb221bd9eaab4984f276
---

# La page d'une base de données
{: .no_toc }

Ses onglets, les formulaires qui l'interrogent, le test et la suppression
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Onglets

La page d'une base de données affiche les étapes de sa boîte de dialogue sous forme d'onglets, plus les formulaires qui l'interrogent :

| Onglet | Ce qu'il contient |
|---|---|
| Détails | Le **Nom**, celui que donne le `dbConfig` d'un champ, et la **Description** |
| Identifiants | L'**Identifiant** avec lequel elle se connecte, un identifiant de Connexions > Identifiants de type **Base de données**, qui contient son type de base, son hôte, son port, sa base, TLS et son accès |
| Utilisé par | Les formulaires qui l'interrogent, avec leur nombre sur l'onglet, voir [Utilisé par](#used-by) |

Chaque onglet a sa propre adresse, comme `/settings/databases/<id>/used-by`, si bien qu'un lien ou un favori l'ouvre. La recherche de la
ligne de titre filtre tous les onglets à la fois.

Dans l'onglet **Identifiants**, **Ajouter un identifiant** crée un nouvel identifiant de type **Base de données** et le choisit. Un mot de passe
n'est plus jamais affiché une fois enregistré : modifiez-le sur l'identifiant.

---

## Utilisé par

L'onglet **Utilisé par** liste les formulaires dont des champs interrogent la base de données, tels que l'application les lit dans les formulaires.

| Colonne | Ce qu'elle affiche |
|---|---|
| Formulaire | Le formulaire ; une ligne l'ouvre |
| Description | La description du formulaire |
| Champ | Les champs de ce formulaire dont le `dbConfig` nomme la base de données |

Un champ compte quand son `dbConfig` nomme la base de données, ou nomme son identifiant, comme le fait un formulaire écrit avant la 7.5.0.
Les deux se connectent avec le même identifiant, donc les deux sont listés. Quand il n'y en a aucun, l'onglet indique **Aucun formulaire n'interroge cette base de données.**

---

## Tester la connexion et Supprimer

Les boutons en haut à droite agissent sur la base de données telle qu'elle est enregistrée.

**Tester la connexion** se connecte avec son identifiant et exécute la requête minimale de son type de base de données, puis le dit dans un message,
**Connexion &lt;name&gt; OK**, ou la raison de l'échec. C'est le même test que le **Tester la connexion** de l'identifiant lui-même.

**Supprimer** demande d'abord, puis supprime la base de données et revient à la liste. Son identifiant reste dans **Connexions > Identifiants**.
À côté, **Enregistrer** enregistre les onglets Détails et Identifiants.
