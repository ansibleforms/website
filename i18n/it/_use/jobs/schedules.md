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
translated_from: 57383a13d04c8157937b3c6caa33ad7af84c93b7
---

# Pianificazioni
{: .no_toc }

Eseguire un modulo più tardi, secondo un cron o una rrule, e gestire tutte le pianificazioni
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
le azioni di pianificazione creano una voce in **Job > Pianificati**; **Salva** crea una voce nella pagina **Job salvati**. La
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
in quel momento, scritte in YAML; ogni esecuzione usa quella copia, quindi modificala nella pagina della pianificazione per cambiare ciò che riceve il job. Per
temporizzarla invece con una rrule, o darle una fine, apri la sua pagina e cambia la sua scheda **Pianificazione**.

![Pianificazioni](../assets/screenshots/schedules.jpg)

---

## L'elenco delle pianificazioni

**Job > Pianificati** elenca tutte le pianificazioni e richiede `allowScheduledJobs`; una riga apre la pagina della pianificazione.

| Colonna | Mostra |
|---|---|
| **Abilitato** | Se la pianificazione gira secondo la propria tempistica |
| **Nome** e **Modulo** | La pianificazione, e il modulo che esegue |
| **Pianificazione** | La sua tempistica in linguaggio corrente, come *At 02:00 AM*; passaci sopra per vedere il cron o la regola stessa |
| **Ultima esecuzione** | Quando ha girato l'ultima volta |
| **Prossima esecuzione** | Quando gira la prossima volta, un trattino quando non ha esecuzioni in programma |
| **Stato** | Il suo ultimo avvio: se ha avviato un job, o **Avvio…** mentre ne avvia uno |

La colonna **Pianificazione** indica una pianificazione una tantum come **Esecuzione una tantum**. Una rrule che il linguaggio corrente non sa descrivere viene
mostrata così com'è. Il menu di ogni riga offre:

| Azione | Cosa fa |
|---|---|
| **Modifica** | Apre la pagina della pianificazione |
| **Esegui ora** | Esegue subito la pianificazione, senza attendere la sua tempistica |
| **Attiva** o **Disattiva** | Attiva o disattiva la pianificazione, a seconda del caso, come mostra la sua colonna **Abilitato** |
| **Elimina** | Rimuove la pianificazione; smette subito di girare |

**Nuova pianificazione** ne crea una da zero, in tre passaggi: **Dettagli** (il suo **Nome**, la **Descrizione** e il **Modulo**),
**Pianificazione** (la sua tempistica e la sua fine) e **Variabili extra**. **Variabili extra** è YAML senza un modulo che lo compili, quindi aggiungi tu i
valori di cui il playbook ha bisogno, come dizionario (coppie chiave: valore).

---

## La pagina di una pianificazione

La pagina di una pianificazione riprende i passaggi della sua finestra di dialogo come schede, con **Esegui ora**, **Elimina** e **Salva** in alto a destra.

