---
layout: default
title: Job
parent: API REST
nav_order: 2
translated_from: ceba9eb4f9c2acb23646bd60c48cc579fe8ce202
---

# Job
{: .no_toc }

Avvia un modulo, segui il job, interrompilo, rilancialo o approvalo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un job è un'esecuzione di un modulo. Avvialo con il nome e i valori del modulo, poi seguilo tramite il suo ID.

---

## Avvia un modulo

Invia il nome del modulo e i suoi valori a `POST /api/v2/job`:

```bash
curl -X POST https://af.example.com/api/v2/job \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{
        "formName": "Create Virtual Machine",
        "extravars": { "vm_name": "test-vm", "datacenter": "dc1" },
        "rawFormData": { "vm_name": "test-vm", "datacenter": "dc1" }
      }'
```

La richiesta accetta queste proprietà:

| Proprietà | Significato |
|---|---|
| `formName` | Il nome del modulo da avviare. Obbligatoria. |
| `extravars` | Le variabili extra per il job. `payload` è accettato come altro nome. |
| `rawFormData` | I valori dei campi del modulo, come li tiene il browser. La [validazione all'avvio](../launch-validation/) controlla questi, e costruisce da essi le extravars. |
| `credentials` | Credenziali da passare al job, per nome. |
| `files` | Gli upload dei campi file del modulo (vedi [Upload di file](../launch-validation/file-uploads.html)). |

La risposta contiene l'ID del nuovo job:

```json
{ "id": 42 }
```

Per eseguire il job in modalità verbose, aggiungi `"__verbose__": true` alle extravars. Richiede l'opzione di ruolo `allowVerboseMode`,
altrimenti l'avvio risponde `403`.

---

## Carica un file

Un modulo con un campo file ha bisogno che prima venga caricato il file. Invialo come parte multipart `file` a `POST /api/v2/job/upload`:

```bash
curl -X POST https://af.example.com/api/v2/job/upload \
  -H "Authorization: Bearer <token>" -F "file=@firmware.bin"
```

La risposta descrive l'upload salvato:

```json
{ "fieldname": "file", "originalname": "firmware.bin", "encoding": "7bit", "mimetype": "application/octet-stream",
  "destination": "<UPLOAD_PATH>", "filename": "3f9c...", "path": "<UPLOAD_PATH>/3f9c...", "size": 1048576 }
```

Passalo invariato nei `files` dell'avvio, sotto il nome del campo file: `"files": { "firmware": { ... } }`. Il server
lo verifica sul proprio disco (vedi [Upload di file](../launch-validation/file-uploads.html)).

---

## Segui il job

Leggi il job tramite il suo ID:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

Il job contiene il suo `status`, le sue `extravars` (anche come `payload`, lo stesso oggetto), i suoi `subjobs` e il suo `output`. L'output
è HTML con i colori della pagina del job; aggiungi `?text=true` per il testo semplice, adatto a uno script o a un log:

```bash
curl "https://af.example.com/api/v2/job/42?text=true" -H "Authorization: Bearer <token>"
```

Il suo `status` è `running` mentre è in esecuzione, e `approve` mentre attende un'approvazione. Un job termina con uno di questi:

| Stato | Significato |
|---|---|
| `success` | Il job è terminato senza errori |
| `failed` | Il job è fallito |
| `warning` | Un job multistep è terminato, ma un passo con `continue` impostato è fallito lungo il percorso |
| `aborted` | Il job è stato interrotto |
| `rejected` | L'approvazione è stata rifiutata, quindi ciò che la attendeva non è stato eseguito |
| `abandoned` | Il processo che seguiva il job si è fermato (un riavvio, un container sostituito) e il job è stato abbandonato |

Un job in esecuzione su un runner quando è stato abbandonato può comunque terminare con il suo esito reale, se quel runner lo porta a termine.

---

## Trova i job

`GET /api/v2/job` elenca prima i job più recenti, come `{ "count": ..., "records": [ ... ] }`. Questi parametri di query lo restringono:

| Parametro | Significato |
|---|---|
| `records` | Quanti job, al massimo. Il valore predefinito è [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE) (1000), e 5000 il massimo a meno che `JOBS_LIST_SIZE` non sia più alto. |
| `user`, `user_type` | Solo i job di questo utente. `user_type` è `local` se omesso (`ldap`, `azuread`, `oidc` per gli altri). |
| `runner` | Solo i job eseguiti su questo runner |

```bash
curl "https://af.example.com/api/v2/job?records=20&user=automation" -H "Authorization: Bearer <token>"
```

Un utente vede i propri job e i job che attendono un'approvazione che uno dei suoi ruoli può dare. Un admin, o un ruolo con l'opzione
`showAllJobLogs` o `manageAllJobs`, vede tutti i job. Un record contiene il riepilogo del job (`id`, `form`, `status`, `start`, `end`, `user`, `runner`, ...); leggi
il job stesso per le sue extravars e il suo output.

`GET /api/v2/job/approvals` risponde con un numero: quanti job attendono un'approvazione che l'utente può dare.

---

## Altro su un job

Questi endpoint leggono altre informazioni su un job:

| Chiamata | Cosa restituisce |
|---|---|
| `GET /api/v2/job/{id}/rawformdata` | I valori dei campi con cui il job è stato avviato, come li conteneva il modulo. Valgono gli stessi permessi di un rilancio: un tuo job (o qualsiasi job per un admin o un ruolo con `manageAllJobs`), un modulo che consente il rilancio, e l'opzione di ruolo `allowJobRelaunch`. |
| `GET /api/v2/job/{id}/events` | Gli eventi strutturati di un job playbook (dalla 7.3.0, per un playbook su un RTE 7.3.0 o successivo): ogni play, task, risultato per host e il recap, con il loro `order`, `type`, `play`, `task`, `host`, `duration` e `time` |
| `GET /api/v2/job/{id}/events/{order}` | Uno di questi eventi con il suo `result` completo, come lo mostra la finestra **Risultato del task**; `400` quando `order` non è un numero intero, `404` quando il job non ha un evento del genere |
| `GET /api/v2/job/{id}/node/{nodeId}` | Un nodo di un job workflow: `{ "node", "job", "extravars", "artifacts" }`, dove `job` è l'ID del job del nodo, o `null` quando il nodo non è stato eseguito. |

---

## Altre azioni

Questi endpoint agiscono su un job esistente:

| Chiamata | Azione |
|---|---|
| `POST /api/v2/job/{id}/abort` | Interrompe un job in esecuzione |
| `POST /api/v2/job/{id}/relaunch` | Rilancia un job, così come è stato eseguito o con modifiche (vedi [Rilancio](../launch-validation/relaunching.html)) |
| `POST /api/v2/job/{id}/approve` | Approva un job che attende approvazione; un tuo job risponde `403`, a meno che la sua approvazione non imposti `allowSelf: true` o tu sia un admin |
| `POST /api/v2/job/{id}/reject` | Rifiuta un job che attende approvazione |
| `GET /api/v2/job/{id}/download` | Scarica l'output del job |
| `DELETE /api/v2/job/{id}` | Elimina un job |

Interruzione, approvazione, rifiuto ed eliminazione rispondono con un messaggio, e un rilancio anche con l'ID del nuovo job:

```json
{ "message": "Job has been relaunched with job id 43", "id": 43 }
```

Aggiungi `?verbose=true` a un rilancio per eseguire il nuovo job in modalità verbose, con l'opzione di ruolo `allowVerboseMode`. Un job che
è nello stato sbagliato per l'azione, per esempio l'interruzione di un job già terminato, risponde `409`.
