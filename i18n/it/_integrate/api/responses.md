---
layout: default
title: Risposte ed errori
parent: API REST
nav_order: 3
translated_from: 2687f844abe74f8c0e76c8685a1bd57151edc933
---

# Risposte ed errori
{: .no_toc }

La forma di una risposta, e i codici di stato
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Le risposte sono JSON semplice, e il codice di stato HTTP dice se una chiamata è riuscita.

---

## Risposte

Una chiamata riuscita restituisce l'oggetto stesso, o un elenco con la sua dimensione:

```json
{ "count": 2, "records": [ { "id": 41 }, { "id": 42 } ] }
```

Un errore restituisce un messaggio, e i dettagli quando ce ne sono:

```json
{ "error": "The form data is not valid", "details": [ ... ] }
```

---

## Codici di stato

Il codice di stato dice cosa è andato storto:

| Codice | Significato |
|---|---|
| `200` | La chiamata è riuscita |
| `400` | La richiesta è malformata, per esempio un rinnovo del token senza refresh token, o un upload senza file |
| `401` | Il token manca, è sbagliato o è scaduto: accedi o rinnovalo |
| `403` | I ruoli dell'utente non consentono la chiamata (compreso approvare un proprio job, a meno che la sua approvazione non imposti `allowSelf: true` o tu sia un admin), o l'account deve prima fare qualcosa (vedi sotto) |
| `404` | L'oggetto non esiste |
| `409` | La richiesta è incompleta (un avvio senza dati), o l'oggetto non è in uno stato che consente l'azione |
| `422` | La [validazione all'avvio](../launch-validation/) ha rifiutato i valori del modulo; `details` elenca il perché |
| `429` | Troppe richieste agli endpoint di login e dei token, o troppi login falliti (vedi [Autenticazione](authentication.html)) |
| `500` | Il server ha avuto un errore; il log del server riporta il motivo |

Per un job, un `409` significa che è nello stato sbagliato per l'azione: interrompere un job che non è in esecuzione (o di cui è già stata chiesta l'interruzione),
rilanciare un job ancora in esecuzione, o approvare o rifiutare un job che non attende più un'approvazione.

---

## Un 403 con un codice

Alcune risposte `403` portano un `code`, per qualcosa che l'utente deve fare nel browser prima che qualsiasi altra chiamata funzioni:

```json
{ "error": "...", "code": "password_change_required" }
```

| Codice | Cosa fare |
|---|---|
| `password_change_required` | L'utente ha effettuato l'accesso con la password predefinita pubblica: prima cambiala nel profilo |
| `disclaimer_required` | Il disclaimer è attivo e l'utente non ne ha ancora accettato la versione attuale: accettalo nel browser |

Un token API di lunga durata (vedi [Autenticazione](authentication.html#long-lived-tokens)) non viene mai bloccato dal disclaimer.
