---
layout: default
title: Log
parent: In produzione
nav_order: 3
translated_from: 17d3894c528610d4916fbdcf4beb5bbbacd2b266
---

# Log
{: .no_toc }

File di log, syslog, la traccia di audit, e per quanto tempo si conservano i job e le voci di audit
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## File di log

AnsibleForms scrive due log a rotazione giornaliera in [`LOG_PATH`](../customization/logging.html#env_LOG_PATH)
(`%PERSISTENT_FOLDER%/logs`), comprime i giorni precedenti e li conserva per [`LOG_RETENTION_DAYS`](../customization/logging.html#env_LOG_RETENTION_DAYS)
(30 per impostazione predefinita, `0` conserva ogni file; una modifica nella pagina delle impostazioni si applica subito):

* `ansibleforms.<date>.log` : tutto ciò che è a livello [`LOG_LEVEL`](../customization/logging.html#env_LOG_LEVEL) o superiore
* `ansibleforms.errors.<date>.log` : solo gli errori

La console, letta con `docker logs` o `kubectl logs`, ha un proprio livello,
[`LOG_CONSOLE_LEVEL`](../customization/logging.html#env_LOG_CONSOLE_LEVEL). Entrambi sono `notice` per impostazione predefinita, il che va bene per la
produzione; usa `info` o `debug` solo durante la risoluzione dei problemi, e lascia
[`ENABLE_DB_QUERY_LOGGING`](../customization/features.html#env_ENABLE_DB_QUERY_LOGGING) disattivata. I livelli si possono cambiare nelle
pagine delle impostazioni senza riavvio, e la pagina **Log del server** mostra il log agli utenti con l'opzione `showLogs`.

---

## Righe JSON

Per un raccoglitore di log come Loki, ELK o Splunk, imposta [`LOG_FORMAT`](../customization/logging.html#env_LOG_FORMAT) a `json`. Ogni
riga, nella console e nei file, è allora un oggetto JSON invece di `<time> <level>: <message>`:

```json
{"time":"2026-10-12T08:15:02.113Z","level":"notice","message":"App running on port 8000!","role":"all","host":"forms01"}
```

| Campo | Contenuto |
|-------|---------|
| `time` | L'ora, in ISO 8601 UTC |
| `level` | Il livello di log |
| `message` | Il messaggio |
| `requestId` | La richiesta a cui appartiene la riga, quando è stata scritta mentre se ne serviva una |
| `role` | Il ruolo del processo, [`AF_ROLE`](scaling.html), o `all` quando non è impostato |
| `host` | Il nome host della macchina o del container in cui gira il processo |

Ogni richiesta riceve un id: l'intestazione `X-Request-Id` inviata da un reverse proxy, o uno nuovo. Viene restituito nell'intestazione
`X-Request-Id` della risposta e riportato da ogni riga scritta mentre la richiesta viene servita (come `[req <id>]` nelle righe di testo),
così una richiesta si può seguire nel log e confrontare con quelle del proxy. Una modifica nella pagina delle impostazioni si applica subito.

---

## Syslog

I server syslog si gestiscono in **Impostazioni > Connessioni > Syslog**, così un server syslog o un SIEM riceve il log man mano che viene scritto.
Puoi aggiungere più server, e ognuno ha le sue impostazioni:

| Impostazione | Cosa fa |
|---------|--------------|
| Abilitato | Solo i server abilitati ricevono qualcosa, così un server si può mettere in pausa senza eliminarlo; anche **Abilita** e **Disabilita** nel suo menu di riga lo commutano |
| Protocollo | `udp4` (predefinito), `udp6`, `tcp4`, `tcp6`, `tls4`, `tls6`, `unix` o `unix-connect` |
| Host e porta | Il server a cui inviare, porta `514` per impostazione predefinita; un protocollo `unix` richiede invece il percorso di un socket |
| Riceve | Il log del server, le voci di audit, o entrambi (il predefinito per un nuovo server) |
| Livello | Il livello più basso del log del server che riceve, `info` per impostazione predefinita; le voci di audit vengono sempre inviate |
| Tipo | `BSD` (RFC 3164, il predefinito) o `RFC 5424` |

Una modifica si applica su ogni nodo senza riavvio, e la pagina del server ha un pulsante che gli invia un messaggio di prova.
Un server non raggiungibile non ferma mai l'applicazione: l'errore viene scritto nella console.

Dalla 7.3.0 i server syslog richiedono i diritti completi sulle impostazioni, l'opzione di ruolo [`showSettings`](../config/roles.html#role-options):
l'accesso alle sole impostazioni delle connessioni non basta, perché un server syslog riceve il log del server e le voci di audit.

Le variabili `LOG_SYSLOG_*` delle versioni precedenti sono deprecate dalla 7. Il primo avvio che trova
[`LOG_SYSLOG_HOST`](../customization/logging.html#env_LOG_SYSLOG_HOST) impostata le importa una volta come server `syslog`,
che riceve il log del server come prima, e da quel momento le ignora. Rimuovile dall'ambiente dopo quel primo
avvio, e gestisci il server nella pagina delle impostazioni.

---

## Traccia di audit

La pagina **Registro di audit** (in **Impostazioni > Log**) registra chi ha cambiato cosa, una domanda a cui i file di log non rispondono bene.
Registra:

* ogni modifica fatta tramite l'API (`POST`, `PUT`, `PATCH`, `DELETE`), compresi i tentativi rifiutati con 401 o 403
* gli accessi, con il nome utente che è stato provato
* gli eventi dell'applicazione stessa, come i backup notturni, i backup rimossi, i job eliminati e le applicazioni del config seed

Ogni voce ha la sua ora, l'attore (un utente, o l'applicazione stessa per le sue attività), l'indirizzo IP del client,
l'azione, il suo obiettivo e il suo esito: `success`, `failure` o `denied`. La pagina filtra per attore, azione ed
esito, e gli utenti con l'opzione di ruolo `showSettings` possono aprirla.

L'indirizzo IP è quello che vede AnsibleForms, cioè quello del proxy quando gira dietro un proxy. Imposta
[`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) con il numero o gli indirizzi dei tuoi proxy, e AnsibleForms
registra invece l'indirizzo del client che il proxy riporta in `X-Forwarded-For`; vedi [Reverse proxy](reverse-proxy.html).

Per tenere la traccia di audit fuori dall'istanza, per un SIEM, aggiungi un server syslog che riceve le voci di audit (vedi
[Syslog](#syslog)). Ogni voce viene inviata quando avviene, come una riga `audit {...}` con la voce in JSON, qualunque sia il
livello del server. La copia syslog non viene rimossa dalla conservazione qui sotto, né sostituita da un ripristino del database.

---

## Conservazione

Due attività giornaliere con un'impostazione evitano che il database cresca senza limiti:

| Variabile | Predefinito | Esecuzione | Rimuove |
|----------|---------|---------|---------|
| [`AUDIT_RETENTION_DAYS`](../customization/retention.html#env_AUDIT_RETENTION_DAYS) | `365` | 3:30 | Le voci di audit più vecchie di così |
| [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) | `0` (conserva tutto) | 2:30 | I job terminati più vecchi di così, con il loro output |

`0` conserva tutto per entrambe. Altre due attività giornaliere non hanno un'impostazione: alle 3:00 vengono rimossi i refresh token salvati più vecchi di 30 giorni e
le revoche di token scadute, e alle 4:00 i [job salvati](../jobs/stored-jobs.html) la cui scadenza è passata.
Gli orari sono nel fuso orario di [`LOG_TZ`](../customization/logging.html#env_LOG_TZ), e le esegue il worker.

L'output dei job è di solito la tabella che cresce più in fretta: la pagina **Stato** ne riporta la dimensione
e avvisa quando supera 1 GB senza una conservazione impostata. I job in esecuzione e quelli in attesa di approvazione non vengono mai rimossi.
Scegli una conservazione dei job adatta ai tuoi requisiti di audit, e conserva la traccia di audit almeno altrettanto a lungo.
