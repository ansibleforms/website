---
layout: default
title: Expressions
nav_order: 1
has_children: true
has_toc: false
permalink: /expressions/
translated_from: 52d74e32540fba4dfa5078c8976147b39a2ad2cf
---

# Expressions
{: .no_toc }

Calculer les valeurs des champs en JavaScript, dans le navigateur ou sur le serveur
{: .fs-6 .fw-300 }

---

Pour les auteurs de formulaires : remplissez des champs dynamiquement en JavaScript, calculés dans le navigateur ou récupérés sur le serveur.

L'attribut `expression` d'un champ de formulaire vous permet de créer des formulaires dynamiques avec des expressions JavaScript.

---

## Introduction

L'attribut `expression` est disponible sur plusieurs types de champ :
- champ `enum` : pour remplir dynamiquement les options d'une liste déroulante
- champ `expression` : pour récupérer ou générer n'importe quel type de données
- champ `html` : pour construire son contenu HTML
- champs `yaml` et `list` : pour remplir leurs données

Les expressions JavaScript sont évaluées soit **côté serveur** (par défaut), soit **côté client**, selon la propriété `runLocal` du champ.
Un champ `html`, ainsi que les types de champ `local`, `local_out` et `credential`, exécutent toujours leur expression dans le navigateur, quelle que soit
la valeur de `runLocal`.

- **Côté serveur** (`runLocal: false`, la valeur par défaut) : des fonctions prédéfinies qui récupèrent des données depuis des API, des fichiers et des bases de données.
- **Côté client** (`runLocal: true`) : le code exploite tout le moteur JavaScript dans le bac à sable du navigateur pour les calculs, transformations et manipulations.

---

## Questions de sécurité

Comme les expressions sont évaluées avec la fonction JavaScript `eval`, l'injection de code est un risque potentiel :

- **Les expressions côté serveur** passent d'abord par un filtre : chaque appel doit être une fonction `fn.` ou `fnc.`, et les lignes multiples,
  `;`, les template literals, `process.env` et les moyens de sortir d'`eval` (`import`, `require`, `constructor`, ...) sont refusés.
- **Les expressions côté client** sont évaluées dans le bac à sable du navigateur et peuvent être considérées comme sûres.

La sévérité du filtre dépend de
[`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) :

| Valeur | Expressions côté serveur |
|---|---|
| `strict` (par défaut) | appels `fn.` et `fnc.`, et méthodes sur leur résultat, comme `fn.fnTime().format('YYYY')` |
| `paranoid` | uniquement des appels directs `fn.` et `fnc.`, sans méthode sur leur résultat |
| `off` | toute expression côté serveur est refusée ; seules les expressions `runLocal` fonctionnent |
| `legacy` | les règles de la 6.2.1, qui permettaient à tout utilisateur authentifié d'exécuter du code sur le serveur ; uniquement pour une mise à niveau, et uniquement dans l'environnement réel (pas depuis la page des paramètres) |

Une valeur vide ou inconnue équivaut à `strict`. Un changement s'applique à l'expression suivante, sans redémarrage.

---

## Dans cette section

Chaque sujet a sa propre page :

| Page | Contenu |
|---|---|
| [Espaces réservés](placeholders.html) | Faire référence à un autre champ, une constante ou l'utilisateur avec `$(...)` |
| [Expressions locales](local.html) | Du JavaScript exécuté dans le bac à sable du navigateur |
| [Expressions distantes](remote.html) | Fonctions côté serveur pour les dates, réseaux, fichiers, SSH et noms numérotés |
| [API REST](rest-apis.html) | Appeler des API REST avec une authentification basique, par jeton ou personnalisée |
| [Identifiants](credentials.html) | Lire un identifiant enregistré |
| [Tri](sorting.html) | Trier des tableaux avec un objet de tri |
| [Requêtes jq](jq.html) | Remodeler des données avec jq |
