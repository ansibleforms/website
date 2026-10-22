---
layout: default
title: Consultes jq
parent: Expressions
nav_order: 6
translated_from: b34dbbec6c5d115f9bb41450962c3fce9606035f
---

# Consultes jq
{: .no_toc }

Transforma dades amb jq, incloses les funcions integrades
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Executar una consulta JSON (jq) sobre un objecte

Transforma un objecte, per exemple el valor d'un altre camp, amb una expressió jq:

```javascript
fn.fnJq($(settings),'.mapping | keys')

// output : a full json object taken from another field called "settings", converted by jq

// fn.fnJq(object, jq)
// - object, for example read from rest or yaml file
// - jq-expression : a jq-expression (https://jqplay.org)
// - wrap the result in fn.fnSort to order it
```

A partir de la 7.3.0, un filtre jq s'executa com a màxim [`JQ_TIMEOUT_SECONDS`](../customization/security.html#env_JQ_TIMEOUT_SECONDS) (30 per defecte)
abans d'aturar-se, i la seva sortida es limita a 64 MB. Això s'aplica a `fn.fnJq` i a l'expressió jq de les funcions de REST, de fitxer,
de credencial i de consulta a base de dades.

---

## Funcions JQ integrades

Totes les funcions que obtenen dades accepten una consulta JSON (jq), un llenguatge per manipular objectes i matrius de dades.  
Quan manipules dades, potser necessites convertir bytes a KB, MB o GB, o arrodonir nombres.  
Per a això, AnsibleForms inclou unes quantes funcions jq pròpies:

- **fn2KB**: de bytes a KB
- **fn2MB**: de bytes a MB
- **fn2GB**: de bytes a GB
- **fnRound0**: arrodoneix amb 0 decimals
- **fnRound1**: arrodoneix amb 1 decimal
- **fnRound2**: arrodoneix amb 2 decimals
- **fnRound**: arrodoneix amb 2 decimals

```javascript
fn.fnRestBasic('get','https://youruri','','CREDS',
  '[.records[] | {"Available Capacity":.storage_capacity.available | fn2GB | fnRound }]')
// note you need to pipe into the functions
```
