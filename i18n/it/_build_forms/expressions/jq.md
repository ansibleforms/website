---
layout: default
title: Query jq
parent: Espressioni
nav_order: 6
translated_from: b34dbbec6c5d115f9bb41450962c3fce9606035f
---

# Query jq
{: .no_toc }

Rimodellare i dati con jq, comprese le funzioni integrate
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Eseguire una JSON Query (jq) su un oggetto

Rimodella un oggetto, per esempio il valore di un altro campo, con un'espressione jq:

```javascript
fn.fnJq($(settings),'.mapping | keys')

// output : a full json object taken from another field called "settings", converted by jq

// fn.fnJq(object, jq)
// - object, for example read from rest or yaml file
// - jq-expression : a jq-expression (https://jqplay.org)
// - wrap the result in fn.fnSort to order it
```

Dalla 7.3.0 un filtro jq gira al massimo per [`JQ_TIMEOUT_SECONDS`](../customization/security.html#env_JQ_TIMEOUT_SECONDS) (30 per impostazione predefinita)
prima di essere fermato, e il suo output è limitato a 64 MB. Questo vale per `fn.fnJq` e per l'espressione jq delle funzioni di query REST, su file,
su credenziali e su database.

---

## Funzioni jq integrate

Tutte le funzioni che recuperano dati accettano una JSON query (jq), un linguaggio per manipolare oggetti e array di dati.  
Quando manipoli i dati, potresti dover convertire i byte in KB, MB o GB, o arrotondare i numeri.  
Per questo AnsibleForms include alcune funzioni jq personalizzate:

- **fn2KB**: da byte a KB
- **fn2MB**: da byte a MB
- **fn2GB**: da byte a GB
- **fnRound0**: arrotonda a 0 decimali
- **fnRound1**: arrotonda a 1 decimale
- **fnRound2**: arrotonda a 2 decimali
- **fnRound**: arrotonda a 2 decimali

```javascript
fn.fnRestBasic('get','https://youruri','','CREDS',
  '[.records[] | {"Available Capacity":.storage_capacity.available | fn2GB | fnRound }]')
// note you need to pipe into the functions
```
