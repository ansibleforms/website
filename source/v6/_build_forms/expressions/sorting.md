---
layout: default
title: Sorting
parent: Expressions
nav_order: 5
---

# Sorting
{: .no_toc }

Sort arrays with a sorting object
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Sort an Array

Sort an array from an expression, a REST API or a database with a sorting object:

```javascript
fn.fnSort(['a','b','z','q','c'],{'':{direction:'asc'}})

// output : sorts the flat array

// fn.fnSort(arrayinput,sort-object)
// - array, coming from expression or rest or database
// - sort-object : a sorting object to order the results
```

## The Sorting Object

All data-fetching functions can sort their results with this sorting object.

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
