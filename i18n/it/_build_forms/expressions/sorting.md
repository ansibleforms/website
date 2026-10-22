---
layout: default
title: Ordinamento
parent: Espressioni
nav_order: 5
translated_from: 56b0801754aa08a0a6c4941b373bb43d10982b98
---

# Ordinamento
{: .no_toc }

Ordinare array con un oggetto di ordinamento
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Ordinare un array

Ordina un array proveniente da un'espressione, da un'API REST o da un database con un oggetto di ordinamento:

```javascript
fn.fnSort(['a','b','z','q','c'],{'':{direction:'asc'}})

// output : sorts the flat array

// fn.fnSort(arrayinput,sort-object)
// - array, coming from expression or rest or database
// - sort-object : a sorting object to order the results
```

---

## L'oggetto di ordinamento

Le funzioni REST (`fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt`, `fn.fnRestJwtSecure`) accettano questo oggetto di ordinamento
come argomento. Per qualsiasi altro risultato, come `fn.fnJq` o la lettura di un file, racchiudilo in `fn.fnSort`.

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
