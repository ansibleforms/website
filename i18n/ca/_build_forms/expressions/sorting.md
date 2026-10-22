---
layout: default
title: Ordenació
parent: Expressions
nav_order: 5
translated_from: 56b0801754aa08a0a6c4941b373bb43d10982b98
---

# Ordenació
{: .no_toc }

Ordena matrius amb un objecte d'ordenació
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Ordenar una matriu

Ordena una matriu que ve d'una expressió, d'una API REST o d'una base de dades amb un objecte d'ordenació:

```javascript
fn.fnSort(['a','b','z','q','c'],{'':{direction:'asc'}})

// output : sorts the flat array

// fn.fnSort(arrayinput,sort-object)
// - array, coming from expression or rest or database
// - sort-object : a sorting object to order the results
```

---

## L'objecte d'ordenació

Les funcions REST (`fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt`, `fn.fnRestJwtSecure`) accepten aquest objecte d'ordenació
com a argument. Per a qualsevol altre resultat, com ara `fn.fnJq` o la lectura d'un fitxer, embolcalla'l amb `fn.fnSort`.

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
