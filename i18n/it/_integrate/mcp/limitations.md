---
layout: default
title: Limitazioni
parent: Server MCP
nav_order: 3
translated_from: 619aa0f8cd31ac0038d76dd8e6f75a0a9dffe089
---

# Limitazioni
{: .no_toc }

Le espressioni eseguite sul server, e ciò che il server MCP non fa
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Espressioni runLocal

Le espressioni `runLocal`, i campi `local` / `credential` / `html` e i valori predefiniti `evalDefault` vengono
valutati sul server, in un contesto V8 separato: niente `process`, `require`, rete né
timer, nessuna compilazione di stringhe in codice, un limite di tempo di 2 secondi, e solo le funzioni
helper offerte dal browser (`fnArray`, `fnGetNumberedName`, `fnToTable`, ...).

Questo protegge da espressioni difettose o fuori controllo. Non è una sandbox per codice ostile,
e non ha bisogno di esserlo: il codice viene dalla definizione del modulo, mai dal chiamante
MCP, e ogni valore inviato da un chiamante viene sostituito come letterale JavaScript.

Un'espressione che usa un'API del browser (`window`, `document`, `fetch`) non può girare qui e
restituisce `status: error`.

Le espressioni lato server (senza `runLocal`) passano per le stesse regole di
[`EXPRESSION_SANITIZER`](../customization) usate per il browser.

---

## Limitazioni

Alcuni moduli e campi non si possono ancora usare tramite il server MCP:

- I **moduli wizard** non si possono ancora avviare. I loro passi si possono risolvere con `subform`.
- I **campi file** non si possono compilare; un modulo il cui campo file ha un valore viene rifiutato.
- **Righe di lista** (e un campo `yaml` con un subform, che è una riga del genere): ogni riga che
  invii, tranne una che porta il `deleteMarker` della lista, viene risolta tramite il suo subform con
  i valori del modulo come `__parent__` e poi validata. Questo vale anche per le liste annidate, dove
  `__parent__.__parent__` raggiunge il modulo. Invia righe semplici, cioè i valori grezzi dei campi
  del subform. Le righe che falliscono sono elencate per campo lista in `rowErrors`
  (`vms[1].disks[0].size (missing)` nel messaggio). Sono accettate al massimo 500 righe per chiamata,
  su tutti i livelli.
- Un enum lasciato su `__auto__` non viene mai compilato con la sua prima opzione; il chiamante deve scegliere.
- Ogni richiesta MCP crea una voce nel registro di audit (azione "Richiesta MCP (agente IA)"); il
  job stesso viene registrato sotto l'utente, come per qualsiasi altro avvio.
