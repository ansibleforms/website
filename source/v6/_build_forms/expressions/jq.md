---
layout: default
title: jq queries
parent: Expressions
nav_order: 6
---

# jq queries
{: .no_toc }

Reshape data with jq, including the built-in functions
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Run a JSON Query (jq) on an Object

Reshape an object, for example the value of another field, with a jq expression:

```javascript
fn.fnJq($(settings),'.mapping | keys',{name:{ignoreCase:true,direction:'desc'}})

// output : a full json object taken from another field called "settings", converted by jq, and sorted desc on property "name"

// fn.fnJq(object, jq, sort-object)
// - object, for example read from rest or yaml file
// - jq-expression : an optional jq-expression (https://jqplay.org)
// - sort-object : a sorting object to order the results
```

---

## Built-in JQ Functions

All data-fetching functions accept a JSON query (jq), a language to manipulate data objects and arrays.  
When manipulating data, you may need to convert bytes to KB, MB or GB, or to round numbers.  
For this purpose, AnsibleForms includes a few custom jq functions:

- **fn2KB**: Bytes to KB
- **fn2MB**: Bytes to MB
- **fn2GB**: Bytes to GB
- **fnRound0**: Round with 0 decimals
- **fnRound1**: Round with 1 decimal
- **fnRound2**: Round with 2 decimals
- **fnRound**: Round with 2 decimals

```javascript
fn.fnRestBasic('get','https://youruri','','CREDS',
  '[.records[] | {"Available Capacity":.storage_capacity.available | fn2GB | fnRound }]')
// note you need to pipe into the functions
```
