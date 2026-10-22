---
layout: default
title: Sortowanie
parent: Wyrażenia
nav_order: 5
translated_from: 56b0801754aa08a0a6c4941b373bb43d10982b98
---

# Sortowanie
{: .no_toc }

Sortowanie tablic obiektem sortowania
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Sortowanie tablicy

Posortuj tablicę z wyrażenia, REST API lub bazy danych za pomocą obiektu sortowania:

```javascript
fn.fnSort(['a','b','z','q','c'],{'':{direction:'asc'}})

// output : sorts the flat array

// fn.fnSort(arrayinput,sort-object)
// - array, coming from expression or rest or database
// - sort-object : a sorting object to order the results
```

---

## Obiekt sortowania

Funkcje REST (`fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt`, `fn.fnRestJwtSecure`) przyjmują ten obiekt sortowania
jako argument. Każdy inny wynik, na przykład z `fn.fnJq` lub odczytu pliku, opakuj w `fn.fnSort`.

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
