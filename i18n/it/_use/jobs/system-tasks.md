---
layout: default
title: Attività di sistema
parent: Job
nav_order: 7
translated_from: 3c7c5f9702fa19b6daa323c22d92feefd289dc54
---

# Attività di sistema
{: .no_toc }

Le attività di manutenzione che AnsibleForms esegue da solo, e quando girano
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli amministratori: le pulizie, il backup notturno e gli altri lavori in background del server, elencati sotto **Job** dalla 7.8.0.

---

## Le attività

Il server esegue queste attività da solo, ciascuna su un cron nel fuso orario del server, impostato con [`LOG_TZ`](../customization/logging.html#env_LOG_TZ):

| Attività | Esecuzione predefinita | Cosa fa |
|---|---|---|
| **Job abbandonati** | Ogni ora | Termina i job che hanno girato un giorno senza output e che nessun runner ha preso (vedi [Job abbandonati](cleanup.html#abandoned-jobs)) |
| **Nodi fermati** | Ogni minuto | Libera i job, le prenotazioni e i runner tenuti dai nodi AnsibleForms e dagli RTE che hanno smesso di rispondere |
| **Fine delle pianificazioni** | Ogni minuto | Disattiva o rimuove le [pianificazioni](schedules.html) arrivate alla loro fine |
| **Risincronizza pianificazioni** | Ogni 5 minuti | Rilegge dal database le pianificazioni e i pull dei repository, nel caso sia sfuggito un avviso di modifica |
| **Token scaduti** | Ogni giorno alle 03:00 | Rimuove i token di accesso scaduti, le revoche di token e i token API scaduti |
| **Pulizia del log di audit** | Ogni giorno alle 03:30 | Rimuove le voci di audit più vecchie di `AUDIT_RETENTION_DAYS` |
| **Pulizia dei job** | Ogni giorno alle 02:30 | Rimuove i job terminati più vecchi di `JOB_RETENTION_DAYS`, con il loro output |
| **Backup notturno** | Ogni giorno a mezzanotte | Esegue il backup del database e rimuove i backup notturni più vecchi oltre `NIGHTLY_BACKUP_RETENTION` |
| **Pulizia dei job salvati** | Ogni giorno alle 04:00 | Rimuove i job salvati scaduti o inutilizzati da `STORED_JOB_UNUSED_DAYS`, e dimentica i nodi spariti da un giorno |
| **Ricarica del config seed** | Ogni minuto | Applica di nuovo il [config seed](../seed/reloading.html) quando il suo file è cambiato |

Le impostazioni di conservazione sono descritte in [Backup e conservazione](../customization/retention.html), e i backup in
[Backup](../production/backups.html). La **Ricarica del config seed** è disattivata senza [`CONFIG_SEED_PATH`](../customization/configuration.html#env_CONFIG_SEED_PATH).

Queste attività girano sul nodo che fa il lavoro in background: il processo senza `AF_ROLE`, o il `worker` che detiene il lock del worker
quando l'app è divisa su più nodi (vedi [Scalabilità](../production/scaling.html#roles)).

---

## I cicli dell'hub dei runner

L'hub dei runner consegna i job agli RTE, e tre suoi cicli girano ogni pochi secondi invece che su un cron:

| Ciclo | Esecuzione predefinita | Cosa fa |
|---|---|---|
| **Invio ai runner** | Ogni 2 secondi | Consegna i job in attesa e gli annullamenti ai loro runner; uno avviato su un altro nodo raggiunge il suo runner al passaggio successivo |
| **Chiamata runner in entrata** | Ogni 10 secondi | Chiama i runner [in entrata](../rte/modes.html#inbound) che questo nodo può tenere, di nuovo per uno che ha perso il socket |
| **Pulizia job terminati** | Ogni 60 secondi | Rilascia ciò che questo nodo teneva dei job terminati su un altro nodo |

I cicli girano su ogni nodo che esegue l'app web, quindi con più nodi app ognuno ha i propri. Un minuto, il passo più piccolo di un
cron, è troppo grossolano per loro: ognuno gira ogni tanti secondi.

---

## L'elenco Sistema

La pagina [Job](./) elenca le attività sotto **Futuro**, come **Sistema**, con il numero di attività, per gli admin (opzione di ruolo `showSettings`).

L'elenco ha una riga per attività e per ciclo, e viene riletto ogni minuto:

| Colonna | Mostra |
|---|---|
| **Nome** | Il nome dell'attività |
| **Pianificazione** | Quando gira, a parole (*Ogni ora*, *Ogni 2 secondi*), il suo cron al passaggio del mouse, o **Disattivata** per un'attività che non gira |
| **Ultima esecuzione** | Quando è iniziata l'ultima esecuzione, o un trattino se non ha mai girato |
| **Prossima esecuzione** | Quando gira la prossima volta |
| **Stato** | Com'è andata l'ultima esecuzione: `success` o `failed` |

**Colonne** offre anche **Descrizione**, cosa fa ogni attività. Un clic su una riga apre la pagina dell'attività. Le attività sono quelle
dell'app: non si possono aggiungere né eliminare.

---

## La pagina di un'attività

La pagina di un'attività ha tre schede, con **Esegui ora** e **Salva** sopra di esse, e una casella di ricerca che filtra tutte le schede insieme.

| Scheda | Cosa mostra |
|---|---|
| **Dettagli** | Il suo **Nome** e la sua **Descrizione**, il suo **Ultimo avvio** (l'errore al passaggio del mouse se è fallito), il **Risultato** dell'ultima esecuzione, **Ultima esecuzione**, **Prossima esecuzione**, il **Nodo** che ha risposto per un ciclo, e l'**Impostazione applicata** |
| **Pianificazione** | Quando gira: un cron per un'attività, un **Intervallo** in secondi per un ciclo |
| **Esecuzioni** | Ogni esecuzione registrata, la più recente per prima |

**Impostazione applicata** indica la variabile e il suo valore, ad esempio `JOB_RETENTION_DAYS` 90, con **Modificala nelle Impostazioni** per aprire
la scheda delle impostazioni che la modifica. Un'attività senza una tale impostazione mostra un trattino.

### La scheda Pianificazione
{: .no_toc }

Il cron di un'attività si modifica nello stesso editor di quello di una pianificazione: preimpostazioni, l'espressione a parole e le prossime tre
esecuzioni, nel fuso orario del server. Accetta 5 campi (minuto, ora, giorno, mese e giorno della settimana) e deve ripetersi. Un ciclo accetta
un numero intero di secondi, entro i suoi limiti, che la riga sotto il campo indica.

**Salva** scrive il valore nel file delle impostazioni gestito, come fanno le pagine delle impostazioni, e lo applica subito su ogni nodo, senza
riavvio. Un valore impostato nell'ambiente del processo, o qualsiasi valore con [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0`,
appare in sola lettura, con la riga *Impostato dalla variabile d'ambiente* e il suo nome.

### La scheda Esecuzioni
{: .no_toc }

Ogni esecuzione di un'attività è una riga, con queste colonne:

| Colonna | Mostra |
|---|---|
| **Avviato da** | L'utente che ha scelto **Esegui ora**, come `admin (local)`, o **Pianificazione** per un'esecuzione sul suo cron |
| **Ora di inizio**, **Ora di fine** e **Durata** | Quando l'esecuzione è iniziata e finita, e quanto è durata |
| **Stato** | `success` o `failed` |
| **Risultato** | Cosa ha fatto l'esecuzione, ad esempio *Removed 120 jobs*, o il suo errore |
| **Nodo** | Il nodo che l'ha eseguita |

Vengono conservate le esecuzioni degli ultimi 30 giorni, fino a 1000 per attività: per un'attività che gira ogni minuto, circa le sue ultime 16 ore.

Un ciclo gira troppo spesso per una riga per passaggio. La sua scheda **Esecuzioni** mostra invece, per nodo:

* un riepilogo di ogni ora, ad esempio *1,800 passes, 0 failed*, `failed` quando un passaggio di quell'ora è fallito;
* una riga per ogni **Esegui ora**, con *Run now: done* o l'errore;
* una riga `failed` quando un passaggio sul suo timer fallisce, al massimo una volta al minuto per lo stesso errore.

### Esegui ora
{: .no_toc }

**Esegui ora** esegue l'attività subito, sul nodo che esegue le attività, e registra l'esecuzione con il tuo nome. È disattivato mentre
un'esecuzione dell'attività è in corso, e per un'attività **Disattivata**. Un'esecuzione lunga, come il backup notturno, prosegue dopo la risposta della pagina.

**Esegui ora** di un ciclo esegue un passaggio sul nodo che serve la pagina, e viene rifiutato dove l'hub dei runner non gira. Ogni **Esegui ora**
viene scritto nel log di audit come `system.task.run`.

---

## Cambiare quando gira un'attività

Ogni attività e ogni ciclo ha una variabile d'ambiente per il suo orario, che la sua scheda **Pianificazione** scrive. Tutte si applicano senza riavvio.

| Variabile | Predefinito | Attività |
|---|---|---|
| [`ABANDONED_JOBS_CRON`](../customization/system-tasks.html#env_ABANDONED_JOBS_CRON) | `0 * * * *` | Job abbandonati |
| [`DEAD_NODES_CRON`](../customization/system-tasks.html#env_DEAD_NODES_CRON) | `* * * * *` | Nodi fermati |
| [`SCHEDULE_ENDS_CRON`](../customization/system-tasks.html#env_SCHEDULE_ENDS_CRON) | `* * * * *` | Fine delle pianificazioni |
| [`SCHEDULE_RESYNC_CRON`](../customization/system-tasks.html#env_SCHEDULE_RESYNC_CRON) | `*/5 * * * *` | Risincronizza pianificazioni |
| [`TOKEN_CLEANUP_CRON`](../customization/system-tasks.html#env_TOKEN_CLEANUP_CRON) | `0 3 * * *` | Token scaduti |
| [`AUDIT_CLEANUP_CRON`](../customization/system-tasks.html#env_AUDIT_CLEANUP_CRON) | `30 3 * * *` | Pulizia del log di audit |
| [`JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_JOB_CLEANUP_CRON) | `30 2 * * *` | Pulizia dei job |
| [`NIGHTLY_BACKUP_CRON`](../customization/system-tasks.html#env_NIGHTLY_BACKUP_CRON) | `0 0 * * *` | Backup notturno |
| [`STORED_JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_STORED_JOB_CLEANUP_CRON) | `0 4 * * *` | Pulizia dei job salvati |
| [`CONFIG_SEED_RELOAD_CRON`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_CRON) | `* * * * *` | Ricarica del config seed |
| [`RUNNER_DISPATCH_SECONDS`](../customization/system-tasks.html#env_RUNNER_DISPATCH_SECONDS) | `2` (da 1 a 60) | Invio ai runner |
| [`RUNNER_DIAL_SECONDS`](../customization/system-tasks.html#env_RUNNER_DIAL_SECONDS) | `10` (da 2 a 300) | Chiamata runner in entrata |
| [`RUNNER_PRUNE_SECONDS`](../customization/system-tasks.html#env_RUNNER_PRUNE_SECONDS) | `60` (da 10 a 3600) | Pulizia job terminati |

Un valore che non è un cron valido, o secondi fuori dai limiti, impostato a mano nell'ambiente, viene ignorato a favore del valore predefinito.

### CONFIG_SEED_RELOAD_SECONDS
{: .no_toc }

Prima della 7.8.0 il config seed veniva controllato ogni [`CONFIG_SEED_RELOAD_SECONDS`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_SECONDS).
Questa variabile è deprecata dalla 7.8.0, a favore di `CONFIG_SEED_RELOAD_CRON`, e sarà rimossa nella 8.0. Finché
`CONFIG_SEED_RELOAD_CRON` non è impostata, viene ancora letta come un cron, con un avviso nel log all'avvio:

| `CONFIG_SEED_RELOAD_SECONDS` | Letta come |
|---|---|
| `60` | `* * * * *`, ogni minuto |
| Un multiplo di 60 fino a `3600` | Ogni tanti minuti, ad esempio `*/5 * * * *` per `300` (`3600` si legge `0 * * * *`) |
| Un numero sotto 60 che divide 60 | Ogni tanti secondi |
| `0` | La ricarica è disattivata |
| Qualsiasi altro numero | Il più vicino di questi, che il log indica |

La scheda **Pianificazione** dell'attività mostra quel cron con la riga *Da CONFIG_SEED_RELOAD_SECONDS, deprecata; un cron salvato qui la
sostituisce.* **Salva** scrive `CONFIG_SEED_RELOAD_CRON`, che da quel momento prevale sulla vecchia variabile.
