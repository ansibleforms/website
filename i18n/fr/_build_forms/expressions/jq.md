---
layout: default
title: Requêtes jq
parent: Expressions
nav_order: 6
translated_from: b34dbbec6c5d115f9bb41450962c3fce9606035f
---

# Requêtes jq
{: .no_toc }

Remodeler des données avec jq, y compris avec les fonctions intégrées
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Exécuter une requête JSON (jq) sur un objet

Remodelez un objet, par exemple la valeur d'un autre champ, avec une expression jq :

```javascript
fn.fnJq($(settings),'.mapping | keys')

// output : a full json object taken from another field called "settings", converted by jq

// fn.fnJq(object, jq)
// - object, for example read from rest or yaml file
// - jq-expression : a jq-expression (https://jqplay.org)
// - wrap the result in fn.fnSort to order it
```

Depuis la 7.3.0, un filtre jq s'exécute au maximum [`JQ_TIMEOUT_SECONDS`](../customization/security.html#env_JQ_TIMEOUT_SECONDS) (30 par défaut)
avant d'être arrêté, et sa sortie est plafonnée à 64 Mo. Cela s'applique à `fn.fnJq` et à l'expression jq des fonctions REST, fichier,
identifiant et requête de base de données.

---

## Fonctions jq intégrées

Toutes les fonctions de récupération de données acceptent une requête JSON (jq), un langage pour manipuler des objets et des tableaux de données.  
En manipulant des données, vous aurez peut-être besoin de convertir des octets en Ko, Mo ou Go, ou d'arrondir des nombres.  
Pour cela, AnsibleForms inclut quelques fonctions jq personnalisées :

- **fn2KB** : octets en Ko
- **fn2MB** : octets en Mo
- **fn2GB** : octets en Go
- **fnRound0** : arrondi à 0 décimale
- **fnRound1** : arrondi à 1 décimale
- **fnRound2** : arrondi à 2 décimales
- **fnRound** : arrondi à 2 décimales

```javascript
fn.fnRestBasic('get','https://youruri','','CREDS',
  '[.records[] | {"Available Capacity":.storage_capacity.available | fn2GB | fnRound }]')
// note you need to pipe into the functions
```
