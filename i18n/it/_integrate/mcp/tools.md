---
layout: default
title: Strumenti
parent: Server MCP
nav_order: 2
translated_from: a8c4d7ff425720a098c720cc1ade3629094bdb40
---

# Strumenti
{: .no_toc }

Gli strumenti che un agente usa per compilare, approvare e rilanciare moduli
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Il server MCP offre fino a 15 strumenti. Sei sono offerti a ogni utente; gli altri seguono le opzioni di ruolo dell'utente, quindi a un utente
senza un'opzione i relativi strumenti non vengono proprio offerti:

| Strumento | Cosa fa | Offerto con |
|---|---|---|
| `list_forms` | I moduli che l'utente può usare: nome, descrizione, categorie, e `enableForChat` (se l'assistente chat lo offre). | sempre |
| `get_form` | La definizione completa di un modulo. Ogni campo porta anche `dynamic` (valutato da un'espressione o da una query) e `dependsOn` (i campi che legge). | sempre |
| `resolve_field` | Valuta il modulo per i valori compilati finora. Vedi sotto. | sempre |
| `launch_job` | Avvia il modulo con i valori dati, esattamente come farebbe un invio dal browser. Restituisce l'id del job. | sempre |
| `relaunch_job` | Avvia di nuovo un job con alcuni campi modificati. Vedi sotto. | sempre |
| `get_job` | Stato e output di un job (`tail` limita l'output alle ultime righe). | sempre |
| `plan_job` | Esegue il modulo una volta, più tardi, come l'utente: ciò che fa **Esegui più tardi (una volta)** sul modulo. | `allowPlannedJobs` |
| `create_schedule` | Crea una pianificazione, ricorrente (`cron`) o singola (`run_at`), come nella pagina **Pianificazioni**. | `allowScheduledJobs` |
| `list_schedules` | Le pianificazioni che l'utente può vedere: tutte con `allowScheduledJobs`, altrimenti le esecuzioni che ha pianificato. | `allowPlannedJobs` o `allowScheduledJobs` |
| `get_schedule` | Una pianificazione, con le sue extra vars (quelle che sembrano segreti mascherate) e l'output della sua ultima esecuzione. | `allowPlannedJobs` o `allowScheduledJobs` |
| `delete_schedule` | Annulla un'esecuzione pianificata o elimina una pianificazione che l'utente può vedere. | `allowPlannedJobs` o `allowScheduledJobs` |
| `list_stored_jobs` | I [job salvati](../jobs/stored-jobs.html) che l'utente può vedere, senza i loro valori. | `allowStoredJobs` |
| `get_stored_job` | Un job salvato con i suoi valori, per `id`, o per `form` e `name` tra quelli dell'utente. | `allowStoredJobs` |
| `store_job` | Salva i valori di un modulo con un nome, come fa **Salva** sul modulo. | `allowStoredJobs` |
| `delete_stored_job` | Elimina un job salvato che l'utente può vedere. | `allowStoredJobs` |

`launch_job`, `relaunch_job` e `plan_job` accettano `verbose: true` per eseguire il job in modalità verbose, che richiede
l'opzione di ruolo `allowVerboseMode`. Con [`MCP_READ_ONLY`](setup.html#limiting-what-agents-can-do) gli strumenti che avviano, pianificano o
modificano (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job` e `delete_stored_job`)
non vengono offerti.

Non c'è nessuno strumento per eseguire un'espressione, una query, un playbook o delle extravars arbitrari. Espressioni
e query girano sempre e solo come le definisce il modulo.

Anche l'[assistente chat](../chat) usa questi strumenti, con un pulsante **Avvia** al posto di `launch_job`.

---

## Compilare un modulo

Chiama `resolve_field` con il nome del modulo e i valori che hai finora, e di nuovo dopo ogni risposta. Percorre
i campi in ordine di dipendenza e riporta per ciascuno:

- `status`: `resolved`, `waiting` (con `waitingFor`), `hidden`, o `error` (il campo ricade sul suo valore predefinito);
- `value`, `default` e, per i campi a scelta, `options` (al massimo `maxOptions`, predefinito 200);
- `needsInput`: un campo obbligatorio senza valore, o una scelta ancora su `__auto__`;
- `validationErrors`: le regole che il valore viola, come `[{type, description}]`, con il messaggio del browser.

Per l'intero modulo, `missing` e `invalid` elencano ciò che resta da correggere; `launch_job` lo rifiuta finché `complete` non è true.

La validazione è il codice stesso del browser, condiviso con la [validazione all'avvio](../launch-validation). I campi nascosti non vengono
validati, e un campo facoltativo vuoto è valido.

---

## Pianificazioni ed esecuzioni pianificate

`plan_job` accetta gli stessi `form`, `values` e `expectedPayloadHash` di `launch_job`, con un `name` per l'esecuzione e `run_at`, un
orario ISO 8601 con il suo offset o `Z` (`2026-10-15T22:00:00+02:00`); un orario senza fuso viene rifiutato. I valori vengono risolti
e validati subito, e controllati di nuovo quando l'esecuzione parte, come per un'[esecuzione pianificata](../jobs/schedules.html#planned-runs) nel
browser. La risposta indica l'orario dell'esecuzione in UTC e sull'orologio dell'app.

`create_schedule` accetta un `form`, un `name`, o `cron` (cinque campi, come `0 22 * * 1-5`) o `run_at`, e le
`extraVars` che riceve il job. Una pianificazione del genere gira come `Schedule Service`, senza la validazione del modulo; per eseguire un modulo una volta come
l'utente, usa `plan_job`. I nomi delle pianificazioni sono univoci.

---

## Job salvati

Un job salvato sono i valori di un modulo salvati con un nome; gli strumenti lavorano sugli stessi job salvati del browser.

`list_stored_jobs` elenca i job salvati dell'utente, o quelli di tutti per un utente con `showSettings`, con il loro nome, descrizione,
modulo, creazione e scadenza. Uno contrassegnato come `usable` (dell'utente stesso, di un modulo che può avviare) si può passare come `storedJob`
(`{ "id": 7 }`, o `{ "name": "..." }` tra quelli dell'utente per quel modulo) a `resolve_field`, `launch_job` o `plan_job`: i suoi
valori sono il punto di partenza e `values` vi si sovrappongono. I campi password non vengono salvati, quindi forniscili in `values`.
`launch_job` e `plan_job` da un job salvato richiedono l'`expectedPayloadHash` che `resolve_field` ha restituito per esso, e
`resolve_field` rifiuta `storedJob` insieme a `subform`.

`store_job` accetta il `form`, un `name` univoco tra i job salvati dell'utente per quel modulo, i `values`, e facoltativamente una
`description` e `expires_at` (ISO 8601 con il suo offset o `Z`). La sua risposta dice quali campi password sono stati esclusi.

---

## Passare i valori

Passa `field` per risolvere solo quel campo e ciò da cui dipende. Per una riga di lista o un passo di un wizard, passa `subform` (e
facoltativamente `parent`, i valori del modulo padre).

Invia i valori come li tiene il browser. Un campo a scelta accetta anche un record parziale o il suo valore `valueColumn`
(`"vol1"`), e un array quando è `multiple`. I campi calcolati ignorano i valori inviati a meno che non siano `editable`.

---

## Approvare il payload esatto

Quando il modulo è completo, `resolve_field` restituisce anche ciò che `launch_job` invierà:

- `modeledExtravars`: le extravars dopo l'applicazione di `model`, `valueColumn` e `output`,
  con i campi password mascherati;
- `credentials`: le credenziali di AnsibleForms che il job userà (nomi, non segreti);
- `payloadHash`: un hash SHA-256 del nome del modulo, delle extravars reali e delle credenziali.

Mostra `modeledExtravars` all'operatore, e passa il `payloadHash` che ha approvato a
`launch_job` come `expectedPayloadHash`. L'avvio risolve di nuovo il modulo e viene rifiutato
quando il payload è diverso, per esempio perché una query ora risponde in modo diverso.
`ansibleforms_user`, `__jobid__` e `__verbose__` vengono aggiunti all'avvio e non fanno parte dell'hash.

`launch_job` controlla solo il payload. Una modifica del modulo che lascia il payload uguale non fa rifiutare l'avvio.
Ogni risposta di `resolve_field` porta anche un `formFingerprint`, un hash SHA-256 della definizione del modulo: per rifiutare un
avvio dopo qualsiasi modifica del modulo, confrontalo tu prima di chiamare `launch_job`, come fa il pulsante
**Avvia** dell'assistente chat.

---

## Rilanciare con modifiche

`relaunch_job` accetta un `id` di job e `values`: solo i campi da modificare, come valori grezzi.
`values` si sovrappone ai valori con cui il job era stato avviato in origine, e il risultato viene
risolto e validato esattamente come da `launch_job`, righe di lista comprese, poi avviato come
nuovo job da te (`ansibleforms_user` sei tu, non chi lo aveva inviato in origine). Gli upload di file
del job originale vengono riutilizzati.

Senza `values`, è un rilancio **così come il job è stato eseguito**: le sue extravars salvate vengono riprodotte sul
server, password comprese (l'anteprima le maschera). Se però il modulo è sotto la validazione all'avvio
`enforce`, il rilancio passa per lo stesso controllo di un rilancio con
modifiche.

**Le password non vengono mai salvate con i valori dei campi**, quindi un rilancio che passa per il
controllo viene rifiutato quando il modulo mostra un campo password, al livello principale o in una riga di lista
(`unsupported`, con i `passwordFields`). Un campo password nascosto dalle sue dipendenze non
blocca il rilancio. Vedi [Validazione all'avvio](../launch-validation).

Chiamalo prima con `preview: true`: restituisce `modeledExtravars` (password mascherate),
`credentials` e un `payloadHash` senza avviare nulla. Confermali con l'utente, poi chiamalo
di nuovo con `expectedPayloadHash`. Valgono gli stessi permessi di un rilancio nel browser:
il modulo deve consentire il rilancio e i tuoi ruoli devono avere l'opzione `allowJobRelaunch`. Un
job senza dati del modulo salvati (avviato prima che esistesse il rilancio) e un modulo wizard non si possono
rilanciare con modifiche.

L'API REST offre lo stesso tramite `POST /api/v2/job/{id}/relaunch` con il body
`{ "values": { ... } }`; senza body, riproduce il job così come è stato eseguito.

---

## Errori

Una chiamata rifiutata è un errore dello strumento il cui contenuto strutturato porta un `code` e i dettagli:

| Codice | Quando |
|---|---|
| `form_incomplete` | `launch_job` o `relaunch_job` su un modulo non completo, con `missing`, `invalid`, `waiting`, `validationErrors` e `rowErrors` |
| `payload_mismatch` | il payload è diverso da `expectedPayloadHash`, con entrambi gli hash |
| `access_denied` | i ruoli dell'utente non concedono il modulo, il job, la pianificazione o il job salvato, o la modalità verbose, o il server è in sola lettura |
| `not_found` | nessun modulo, subform o job del genere |
| `unsupported` | un modulo wizard, un subform da solo, un campo file, o un `relaunch_job` che richiederebbe un campo password visibile |
| `no_form_data` | `relaunch_job` con modifiche per un job che non ha salvato valori del modulo, come uno avviato da una pianificazione; rilancialo invece senza modifiche |
| `invalid_request` | una richiesta che il server rifiuta perché malformata |
| `internal_error` | qualsiasi altra cosa |
