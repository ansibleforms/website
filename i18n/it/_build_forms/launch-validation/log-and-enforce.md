---
layout: default
title: Log ed enforce
parent: Validazione all'avvio
nav_order: 2
translated_from: 10a187b350155ce68bfc50e379e1b6b8637df57a
---

# Log ed enforce
{: .no_toc }

Cosa fa ogni modalità con un avvio che viola le regole
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Cosa fa `log`

Ogni avvio viene controllato, ma per l'utente non cambia nulla. Nel log viene scritto un avviso quando:

- l'avvio **verrebbe rifiutato**, con il motivo (solo nomi dei campi e tipi di regola, mai
  valori):

  ```
  Launch validation would refuse form 'Create VM' for alice (launch validation 'log') :
  failing rules : hostname (regex) ; failing rows : disks[1].size (maxValue)
  ```

- le extravars inviate dal client **differiscono** da quelle costruite dal server, con le
  chiavi di primo livello che differiscono:

  ```
  Launch of form 'Create VM' : the extravars differ from the ones the server builds for
  created_at, vm (launch validation 'log' ; 'enforce' would run the server's)
  ```

Prima tieni `log` attivo per un po' su un'istanza reale. Mostra quali moduli verrebbero rifiutati e
quali calcolano valori diversi sul server, prima che qualcuno ne subisca le conseguenze.

---

## Cosa fa `enforce`

Con `enforce`, un avvio non valido viene rifiutato, e uno valido gira con le extravars costruite
dal server.

### Un avvio che viola le regole viene rifiutato

`POST /api/v2/job` risponde `422` con i campi che falliscono:

```json
{
  "error": "The form data is not valid",
  "details": {
    "missing": ["owner"],
    "invalid": ["hostname", "disks"],
    "waiting": [],
    "validationErrors": {
      "hostname": [{ "type": "regex", "description": "Must start with prod-" }]
    },
    "rowErrors": {
      "disks": [{ "index": 1, "invalid": ["size"],
                  "validationErrors": { "size": [{ "type": "maxValue", "description": "size must be at most 500" }] } }]
    }
  }
}
```

- `missing`: campi obbligatori senza valore;
- `invalid`: campi che violano una regola, scelte che non sono tra le opzioni, e campi list
  con una riga che fallisce;
- `waiting`: campi che non è stato possibile valutare (un campo di cui hanno bisogno non ha mai ricevuto un valore);
- `validationErrors`: per ogni campo, ogni regola che fallisce con il messaggio mostrato dal browser;
- `rowErrors`: per ogni campo list, le righe che falliscono (vedi [Righe delle liste](list-rows-and-subforms.html));
- `uploads`: campi file il cui caricamento non è stato possibile verificare.

Viene rifiutato anche un avvio **senza `rawFormData`**: i suoi valori non si possono controllare.

### Un avvio valido gira con le extravars del server

Il job non gira con le extravars inviate dal client. Il server le costruisce dai valori
controllati, usando lo stesso codice del browser, ed esegue quelle. Un chiamante che invia `rawFormData`
validi insieme a `extravars` diverse riceve le extravars che corrispondono ai valori, non
quelle che ha inviato.

Della richiesta, il server mantiene `__verbose__` (solo per gli utenti autorizzati alla modalità verbose). Le
chiavi riservate (`__playbook__`, `__inventory__`, ...) vengono dal modulo, come sempre, e
`ansibleforms_user` è l'utente che avvia.

### Ciò che l'utente ha visto non è sempre ciò che gira

Costruire le extravars significa valutare di nuovo il modulo: ogni espressione e query gira
un'altra volta sul server, un momento dopo che il browser l'ha eseguita, come l'utente che avvia. Un valore
che dipende da **quando** o **dove** viene valutato può differire, e in quel caso si usa
il valore del server:

| Cosa | Perché può differire | Quanto |
|---|---|---|
| `fn.fnTime()`, un timestamp, un nome costruito dall'ora | valutato di nuovo, qualche secondo dopo | conta solo a cavallo di un secondo o di una data. `fnTime` gira già sul server anche nel flusso del browser, con lo stesso fuso orario (il `TZ` del container) |
| una query, `fnRestAdvanced`, `fnSsh`, `fnDnsResolve`, la lettura di un file | i dati esterni sono cambiati nel frattempo | solo quando sono cambiati |
| un'espressione `runLocal` che usa `new Date()`, `toLocaleString`, `Intl` | il browser usa fuso orario e impostazioni locali dell'utente, il server i propri | solo espressioni di questo tipo |

Lo stesso vale per la **validazione**: una regola che legge un campo del genere (`notIn` sul risultato di una
query, `validIf` su un flag calcolato) viene controllata sul valore del server. I moduli le cui
extravars differiscono compaiono negli avvisi di `log` descritti sopra; esaminali prima di passare a enforce.
