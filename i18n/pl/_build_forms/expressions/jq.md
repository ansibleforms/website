---
layout: default
title: Zapytania jq
parent: Wyrażenia
nav_order: 6
translated_from: b34dbbec6c5d115f9bb41450962c3fce9606035f
---

# Zapytania jq
{: .no_toc }

Przekształcanie danych za pomocą jq, łącznie z funkcjami wbudowanymi
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Uruchomienie zapytania JSON (jq) na obiekcie

Przekształć obiekt, na przykład wartość innego pola, wyrażeniem jq:

```javascript
fn.fnJq($(settings),'.mapping | keys')

// output : a full json object taken from another field called "settings", converted by jq

// fn.fnJq(object, jq)
// - object, for example read from rest or yaml file
// - jq-expression : a jq-expression (https://jqplay.org)
// - wrap the result in fn.fnSort to order it
```

Od wersji 7.3.0 filtr jq działa najwyżej [`JQ_TIMEOUT_SECONDS`](../customization/security.html#env_JQ_TIMEOUT_SECONDS) (domyślnie 30)
zanim zostanie zatrzymany, a jego wynik jest ograniczony do 64 MB. Dotyczy to `fn.fnJq` oraz wyrażenia jq w funkcjach REST, plików,
poświadczeń i zapytań do bazy danych.

---

## Wbudowane funkcje JQ

Wszystkie funkcje pobierające dane przyjmują zapytanie JSON (jq), czyli język do operacji na obiektach i tablicach danych.  
Przy przetwarzaniu danych może być potrzebna zamiana bajtów na KB, MB lub GB albo zaokrąglanie liczb.  
Do tego celu AnsibleForms zawiera kilka własnych funkcji jq:

- **fn2KB**: bajty na KB
- **fn2MB**: bajty na MB
- **fn2GB**: bajty na GB
- **fnRound0**: zaokrąglenie do 0 miejsc po przecinku
- **fnRound1**: zaokrąglenie do 1 miejsca po przecinku
- **fnRound2**: zaokrąglenie do 2 miejsc po przecinku
- **fnRound**: zaokrąglenie do 2 miejsc po przecinku

```javascript
fn.fnRestBasic('get','https://youruri','','CREDS',
  '[.records[] | {"Available Capacity":.storage_capacity.available | fn2GB | fnRound }]')
// note you need to pipe into the functions
```
