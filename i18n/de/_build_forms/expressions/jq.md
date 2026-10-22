---
layout: default
title: jq-Abfragen
parent: Ausdrücke
nav_order: 6
translated_from: b34dbbec6c5d115f9bb41450962c3fce9606035f
---

# jq-Abfragen
{: .no_toc }

Daten mit jq umformen, einschließlich der integrierten Funktionen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Eine JSON-Abfrage (jq) auf einem Objekt ausführen

Formen Sie ein Objekt, etwa den Wert eines anderen Felds, mit einem jq-Ausdruck um:

```javascript
fn.fnJq($(settings),'.mapping | keys')

// output : a full json object taken from another field called "settings", converted by jq

// fn.fnJq(object, jq)
// - object, for example read from rest or yaml file
// - jq-expression : a jq-expression (https://jqplay.org)
// - wrap the result in fn.fnSort to order it
```

Ab 7.3.0 läuft ein jq-Filter höchstens [`JQ_TIMEOUT_SECONDS`](../customization/security.html#env_JQ_TIMEOUT_SECONDS) (standardmäßig 30),
bevor er gestoppt wird, und seine Ausgabe ist auf 64 MB begrenzt. Das gilt für `fn.fnJq` und für den jq-Ausdruck der Funktionen für REST, Dateien,
Anmeldedaten und Datenbankabfragen.

---

## Integrierte jq-Funktionen

Alle Funktionen, die Daten abrufen, akzeptieren eine JSON-Abfrage (jq), eine Sprache zum Bearbeiten von Datenobjekten und Arrays.  
Beim Bearbeiten von Daten müssen Sie eventuell Bytes in KB, MB oder GB umrechnen oder Zahlen runden.  
Dafür bringt AnsibleForms einige eigene jq-Funktionen mit:

- **fn2KB**: Bytes in KB
- **fn2MB**: Bytes in MB
- **fn2GB**: Bytes in GB
- **fnRound0**: auf 0 Dezimalstellen runden
- **fnRound1**: auf 1 Dezimalstelle runden
- **fnRound2**: auf 2 Dezimalstellen runden
- **fnRound**: auf 2 Dezimalstellen runden

```javascript
fn.fnRestBasic('get','https://youruri','','CREDS',
  '[.records[] | {"Available Capacity":.storage_capacity.available | fn2GB | fnRound }]')
// note you need to pipe into the functions
```
