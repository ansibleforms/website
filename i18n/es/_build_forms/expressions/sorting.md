---
layout: default
title: Ordenación
parent: Expresiones
nav_order: 5
translated_from: 56b0801754aa08a0a6c4941b373bb43d10982b98
---

# Ordenación
{: .no_toc }

Ordena arrays con un objeto de ordenación
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Ordenar un array

Ordena un array procedente de una expresión, una API REST o una base de datos con un objeto de ordenación:

```javascript
fn.fnSort(['a','b','z','q','c'],{'':{direction:'asc'}})

// output : sorts the flat array

// fn.fnSort(arrayinput,sort-object)
// - array, coming from expression or rest or database
// - sort-object : a sorting object to order the results
```

---

## El objeto de ordenación

Las funciones REST (`fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt`, `fn.fnRestJwtSecure`) aceptan este objeto de ordenación
como argumento. Para cualquier otro resultado, como `fn.fnJq` o la lectura de un archivo, envuélvelo en `fn.fnSort`.

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
