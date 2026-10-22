---
layout: default
title: Tri
parent: Expressions
nav_order: 5
translated_from: 56b0801754aa08a0a6c4941b373bb43d10982b98
---

# Tri
{: .no_toc }

Trier des tableaux avec un objet de tri
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Trier un tableau

Triez un tableau provenant d'une expression, d'une API REST ou d'une base de données avec un objet de tri :

```javascript
fn.fnSort(['a','b','z','q','c'],{'':{direction:'asc'}})

// output : sorts the flat array

// fn.fnSort(arrayinput,sort-object)
// - array, coming from expression or rest or database
// - sort-object : a sorting object to order the results
```

---

## L'objet de tri

Les fonctions REST (`fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt`, `fn.fnRestJwtSecure`) prennent cet objet de tri
en argument. Pour tout autre résultat, comme `fn.fnJq` ou la lecture d'un fichier, enveloppez-le dans `fn.fnSort`.

```javascript
// The sorting object can have multiple forms, for example :

'name' // will sort ascending on property name
['name','email'] // will first sort on name, then on email
{name:{direction:'desc'}} // will sort on name descending
{name:{ignoreCase:true}} // will sort on name ascending, ignoring case
['name',{email:{ignoreCase:true,direction:'asc'}}] // will sort on name first, then on email, ignoring case
{'':{}} // a special case for sorting a flat array which has no headername (properties)
{'':{direction:'desc'}} // sort a flat array descending
```
