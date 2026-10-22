---
layout: default
title: Pianificazioni
parent: Job
nav_order: 4
redirect_from:
  - /schedules.html
  - /schedules/
  - /schedules/scheduling.html
  - /schedules/schedules-page.html
translated_from: 7ffab643975d7705375fbd02588c9db76e27f74f
---

# Pianificazioni
{: .no_toc }

Eseguire un modulo più tardi o secondo una pianificazione cron, e gestire tutte le pianificazioni
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Le azioni del modulo

Un modulo può fare di più che girare subito: il menu a tendina accanto al pulsante **Invia** contiene altre tre azioni.

| Azione | Cosa fa | Opzione di ruolo |
|---|---|---|
| **Pianifica (ricorrente)** | Crea una pianificazione che esegue il modulo secondo un'espressione cron | `allowScheduledJobs` |
| **Esegui più tardi (una volta)** | Crea una pianificazione che esegue il modulo una sola volta, alla data e all'ora che scegli | `allowPlannedJobs` |
| **Salva** | Salva i valori dei campi, per ricaricarli nel modulo più tardi | `allowStoredJobs` |

Un'azione la cui opzione di ruolo è disattivata non viene mostrata. Il modulo viene validato prima di ognuna di esse, come per **Invia**. Entrambe
le azioni di pianificazione creano una voce nella pagina **Pianificazioni**; **Salva** crea una voce nella pagina **Job salvati**. La
barra laterale della pagina [Job](./) le apre sotto **Futuro**, come **Pianificati** e **Salvati**. Le opzioni di ruolo sono descritte
in [Opzioni di ruolo](../config/roles.html#role-options).

{: .warning }
> Considera `allowScheduledJobs` un'opzione di livello admin. Le sue pianificazioni non appartengono all'utente che le ha create: ogni utente
> con l'opzione vede e può modificare tutte le pianificazioni. Una pianificazione del genere gira inoltre con diritti di admin, per qualsiasi modulo, qualunque sia
> l'accesso di chi l'ha creata. Concedila solo a ruoli di cui ti fideresti come amministratori.

{: .note }
> **Esegui più tardi (una volta)** richiede solo `allowPlannedJobs`. Per un utente senza `allowScheduledJobs`, pianifica un'esecuzione **come quell'
> utente**: il server verifica che l'utente possa eseguire il modulo, e il job gira come lui, di sua proprietà, quando arriva il momento
> (vedi [Esecuzioni programmate](#planned-runs)).

---

## Pianificare un modulo

Compila il modulo, poi apri il menu a tendina accanto a **Invia** e scegli una delle azioni di pianificazione.

- **Pianifica (ricorrente)** apre **Crea pianificazione**: inserisci un **Nome** e un'**Espressione Cron** (il valore predefinito, `0 0 * * *`,
  gira ogni giorno a mezzanotte), poi seleziona **Crea pianificazione**.
- **Esegui più tardi (una volta)** apre **Esegui più tardi**: inserisci un **Nome** e scegli la data e l'ora in **Esegui alle**, poi seleziona
  **Pianifica job**.

Il nome deve essere univoco tra tutte le pianificazioni. La pianificazione conserva il nome del modulo e una copia delle extravars prodotte dal modulo
in quel momento, scritte in YAML; ogni esecuzione usa quella copia, quindi modificala nella pagina **Pianificazioni** per cambiare ciò che riceve il job.

![Pianificazioni](../assets/screenshots/schedules.jpg)

---

## La pagina Pianificazioni

La pagina **Pianificazioni** elenca tutte le pianificazioni, con la colonna **Abilitato** dalla 7.3.0, e richiede `allowScheduledJobs`. Il menu di ogni riga offre:

| Azione | Cosa fa |
|---|---|
| **Modifica** | Cambia il nome, il tipo, l'espressione cron o l'ora di esecuzione, il modulo e le variabili extra |
| **Esegui ora** | Esegue subito la pianificazione, senza attendere la sua espressione cron o l'ora di esecuzione |
| **Attiva** o **Disattiva** | Attiva o disattiva la pianificazione, a seconda del caso, come mostra la sua colonna **Abilitato** (dalla 7.3.0) |
| **Elimina** | Rimuove la pianificazione; smette subito di girare |
| **Ultimo output** | Nella pagina della pianificazione, ciò che ha riportato l'ultima esecuzione, come il numero del job che ha avviato |

Qui si può anche creare una pianificazione da zero. Scegli il **Modulo**, poi spunta **Esecuzione una tantum** e imposta
**Esegui alle**, oppure lascialo vuoto e imposta una **Pianificazione** cron. **Variabili extra** è YAML senza un modulo che lo compili, quindi aggiungi tu i
valori di cui il playbook ha bisogno, come dizionario (coppie chiave: valore).

Il campo **Pianificazione** è un editor cron: descrive l'espressione a parole, offre preimpostazioni e mostra in anteprima le prossime
esecuzioni. Il server rifiuta un'espressione che non può eseguire, o una che non può mai verificarsi.

Dalla 7.3.0 ogni pianificazione ha un interruttore **Abilitato**, per metterla in pausa senza eliminarla. Una pianificazione disattivata resta nella pagina
con le sue impostazioni, ma non gira da sola: una ricorrente salta i suoi scatti cron, e una una tantum attende oltre il suo
**Esegui alle** finché non viene riattivata. **Esegui ora** la esegue comunque su richiesta. Una nuova pianificazione è attiva, e le pianificazioni
esistenti prima della 7.3.0 sono attive dopo l'aggiornamento.

---

## Espressioni cron e fuso orario

Una pianificazione ricorrente accetta un'espressione cron standard a 5 campi: minuto, ora, giorno del mese, mese e giorno della settimana.

| Espressione | Gira |
|---|---|
| `*/15 * * * *` | Ogni 15 minuti |
| `0 2 * * *` | Ogni giorno alle 02:00 |
| `30 7 * * 1-5` | Dal lunedì al venerdì alle 07:30 |
| `0 0 1 * *` | A mezzanotte del primo giorno di ogni mese |

Altri esempi, e le funzionalità cron che l'editor non accetta, sono nelle FAQ alla voce
[Quali espressioni cron posso usare?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Le pianificazioni cron girano nel fuso orario del server, impostato con [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (predefinito `UTC`),
> non nel fuso orario del tuo profilo o del tuo browser. L'editor cron mostra in anteprima le prossime esecuzioni in quello stesso fuso.

---

## Come gira una pianificazione

Quando una pianificazione è dovuta, viene messa in coda, e il server avvia le pianificazioni in coda una alla volta, controllando la coda ogni 10 secondi.

- Le pianificazioni **ricorrenti** saltano uno scatto mentre l'esecuzione precedente è ancora in coda o in esecuzione, così le esecuzioni non si sovrappongono mai.
- Le pianificazioni **una tantum** girano entro un minuto da **Esegui alle**, poi vengono eliminate, anche quando vengono avviate con **Esegui ora**.
- **Stato** è `success` quando il job è stato avviato e `failed` quando non è stato possibile. Un `success` dice solo che il job è stato
  avviato: apri il job per vedere come è finito.

Una pianificazione creata con `allowScheduledJobs` gira come l'utente integrato `Schedule Service` (tipo `schedule`) con il
ruolo `admin`. Può eseguire qualsiasi modulo, qualunque sia l'accesso della persona che ha creato la pianificazione, e `ansibleforms_user` nelle
sue extravars descrive quell'utente. Un'[esecuzione programmata](#planned-runs) gira invece come l'utente che l'ha programmata.

Il job riceve anche un oggetto `schedule` (con `id`, `name` e `form`), così un playbook sa che l'ha avviato una pianificazione:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  form: Cleanup servers
```

---

## Esecuzioni programmate

**Esegui più tardi (una volta)** da parte di un utente senza `allowScheduledJobs` crea un'esecuzione programmata: una pianificazione una tantum legata a quell'utente.

- **Quando viene programmata**, il server verifica che l'utente possa eseguire il modulo (i suoi `roles`), e la modalità verbose richiede
  `allowVerboseMode`. Un'esecuzione programmata è sempre una tantum; un'espressione cron viene rifiutata.
- **Con la validazione all'avvio in `enforce`**, i valori dei campi vengono controllati quando viene programmata, così un'esecuzione che verrebbe rifiutata viene
  rifiutata mentre l'utente è ancora davanti allo schermo.
- **Quando gira**, il job gira come quell'utente, di sua proprietà, con gli stessi controlli di un avvio dal browser: i
  ruoli del modulo come sono in quel momento, le extravars riservate rimosse, e la validazione all'avvio. `ansibleforms_user` descrive l'utente.

Chi programma non vede la pagina **Pianificazioni**, che richiede `allowScheduledJobs`; il job compare nel suo storico dei job.

---

## Quando il modulo cambia

Una pianificazione fa riferimento al suo modulo per nome e lo esegue così com'è definito al momento di ogni esecuzione.

- **Il modulo viene modificato**: l'esecuzione successiva usa la nuova definizione (playbook, template, inventario) con le extravars salvate nella
  pianificazione. Il modulo non viene visualizzato, quindi nessun campo viene ricalcolato; modifica le variabili extra della pianificazione di conseguenza.
- **Il modulo viene rinominato o rimosso**: l'esecuzione fallisce, **Stato** diventa `failed` e **Ultimo output** riporta
  `Failed to launch : No such form '<name>'`. Modifica la pianificazione e scegli il modulo giusto, oppure eliminala.

---

## I job pianificati nello storico dei job

Ogni esecuzione di una pianificazione crea un job normale, elencato nella pagina [Job](./) con `Schedule Service` come utente, oppure,
per un'esecuzione programmata, con l'utente che l'ha programmata.

Un job di `Schedule Service` non appartiene alla persona che ha creato la pianificazione, quindi è visibile solo agli amministratori e agli
utenti con `showAllJobLogs`; il job di un'esecuzione programmata è visibile anche al suo utente. L'**Ultimo output** della pianificazione indica il job che ha avviato, così puoi trovarlo nell'elenco.
