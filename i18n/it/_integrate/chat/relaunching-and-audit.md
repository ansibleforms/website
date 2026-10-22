---
layout: default
title: Rilancio e audit
parent: Assistente chat
nav_order: 4
translated_from: b7d416fbf35e98de81e41ee53ba0d2ff9040fea0
---

# Rilancio e audit
{: .no_toc }

Il rilancio dalla chat, la traccia di audit e le limitazioni
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Rilancio

Una richiesta come "Esegui di nuovo il job 1234" (l'utente deve digitare l'ID del job) mostra un'anteprima di un rilancio
con le stesse regole di `relaunch_job` del server MCP, compresa la regola sulle password della
[validazione all'avvio](../launch-validation), e mostra un riepilogo **Riavvia**; il pulsante
lo avvia una volta. "Esegui di nuovo il job 1234 con il server web02" cambia solo quel campo.

---

## Audit

Ogni avvio dalla chat viene registrato come **chat.launch** con l'utente, il job, il modulo,
il fornitore e l'hash del payload del riepilogo che è stato approvato. Le modifiche alle impostazioni della chat vengono
registrate come qualsiasi altra modifica alle impostazioni.

---

## Limitazioni

L'assistente chat non fa ancora tutto ciò che fa un browser:

- I **moduli wizard** non possono partecipare (`enableForChat` viene rifiutato su di essi), e nemmeno
  i campi che l'assistente non compila: password e upload di file.
- Le risposte arrivano in un unico blocco; lo streaming non è ancora supportato.
- Il modello può fraintendere una richiesta. La scheda di riepilogo mostra esattamente cosa verrà inviato;
  controllala prima di fare clic su **Avvia**.