| Scheda | Cosa contiene |
|---|---|
| **Dettagli** | La sua origine, **Nome**, **Descrizione**, **Modulo**, poi **Ultimo avvio**, **Job avviato**, **Ultima esecuzione**, **Prossima esecuzione** e **Abilitato** |
| **Pianificazione** | Come è temporizzata (vedi [La tempistica di una pianificazione](#timing-a-schedule)) e come termina (vedi [La fine di una pianificazione](#the-end-of-a-schedule)) |
| **Variabili extra** | Lo YAML che riceve il job; per una pianificazione tenuta in git, anche i prompt del suo file |
| **Esecuzioni** | I job che ha avviato, il più recente per primo; una riga apre il job |

**Ultimo avvio** dice com'è andato il suo ultimo avvio, come stato: uno fallito ne dice il motivo al passaggio del mouse. **Job avviato** rimanda al
job che ha avviato, così puoi aprirlo e vedere come è finito. La scheda **Esecuzioni** elenca i job che puoi vedere, con l'utente con cui hanno girato,
il loro inizio, la fine, la durata e lo stato; il loro numero è nel titolo della scheda.

L'interruttore **Abilitato** mette in pausa una pianificazione senza eliminarla, e viene salvato con **Salva**, come ogni campo della pagina. Una
pianificazione disattivata resta nell'elenco con le sue impostazioni, ma non gira da sola: una ricorrente salta le sue esecuzioni, e una
una tantum attende oltre il suo momento finché non viene riattivata. **Esegui ora** la esegue comunque su richiesta. Una nuova pianificazione è attiva.

---

## La tempistica di una pianificazione

Una pianificazione è temporizzata in uno di tre modi, scelto sotto **Tipo di pianificazione** nella sua scheda **Pianificazione**; la rrule è nuova nella 7.8.0.

| Pianificazione | Gira | Vedi |
|---|---|---|
| **Cron** | In modo ricorrente, secondo un'espressione cron nel fuso orario del server | [Espressioni cron e fuso orario](#cron-expressions-and-time-zone) |
| **Regola di ricorrenza (rrule)** | In modo ricorrente, secondo una regola iCal nel proprio fuso orario | [Regole di ricorrenza](#recurrence-rules) |
| **Esecuzione una tantum** | Una volta, a una data e un'ora | [Come gira una pianificazione](#how-a-schedule-runs) |

Con un cron o una rrule, l'editor mostra le prossime tre esecuzioni, e le ferma alla fine della pianificazione. Cambiare la tempistica
mantiene solo quella scelta: una pianificazione passata da un cron a una rrule perde il suo cron.

---

## Espressioni cron e fuso orario

Una pianificazione ricorrente può accettare un'espressione cron standard a 5 campi: minuto, ora, giorno del mese, mese e giorno della settimana.

| Espressione | Gira |
|---|---|
| `*/15 * * * *` | Ogni 15 minuti |
| `0 2 * * *` | Ogni giorno alle 02:00 |
| `30 7 * * 1-5` | Dal lunedì al venerdì alle 07:30 |
| `0 0 1 * *` | A mezzanotte del primo giorno di ogni mese |

L'editor cron descrive l'espressione a parole, offre preimpostazioni e mostra in anteprima le prossime esecuzioni. Il server rifiuta
un'espressione che non può eseguire, o una che non può mai verificarsi. Altri esempi, e le funzionalità cron che l'editor non accetta, sono
nelle FAQ alla voce [Quali espressioni cron posso usare?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Le pianificazioni cron girano nel fuso orario del server, impostato con [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (predefinito `UTC`),
> non nel fuso orario del tuo profilo o del tuo browser. L'editor cron mostra in anteprima le prossime esecuzioni in quello stesso fuso.

---

## Regole di ricorrenza

Dalla 7.8.0 una pianificazione ricorrente può accettare invece una regola di ricorrenza iCal (rrule), che gira in un fuso orario tutto suo.

```text
DTSTART;TZID=Europe/Brussels:20261020T020000 RRULE:FREQ=DAILY;INTERVAL=1
DTSTART:20261019T060000Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO
DTSTART;TZID=America/New_York:20261101T073000 RRULE:FREQ=MONTHLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1
```

La prima gira ogni giorno alle 02:00 a Bruxelles, la seconda ogni lunedì alle 06:00 UTC, la terza l'ultimo giorno feriale di
ogni mese alle 07:30 a New York. Una regola sta su una riga, con le sue parti separate da spazi:

| Parte | Cosa dice |
|---|---|
| `DTSTART` | La prima esecuzione, con un `TZID` (una zona IANA come `Europe/Brussels`, o un offset come `UTC+5` o `GMT-3`), o in UTC terminando con `Z` |
| `RRULE` | Quando si ripete: `FREQ` con un `INTERVAL` di almeno 1, e `BYDAY`, `BYHOUR`, `BYMONTHDAY`, `COUNT`, `UNTIL` … secondo necessità; una o più |
| `EXRULE` | Facoltativa: una regola di esecuzioni da saltare |

Il server rifiuta una regola che non può eseguire, e dice perché:

- nessun `DTSTART`, più di uno, o uno senza fuso orario, e `EXDATE` o `RDATE`;
- una regola senza `INTERVAL`, `FREQ=SECONDLY`, `BYDAY` con un numero (`5MO`), o `COUNT` insieme a `UNTIL`;
- `COUNT` oltre 999, un numero `BYxxx` fuori dal suo intervallo (`BYHOUR` da 0 a 23, `BYSETPOS` da 1 a 366 o da -366 a -1 …), un `WKST`
  che non è un giorno della settimana, un `DTSTART` o `UNTIL` che non è una data reale (`20300230`), o una parte data due volte in una regola;
- una regola che non scatta mai: nessuna esecuzione nei 50 anni dopo il suo `DTSTART`, come `FREQ=HOURLY;INTERVAL=2;BYHOUR=1` a partire
  dalla mezzanotte, che incontra solo le ore pari.

L'editor è una casella di testo: una nuova rrule parte come ogni giorno a mezzanotte nel fuso orario del tuo browser. Dice subito perché una regola
verrebbe rifiutata, altrimenti mostra le sue prossime tre esecuzioni nel fuso della regola, o **Questa rrule non ha più esecuzioni in programma.** quando il suo
`UNTIL` o `COUNT` è passato. Un orario saltato da un cambio dell'ora legale gira quando l'orologio lo raggiunge (le 02:30 girano alle 03:30 la
notte in cui l'orologio passa dalle 02:00 alle 03:00), come fa un cron; un orario che l'orologio mostra due volte gira una volta, alla prima.

---

## La fine di una pianificazione

Dalla 7.8.0 una pianificazione temporizzata da un cron o da una rrule può terminare; sotto **Termina** nella sua scheda **Pianificazione**, scegli un'opzione.

| Termina | La pianificazione termina |
|---|---|
| **Mai** | Mai: il valore predefinito, e quello di ogni pianificazione precedente alla 7.8.0 |
| **In una data** | Alla data e all'ora scelte: nessuna esecuzione dopo |
| **Dopo** … **esecuzioni** | Una volta avviati in tutto quel numero di job, quelli elencati nella sua scheda **Esecuzioni**; il campo dice quanti finora |

**Quando termina**, viene disattivata (**Disattivala**, il valore predefinito) o eliminata (**Rimuovila**). L'attività di sistema **Fine delle pianificazioni**
applica le fini ogni minuto, e una pianificazione che raggiunge il suo numero di esecuzioni termina subito dopo l'ultima. L'`UNTIL` o il `COUNT`
propri di una rrule valgono comunque; la fine si aggiunge a essi.

Una pianificazione una tantum non ha fine: termina con la sua esecuzione. Il suo interruttore **Rimuovi dopo l'esecuzione**, attivo per impostazione predefinita,
la elimina dopo l'esecuzione; disattivato, la pianificazione viene disattivata dopo l'esecuzione e conservata con il suo esito.

---

## Come gira una pianificazione

Quando una pianificazione è dovuta, viene messa in coda, e il server avvia le pianificazioni in coda una alla volta, controllando la coda ogni 10 secondi.

- Le pianificazioni **ricorrenti** saltano un'esecuzione mentre quella precedente è ancora in coda o in esecuzione, così le esecuzioni non si sovrappongono mai.
- Le pianificazioni **una tantum** girano entro un minuto dal loro momento, poi vengono eliminate (o conservate, disattivate, quando **Rimuovi dopo
  l'esecuzione** è disattivato), anche quando vengono avviate con **Esegui ora**.
- **Stato** è `success` quando il job è stato avviato e `failed` quando non è stato possibile. Un `success` dice solo che il job è stato
  avviato: apri il job per vedere come è finito.

Una pianificazione creata con `allowScheduledJobs` gira come l'utente integrato `Schedule Service` (tipo `schedule`) con il
ruolo `admin`. Può eseguire qualsiasi modulo, qualunque sia l'accesso della persona che ha creato la pianificazione, e `ansibleforms_user` nelle
sue extravars descrive quell'utente. Un'[esecuzione programmata](#planned-runs) gira invece come l'utente che l'ha programmata.

Il job riceve anche un oggetto `schedule`, così un playbook sa che l'ha avviato una pianificazione:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  description: ''
  form: Cleanup servers
  one_time_run: null
```

Il suo `one_time_run` è il momento dell'esecuzione di una pianificazione una tantum, `null` per una ricorrente. Porta anche le altre impostazioni
della pianificazione, come `enabled` e `repository`, e `run_at`: lo stesso momento con il suo nome precedente alla 7.8.0 (deprecato, rimosso nella 8).

---

## Esecuzioni programmate

**Esegui più tardi (una volta)** da parte di un utente senza `allowScheduledJobs` crea un'esecuzione programmata: una pianificazione una tantum legata a quell'utente.

- **Quando viene programmata**, il server verifica che l'utente possa eseguire il modulo (i suoi `roles`), e la modalità verbose richiede
  `allowVerboseMode`. Un'esecuzione programmata è sempre una tantum; un'espressione cron o una rrule viene rifiutata.
- **Con la validazione all'avvio in `enforce`**, i valori dei campi vengono controllati quando viene programmata, così un'esecuzione che verrebbe rifiutata viene
  rifiutata mentre l'utente è ancora davanti allo schermo.
- **Quando gira**, il job gira come quell'utente, di sua proprietà, con gli stessi controlli di un avvio dal browser: i
  ruoli del modulo come sono in quel momento, le extravars riservate rimosse, e la validazione all'avvio. `ansibleforms_user` descrive l'utente.

Chi programma non vede **Job > Pianificati**, che richiede `allowScheduledJobs`; il job compare nel suo storico dei job. Un'esecuzione
programmata viene sempre rimossa dopo la sua esecuzione.

---

## Quando il modulo cambia

Una pianificazione fa riferimento al suo modulo per nome e lo esegue così com'è definito al momento di ogni esecuzione.

- **Il modulo viene modificato**: l'esecuzione successiva usa la nuova definizione (playbook, template, inventario) con le extravars salvate nella
  pianificazione. Il modulo non viene visualizzato, quindi nessun campo viene ricalcolato; modifica le variabili extra della pianificazione di conseguenza.
- **Il modulo viene rinominato o rimosso**: l'esecuzione fallisce, **Stato** diventa `failed` e **Ultimo avvio**, al passaggio del mouse, riporta
  `Failed to launch : No such form '<name>'`. Modifica la pianificazione e scegli il modulo giusto, oppure eliminala.

---

## I job pianificati nello storico dei job

Ogni esecuzione di una pianificazione crea un job normale, elencato nella pagina [Job](./) con `Schedule Service` come utente, oppure,
per un'esecuzione programmata, con l'utente che l'ha programmata.

Un job di `Schedule Service` non appartiene alla persona che ha creato la pianificazione, quindi è visibile solo agli amministratori e agli
utenti con `showAllJobLogs`; il job di un'esecuzione programmata è visibile anche al suo utente. La scheda **Esecuzioni** della pianificazione
elenca i job che ha avviato, e il suo **Job avviato** rimanda all'ultimo.

---

## Pianificazioni in un repository git

Dalla 7.8.0 le pianificazioni possono anche essere tenute in un repository git, come voci di una lista `controller_schedules:` nei suoi file YAML.

Al massimo un repository ha l'uso **Pianificazioni**: le sue voci vengono lette in **Job > Pianificati** a ogni pull, temporizzate da un
`cron`, una `rrule` o un `one_time_run`, e una pianificazione creata o modificata nell'app viene riscritta nel suo file, in attesa del
push del repository. Una pianificazione del genere mostra il suo file nella sua pagina, e la sua fine si limita sempre a disattivarla. Vedi
[Repository Git](../repositories/).

---

## Nell'API

Dalla 7.8.0 una pianificazione dell'API ha tre campi di tempistica, di cui esattamente uno impostato: `cron`, `rrule` o `one_time_run`.

| Campo | Contiene |
|---|---|
| `cron` | Un'espressione cron |
| `rrule` | Una regola di ricorrenza, su una riga |
| `one_time_run` | Il momento della sua unica esecuzione, un orario ISO 8601 con il suo offset o `Z` (`2026-11-15T22:00:00+01:00`) |
| `ends`, `end_at`, `end_count`, `end_action` | La sua fine: `never`, `date` o `count`, la sua data, il suo numero di esecuzioni, e `disable` o `remove` |
| `remove_after_run` | Una pianificazione una tantum: `false` la conserva, disattivata, dopo la sua esecuzione |

{: .warning }
> La coppia che l'API accettava prima della 7.8.0, `one_time_run: true` con `run_at`, è deprecata dalla 7.8.0 e rimossa nella 8. Viene
> ancora letta come `one_time_run` in quel momento, con un avviso nel log del server; `one_time_run: false` con un cron viene letto come
> quel cron.
