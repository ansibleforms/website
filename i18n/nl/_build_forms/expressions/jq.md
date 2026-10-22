---
layout: default
title: jq-query's
parent: Expressies
nav_order: 6
translated_from: b34dbbec6c5d115f9bb41450962c3fce9606035f
---

# jq-query's
{: .no_toc }

Gegevens omvormen met jq, inclusief de ingebouwde functies
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Een JSON-query (jq) uitvoeren op een object

Vorm een object om, bijvoorbeeld de waarde van een ander veld, met een jq-expressie:

```javascript
fn.fnJq($(settings),'.mapping | keys')

// output : a full json object taken from another field called "settings", converted by jq

// fn.fnJq(object, jq)
// - object, for example read from rest or yaml file
// - jq-expression : a jq-expression (https://jqplay.org)
// - wrap the result in fn.fnSort to order it
```

Vanaf 7.3.0 draait een jq-filter hooguit [`JQ_TIMEOUT_SECONDS`](../customization/security.html#env_JQ_TIMEOUT_SECONDS) (standaard 30)
voordat hij wordt gestopt, en de uitvoer is begrensd op 64 MB. Dit geldt voor `fn.fnJq` en voor de jq-expressie van de functies voor REST, bestanden,
inloggegevens en databasequery's.

---

## Ingebouwde jq-functies

Alle functies die gegevens ophalen, accepteren een JSON-query (jq), een taal om gegevensobjecten en arrays te bewerken.  
Bij het bewerken van gegevens moet je soms bytes omrekenen naar KB, MB of GB, of getallen afronden.  
Daarvoor heeft AnsibleForms een paar eigen jq-functies:

- **fn2KB**: bytes naar KB
- **fn2MB**: bytes naar MB
- **fn2GB**: bytes naar GB
- **fnRound0**: afronden op 0 decimalen
- **fnRound1**: afronden op 1 decimaal
- **fnRound2**: afronden op 2 decimalen
- **fnRound**: afronden op 2 decimalen

```javascript
fn.fnRestBasic('get','https://youruri','','CREDS',
  '[.records[] | {"Available Capacity":.storage_capacity.available | fn2GB | fnRound }]')
// note you need to pipe into the functions
```
