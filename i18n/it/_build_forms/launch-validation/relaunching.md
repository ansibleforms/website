---
layout: default
title: Rilancio
parent: Validazione all'avvio
nav_order: 6
translated_from: 9f52ec39fd40e3d617d9537c5f7d356033bc9d49
---

# Rilancio
{: .no_toc }

Come viene validato un job rilanciato
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un job si può rilanciare in due modi. Il modo in cui il rilancio viene controllato dipende da quale dei due, e dalla modalità di
validazione all'avvio.

---

## Due tipi di rilancio

I due tipi differiscono per il fatto che il chiamante invii o meno nuovi valori:

* **Così com'era stato eseguito**: il pulsante Rilancia, `POST /api/v2/job/{id}/relaunch` senza body, oppure `relaunch_job` senza
  `values`.
* **Con modifiche**: le stesse chiamate con nuovi valori, sovrapposti ai valori dei campi salvati del job:

```bash
curl -X POST https://af.example.com/api/v2/job/42/relaunch \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "values": { "vm_size": "large" } }'
```

---

## Come viene controllato ciascuno

La modalità di validazione all'avvio decide se un rilancio viene riprodotto o controllato di nuovo:

| Rilancio | `off` / `log` | `enforce` |
|---|---|---|
| **Così com'era stato eseguito** | riproduce le extravars salvate del job, password comprese | il controllo completo, dai valori dei campi salvati |
| **Con modifiche** | il controllo completo, sui valori salvati con le modifiche sovrapposte | il controllo completo, allo stesso modo |

Un'eccezione con `enforce`: un job avviato da una pianificazione di livello admin non ha valori di campo propri, quindi rilanciarlo così com'era
riproduce le extravars salvate della pianificazione, per un amministratore o per un utente con l'opzione di ruolo `allowScheduledJobs`.

Un rilancio controllato (vedi [Log ed enforce](log-and-enforce.html)) avvia un nuovo job a nome del chiamante.

---

## Campi password

I valori dei campi salvati non contengono password, quindi un rilancio controllato non ne ha per un **campo password visibile**:

* Il rilancio viene rifiutato come `unsupported`, con i `passwordFields` che mancano.
* Avvia di nuovo il modulo e inserisci la password.
* Un campo password che le dipendenze del modulo **nascondono** non serve e non blocca il rilancio.

Con `enforce`, questo vale anche per il pulsante Rilancia.

---

## Chi può rilanciare

Entrambi i tipi di rilancio richiedono:

* che il modulo consenta il rilancio (`allowRelaunch`, true per impostazione predefinita);
* l'opzione di ruolo `allowJobRelaunch`;
* che l'utente sia **il proprietario del job**, un amministratore, o un utente con l'opzione di ruolo `manageAllJobs`.

Vedere tutti i job (`showAllJobLogs`) non basta per rilanciare il job di un altro utente. Gli approvatori possono vedere un job che attende la loro
approvazione, ma neanche loro possono rilanciarlo.
