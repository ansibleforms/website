---
layout: default
title: Consultas jq
parent: Expresiones
nav_order: 6
translated_from: b34dbbec6c5d115f9bb41450962c3fce9606035f
---

# Consultas jq
{: .no_toc }

Transforma datos con jq, incluidas las funciones integradas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Ejecutar una consulta JSON (jq) sobre un objeto

Transforma un objeto, por ejemplo el valor de otro campo, con una expresión jq:

```javascript
fn.fnJq($(settings),'.mapping | keys')

// output : a full json object taken from another field called "settings", converted by jq

// fn.fnJq(object, jq)
// - object, for example read from rest or yaml file
// - jq-expression : a jq-expression (https://jqplay.org)
// - wrap the result in fn.fnSort to order it
```

Desde 7.3.0, un filtro jq se ejecuta como máximo [`JQ_TIMEOUT_SECONDS`](../customization/security.html#env_JQ_TIMEOUT_SECONDS) (30 por defecto)
antes de detenerse, y su salida se limita a 64 MB. Esto se aplica a `fn.fnJq` y a la expresión jq de las funciones de REST, archivo,
credencial y consulta a base de datos.

---

## Funciones jq integradas

Todas las funciones que obtienen datos aceptan una consulta JSON (jq), un lenguaje para manipular objetos y arrays de datos.  
Al manipular datos, puede que necesites convertir bytes a KB, MB o GB, o redondear números.  
Para ello, AnsibleForms incluye algunas funciones jq propias:

- **fn2KB**: bytes a KB
- **fn2MB**: bytes a MB
- **fn2GB**: bytes a GB
- **fnRound0**: redondea con 0 decimales
- **fnRound1**: redondea con 1 decimal
- **fnRound2**: redondea con 2 decimales
- **fnRound**: redondea con 2 decimales

```javascript
fn.fnRestBasic('get','https://youruri','','CREDS',
  '[.records[] | {"Available Capacity":.storage_capacity.available | fn2GB | fnRound }]')
// note you need to pipe into the functions
```
