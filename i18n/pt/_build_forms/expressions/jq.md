---
layout: default
title: Consultas jq
parent: Expressões
nav_order: 6
translated_from: b34dbbec6c5d115f9bb41450962c3fce9606035f
---

# Consultas jq
{: .no_toc }

Remodelar dados com jq, incluindo as funções incorporadas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Executar uma consulta JSON (jq) sobre um objeto

Remodele um objeto, por exemplo o valor de outro campo, com uma expressão jq:

```javascript
fn.fnJq($(settings),'.mapping | keys')

// output : a full json object taken from another field called "settings", converted by jq

// fn.fnJq(object, jq)
// - object, for example read from rest or yaml file
// - jq-expression : a jq-expression (https://jqplay.org)
// - wrap the result in fn.fnSort to order it
```

A partir da 7.3.0, um filtro jq é executado no máximo durante [`JQ_TIMEOUT_SECONDS`](../customization/security.html#env_JQ_TIMEOUT_SECONDS) (30 por predefinição)
antes de ser parado, e o seu resultado está limitado a 64 MB. Isto aplica-se a `fn.fnJq` e à expressão jq das funções de REST, ficheiro,
credencial e consulta à base de dados.

---

## Funções jq incorporadas

Todas as funções que obtêm dados aceitam uma consulta JSON (jq), uma linguagem para manipular objetos e arrays de dados.  
Ao manipular dados, pode ser necessário converter bytes em KB, MB ou GB, ou arredondar números.  
Para isso, o AnsibleForms inclui algumas funções jq personalizadas:

- **fn2KB**: Bytes para KB
- **fn2MB**: Bytes para MB
- **fn2GB**: Bytes para GB
- **fnRound0**: Arredondar com 0 casas decimais
- **fnRound1**: Arredondar com 1 casa decimal
- **fnRound2**: Arredondar com 2 casas decimais
- **fnRound**: Arredondar com 2 casas decimais

```javascript
fn.fnRestBasic('get','https://youruri','','CREDS',
  '[.records[] | {"Available Capacity":.storage_capacity.available | fn2GB | fnRound }]')
// note you need to pipe into the functions
```
