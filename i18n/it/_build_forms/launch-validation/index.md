---
layout: default
title: Validazione all'avvio
nav_order: 4
has_children: true
has_toc: false
permalink: /launch-validation/
translated_from: 6b86704480781edc0ab1c24c25993fc2e220abf3
---

# Validazione all'avvio
{: .no_toc }

Controllare sul server ogni avvio di un modulo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per amministratori e autori di moduli: fai controllare al server ogni avvio, le sue regole e le sue extravars, chiunque lo invii.

Il controllo vale indipendentemente da chi o cosa avvia il modulo: il browser, uno script che chiama la REST API,
o un agente IA attraverso il server MCP.

---

## Perché esiste

Le regole di un modulo (`required`, `regex`, `minValue`, `sameAs`, ...) sono sempre state controllate
nel browser. Il browser poi invia due cose a `POST /api/v2/job`:

- `rawFormData`: i valori dei campi così come li ha compilati l'utente;
- `extravars`: ciò che riceve il playbook, costruito nel browser a partire da quei valori.

Senza la validazione all'avvio, il server si fida di entrambi. Chiunque abbia un token valido può chiamare quell'endpoint
direttamente e inviare qualsiasi extravars, senza che venga applicata alcuna regex, campo obbligatorio o regola
di lista. Per un modulo usato solo nel browser può essere accettabile; per un
modulo che altri sistemi avviano via REST, significa che le regole del modulo non vengono applicate affatto.

Inoltre il server non ha modo di distinguere una richiesta del browser da una inviata da uno
script: entrambe usano lo stesso endpoint, lo stesso token e lo stesso body, e gli utenti possono modificare
qualsiasi richiesta inviata dal proprio browser. Ci si può fidare di un controllo solo se avviene sul server, e la
validazione all'avvio è proprio quel controllo.

---

## Le tre vie d'ingresso

Il modo in cui un avvio viene validato dipende da come arriva e dalla modalità di validazione all'avvio:

| Avviato da | Validato | Extravars con cui gira il job |
|---|---|---|
| **Server MCP** (agente IA) | sempre, sul server | sempre costruite dal server |
| **Browser** o **REST API**, validazione all'avvio `off` | solo nel browser | quelle inviate dal browser (o dal chiamante) |
| **Browser** o **REST API**, validazione all'avvio `log` | sul server, i rifiuti vengono solo registrati nel log | quelle inviate; le differenze vengono registrate nel log |
| **Browser** o **REST API**, validazione all'avvio `enforce` | sul server, rifiutato se non valido | **costruite dal server** |

Il browser, il server MCP e la validazione all'avvio usano lo stesso codice per le regole (il
motore dei moduli condiviso): le stesse regole, nello stesso ordine, con gli stessi messaggi. Un errore che il
browser mostra viene rifiutato dal server con lo stesso testo.

---

## In questa sezione

Ogni argomento ha una pagina dedicata:

| Pagina | Cosa tratta |
|---|---|
| [Attivarla](switching-it-on.html) | Per l'intera istanza, o per un solo modulo |
| [Log ed enforce](log-and-enforce.html) | Cosa fa ogni modalità con un avvio che viola le regole |
| [Righe delle liste](list-rows-and-subforms.html) | Come vengono validate le righe dei campi list |
| [Caricamento di file](file-uploads.html) | Come vengono validati i campi file |
| [Password](passwords.html) | Come vengono validati i campi password e tenuti fuori dalle API |
| [Rilancio](relaunching.html) | Come viene validato un job rilanciato |
| [Messa in produzione](rolling-it-out.html) | Portare un'istanza in enforce, e le limitazioni note |
