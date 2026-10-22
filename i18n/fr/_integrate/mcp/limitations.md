---
layout: default
title: Limitations
parent: Serveur MCP
nav_order: 3
translated_from: 619aa0f8cd31ac0038d76dd8e6f75a0a9dffe089
---

# Limitations
{: .no_toc }

Les expressions exécutées sur le serveur, et ce que le serveur MCP ne fait pas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Expressions runLocal

Les expressions `runLocal`, les champs `local` / `credential` / `html` et les valeurs par défaut `evalDefault` sont
évalués sur le serveur, dans un contexte V8 séparé : pas de `process`, de `require`, de réseau ni de
timers, pas de compilation de chaînes en code, une limite de temps de 2 secondes, et seulement les fonctions
utilitaires que propose le navigateur (`fnArray`, `fnGetNumberedName`, `fnToTable`, ...).

Cela protège contre les expressions boguées ou qui s'emballent. Ce n'est pas un bac à sable pour du code hostile,
et cela n'a pas besoin de l'être : le code vient de la définition du formulaire, jamais de l'appelant
MCP, et chaque valeur qu'envoie un appelant est substituée comme littéral JavaScript.

Une expression qui utilise une API du navigateur (`window`, `document`, `fetch`) ne peut pas s'exécuter ici et
renvoie `status: error`.

Les expressions côté serveur (sans `runLocal`) passent par les mêmes règles
[`EXPRESSION_SANITIZER`](../customization) que pour le navigateur.

---

## Limitations

Certains formulaires et champs ne peuvent pas encore être utilisés via le serveur MCP :

- **Les formulaires assistant (wizard)** ne peuvent pas encore être lancés. Leurs étapes peuvent être résolues avec `subform`.
- **Les champs fichier** ne peuvent pas être remplis ; un formulaire dont le champ fichier a une valeur est refusé.
- **Les lignes de liste** (et un champ `yaml` avec un sous-formulaire, qui est une telle ligne) : chaque ligne que vous
  envoyez, sauf une ligne portant le `deleteMarker` de la liste, est résolue via son sous-formulaire avec
  les valeurs du formulaire comme `__parent__`, puis validée. Cela inclut les listes imbriquées, où
  `__parent__.__parent__` atteint le formulaire. Envoyez des lignes simples, c'est-à-dire les valeurs brutes des champs
  du sous-formulaire. Les lignes en échec sont listées par champ de liste dans `rowErrors`
  (`vms[1].disks[0].size (missing)` dans le message). Au plus 500 lignes sont acceptées par appel,
  tous niveaux confondus.
- Un enum laissé sur `__auto__` n'est jamais rempli avec sa première option ; l'appelant doit choisir.
- Chaque requête MCP crée une entrée dans le journal d'audit (action « Requête MCP (agent IA) ») ; le
  job lui-même est enregistré au nom de l'utilisateur, comme pour tout autre lancement.
