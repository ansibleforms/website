---
layout: default
title: Log et enforce
parent: Validation au lancement
nav_order: 2
translated_from: 10a187b350155ce68bfc50e379e1b6b8637df57a
---

# Log et enforce
{: .no_toc }

Ce que fait chaque mode d'un lancement qui enfreint les règles
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Ce que fait `log`

Chaque lancement est vérifié, mais rien ne change pour l'utilisateur. Un avertissement est écrit dans le journal quand :

- le lancement **serait refusé**, avec la raison (noms de champ et types de règle uniquement, jamais
  les valeurs) :

  ```
  Launch validation would refuse form 'Create VM' for alice (launch validation 'log') :
  failing rules : hostname (regex) ; failing rows : disks[1].size (maxValue)
  ```

- les extravars envoyées par le client **diffèrent** de celles que construit le serveur, avec les
  clés de premier niveau qui diffèrent :

  ```
  Launch of form 'Create VM' : the extravars differ from the ones the server builds for
  created_at, vm (launch validation 'log' ; 'enforce' would run the server's)
  ```

Faites d'abord tourner `log` un moment sur une instance réelle. Il montre quels formulaires seraient refusés et
lesquels calculent des valeurs différemment sur le serveur, avant que quiconque soit affecté.

---

## Ce que fait `enforce`

Avec `enforce`, un lancement invalide est refusé, et un lancement valide s'exécute avec les extravars que construit
le serveur.

### Un lancement qui enfreint les règles est refusé

`POST /api/v2/job` répond `422` avec les champs en échec :

```json
{
  "error": "The form data is not valid",
  "details": {
    "missing": ["owner"],
    "invalid": ["hostname", "disks"],
    "waiting": [],
    "validationErrors": {
      "hostname": [{ "type": "regex", "description": "Must start with prod-" }]
    },
    "rowErrors": {
      "disks": [{ "index": 1, "invalid": ["size"],
                  "validationErrors": { "size": [{ "type": "maxValue", "description": "size must be at most 500" }] } }]
    }
  }
}
```

- `missing` : les champs obligatoires sans valeur ;
- `invalid` : les champs qui enfreignent une règle, les choix qui ne font pas partie des options, et les champs list
  avec une ligne en échec ;
- `waiting` : les champs qui n'ont pas pu être évalués (un champ dont ils ont besoin n'a jamais reçu de valeur) ;
- `validationErrors` : par champ, chaque règle en échec avec le message qu'affiche le navigateur ;
- `rowErrors` : par champ list, les lignes en échec (voir [Lignes de liste](list-rows-and-subforms.html)) ;
- `uploads` : les champs fichier dont l'envoi n'a pas pu être vérifié.

Un lancement **sans `rawFormData`** est refusé lui aussi : ses valeurs ne peuvent pas être vérifiées.

### Un lancement valide s'exécute avec les extravars du serveur

Le job ne s'exécute pas avec les extravars envoyées par le client. Le serveur les construit à partir des valeurs
vérifiées, avec le même code que le navigateur, et exécute celles-ci. Un appelant qui envoie un `rawFormData` valide
à côté d'`extravars` différentes obtient les extravars qui correspondent aux valeurs, et non
celles qu'il a envoyées.

De la requête, le serveur conserve `__verbose__` (uniquement pour les utilisateurs autorisés à utiliser le mode verbeux). Les
clés réservées (`__playbook__`, `__inventory__`, ...) proviennent du formulaire, comme toujours, et
`ansibleforms_user` est l'utilisateur qui lance.

### Ce que l'utilisateur a vu n'est pas toujours ce qui s'exécute

Construire les extravars signifie évaluer de nouveau le formulaire : chaque expression et chaque requête s'exécute
une fois de plus sur le serveur, un instant après le navigateur, en tant qu'utilisateur qui lance. Une valeur
qui dépend du **moment** ou de l'**endroit** où elle est évaluée peut différer, et dans ce cas c'est la
valeur du serveur qui est utilisée :

| Quoi | Pourquoi cela peut différer | Dans quelle mesure |
|---|---|---|
| `fn.fnTime()`, un horodatage, un nom construit à partir de l'heure | évalué de nouveau, quelques secondes plus tard | ne compte qu'à la limite d'une seconde ou d'une date. `fnTime` s'exécute déjà sur le serveur dans le flux du navigateur aussi, avec le même fuseau horaire (le `TZ` du conteneur) |
| une requête, `fnRestAdvanced`, `fnSsh`, `fnDnsResolve`, la lecture d'un fichier | les données externes ont changé entre-temps | seulement quand elles ont changé |
| une expression `runLocal` qui utilise `new Date()`, `toLocaleString`, `Intl` | le navigateur utilise le fuseau horaire et la langue de l'utilisateur, le serveur les siens | seulement ces expressions |

Il en va de même pour la **validation** : une règle qui lit un tel champ (`notIn` sur le résultat d'une requête,
`validIf` sur un indicateur calculé) est vérifiée avec la valeur du serveur. Les formulaires dont les
extravars diffèrent apparaissent dans les avertissements `log` décrits ci-dessus ; examinez-les avant de passer en enforce.
