---
layout: default
title: Password
parent: Validazione all'avvio
nav_order: 5
translated_from: 2fc2d2e8cdd997efaf221bd8e0114df2a4ee873e
---

# Password
{: .no_toc }

Come vengono validati, salvati e tenuti fuori dalle API i campi password
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un campo password viene validato come qualsiasi altro campo. Il suo valore, però, resta sul server e non viene mai restituito
a un client.

---

## Dove viene conservata una password

Il server salva la password con il job, nelle sue extravars:

* Un'**approvazione** può così proseguire il job con la password inserita dall'utente.
* Un **rilancio così com'era stato eseguito** può riutilizzarla, quando la validazione all'avvio non è `enforce`.

La password salvata viene usata solo sul server.

---

## Cosa restituiscono le API

Nessuna API restituisce mai una password:

* Un job letto tramite la REST API o il `get_job` del server MCP maschera ogni campo `password` del suo modulo, anche dentro
  le righe delle liste e i sottomoduli YAML.
* `MASK_EXTRAVARS_REGEX` (predefinito `password|secret|token`) maschera anche ogni extravar il cui nome corrisponde, per
  i segreti che non sono campi password.

---

## Cosa riceve un rilancio

Per precompilare un rilancio, il browser riceve i dati grezzi del modulo del job. Quei dati non contengono mai una password, nemmeno dentro
le righe delle liste o i sottomoduli YAML, quindi l'utente inserisce di nuovo la password.

Un campo password nascosto dalle dipendenze del modulo non serve, e non va inserito di nuovo.
