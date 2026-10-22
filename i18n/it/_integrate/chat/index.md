---
layout: default
title: Assistente chat
nav_order: 1
has_children: true
has_toc: false
permalink: /chat/
translated_from: 7c15de43a5f69fd80751b38b0fd379f282ffd84c
---

# Assistente chat
{: .no_toc }

Compila e avvia moduli tramite una conversazione
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli amministratori che lo attivano, e per gli utenti che chattano con esso: compila e avvia moduli tramite una conversazione.

Un pulsante di chat su ogni pagina apre un
assistente che trova il modulo giusto, chiede le informazioni mancanti, propone come pulsanti le scelte
del modulo stesso, e mostra un riepilogo con un pulsante **Avvia**. Un job parte solo quando l'utente fa clic su di esso.

---

## Come funziona

L'assistente comunica con il modello di IA tramite il server, che risponde alle richieste del modello usando lo stesso motore dei moduli del browser:

```text
the user types           -> AnsibleForms server -> the AI model (Anthropic, OpenAI, ...)
                                   |                  asks for a tool
                                   v
                         catalog | resolve | relaunch preview | job status
                                   |   the same form engine as the browser and the MCP server,
                                   |   as the logged-in user, with their roles
                                   v
the page shows the reply, the choices, and a summary card with a Launch button
the user clicks Launch   -> AnsibleForms resolves the form again and launches exactly that payload, once
```

- **Le chiamate al modello partono dal server**, mai dal browser, quindi la chiave API resta sul server
  (vedi [Fornitori](providers.html)).
- **Il modello non può avviare nulla.** Prepara un riepilogo monouso; Avvia lo ricontrolla prima di eseguirlo.
- **È l'utente a scegliere i target.** Le scelte e i nomi obbligatori vengono dall'utente, mai dal modello.
- **Scrivere "sì" o "avvia" non fa nulla.** Solo il pulsante avvia un job.

---

## In questa sezione

Ogni argomento ha la sua pagina:

| Pagina | Cosa tratta |
|---|---|
| [Attivarlo](switching-it-on.html) | Abilita l'assistente e offri dei moduli al suo interno |
| [Fornitori](providers.html) | Il modello linguistico dietro l'assistente, e i proxy |
| [Privacy e limiti](privacy-and-limits.html) | Cosa esce dalla rete, e i limiti per utente |
| [Rilancio e audit](relaunching-and-audit.html) | Il rilancio dalla chat, la traccia di audit e le limitazioni |
