---
layout: default
title: Espressioni
nav_order: 1
has_children: true
has_toc: false
permalink: /expressions/
translated_from: 52d74e32540fba4dfa5078c8976147b39a2ad2cf
---

# Espressioni
{: .no_toc }

Calcolare i valori dei campi con JavaScript, nel browser o sul server
{: .fs-6 .fw-300 }

---

Per chi scrive i moduli: compila i campi in modo dinamico con JavaScript, calcolati nel browser o recuperati sul server.

L'attributo `expression` di un campo del modulo ti permette di creare moduli dinamici con espressioni JavaScript.

---

## Introduzione

L'attributo `expression` è disponibile su diversi tipi di campo:
- campo `enum`: per popolare dinamicamente le opzioni del menu a tendina
- campo `expression`: per recuperare o generare qualsiasi tipo di dato
- campo `html`: per costruirne il contenuto HTML
- campi `yaml` e `list`: per riempirne i dati

Le espressioni JavaScript vengono valutate **lato server** (predefinito) oppure **lato client**, in base alla proprietà `runLocal` del campo.
Un campo `html`, e i tipi di campo `local`, `local_out` e `credential`, eseguono sempre la loro espressione nel browser, qualunque cosa dica
`runLocal`.

- **Lato server** (`runLocal: false`, il valore predefinito): funzioni predefinite che recuperano dati da API, file e database.
- **Lato client** (`runLocal: true`): il codice sfrutta l'intero motore JavaScript nella sandbox del browser per calcoli, trasformazioni e manipolazioni.

---

## Considerazioni sulla sicurezza

Poiché le espressioni vengono valutate con la funzione JavaScript `eval`, l'iniezione di codice è un rischio potenziale:

- **Le espressioni lato server** passano prima da un sanitizzatore: ogni chiamata deve essere una funzione `fn.` o `fnc.`, e vengono rifiutati le righe multiple,
  `;`, i template literal, `process.env` e i modi per uscire da `eval` (`import`, `require`, `constructor`, ...).
- **Le espressioni lato client** vengono valutate nella sandbox del browser e si possono considerare sicure.

Quanto è severo il sanitizzatore dipende da
[`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER):

| Valore | Espressioni lato server |
|---|---|
| `strict` (predefinito) | chiamate `fn.` e `fnc.`, e metodi sul loro risultato, come `fn.fnTime().format('YYYY')` |
| `paranoid` | solo chiamate dirette `fn.` e `fnc.`, nessun metodo sul loro risultato |
| `off` | ogni espressione lato server viene rifiutata; funzionano solo le espressioni `runLocal` |
| `legacy` | le regole della 6.2.1, che permettevano a qualsiasi utente autenticato di eseguire codice sul server; solo per un aggiornamento, e solo nell'ambiente reale (non dalla pagina delle impostazioni) |

Un valore vuoto o sconosciuto equivale a `strict`. Una modifica vale dalla prossima espressione, senza riavvio.

---

## In questa sezione

Ogni argomento ha una pagina dedicata:

| Pagina | Cosa tratta |
|---|---|
| [Segnaposto](placeholders.html) | Fare riferimento a un altro campo, a una costante o all'utente con `$(...)` |
| [Espressioni locali](local.html) | JavaScript eseguito nella sandbox del browser |
| [Espressioni remote](remote.html) | Funzioni lato server per date, reti, file, SSH e nomi numerati |
| [API REST](rest-apis.html) | Chiamare API REST con autenticazione basic, a token o personalizzata |
| [Credenziali](credentials.html) | Leggere una credenziale salvata |
| [Ordinamento](sorting.html) | Ordinare array con un oggetto di ordinamento |
| [Query jq](jq.html) | Rimodellare i dati con jq |
