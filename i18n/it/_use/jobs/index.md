---
layout: default
title: Job
nav_order: 3
has_children: true
has_toc: false
redirect_from:
  - /jobs.html
permalink: /jobs/
translated_from: 5ebe08c87f55b79169432884bb849e27dde03cb2
---

# Job
{: .no_toc }

Seguire, interrompere, rilanciare, approvare ed eliminare i job avviati dai tuoi moduli
{: .fs-6 .fw-300 }

---

Per chiunque avvii moduli: che cos'è un job, dove trovarlo, e chi può vederlo.

---

## Che cos'è un job

Un job è un'esecuzione di un modulo: AnsibleForms lo registra con il suo stato, le extravars e l'output non appena il modulo viene inviato.

Ogni job conserva:

* il **modulo** che ha eseguito e l'**utente** che l'ha avviato (con il tipo di utente, come `local` o `ldap`);
* il suo **tipo di job** e il suo **stato**, e l'**ora di inizio** e l'**ora di fine**;
* il suo **output**, le extravars e le credenziali con cui è girato, e i valori dei campi inseriti nel modulo.

Un modulo multistep crea un job per il modulo e un job per ogni passo. I passi sono collegati al job principale ed elencati sotto di esso.

Gli stessi job si possono avviare, seguire e gestire tramite la [REST API](../api/jobs.html).

---

## La pagina Job

Il link **Job** nell'intestazione apre l'elenco di tutti i job, dal più recente (`/jobs/all`). La pagina e il suo link sono visibili agli utenti
il cui ruolo imposta l'[opzione di ruolo](../config/roles.html#role-options) `showJobs`.

![L'elenco dei job](../assets/screenshots/job-log.jpg)

Il menu a sinistra ordina i job nel tempo, con il numero di job in ogni voce; una voce di stato filtra l'elenco su quello stato:

| Sezione | Voce del menu | Mostra |
|---|---|---|
| **Passato** | **Riuscito** | I job con stato `success` |
| | **Fallito** | I job con stato `failed` |
| | **Interrotto** | I job con stato `aborted` |
| | **Rifiutato** | I job con stato `rejected` |
| | **Abbandonato** | I job con stato `abandoned` |
| **Presente** | **In esecuzione** | I job con stato `running` |
| | **In attesa di approvazione** | I job con stato `approve`; il contatore diventa arancione quando uno è in attesa |
| **Futuro** | **Pianificati** | La pagina [Pianificazioni](schedules.html) (opzione di ruolo `allowScheduledJobs`) |
| | **Salvati** | La pagina [Job salvati](stored-jobs.html) (opzione di ruolo `allowStoredJobs`) |

Il menu non ha una voce per tutti i job: il link **Job** dell'intestazione li mostra tutti, compresi i job `warning`.

Sopra la tabella, sulla riga del titolo:

* la **casella di ricerca** mantiene i job le cui colonne visibili contengono il testo (senza distinzione tra maiuscole e minuscole), o uno dei cui passi lo ha come id
  o come destinazione;
* **Elimina** (con il numero di job selezionati) elimina insieme i job selezionati nella prima colonna;
* **Colonne** mostra o nasconde le colonne `id`, `modulo`, `tipo job`, `stato`, `ora di inizio`, `ora di fine`, `durata` e `utente`;
  la durata di un job in esecuzione aumenta in tempo reale;
* **Aggiorna** ricarica l'elenco.

L'elenco carica i job più recenti, tanti quanti ne indica l'impostazione [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE)
(**Impostazioni > Sistema > Generale**, scheda **Job**, `1000` per impostazione predefinita); le sue pagine, la ricerca e i filtri coprono quei job.

Ogni colonna si può ordinare e ha un proprio campo di filtro. Un job multistep ha una freccia subito prima del suo `modulo` che espande
i suoi passi; un clic sul resto di una riga apre il job.

La campanella nell'intestazione conta i job in attesa della tua approvazione e apre l'elenco su **In attesa di approvazione**. Per gli utenti che possono vedere
i runner, conta anche i [runner in attesa di approvazione](../runners/registration.html#approving-an-rte), gli RTE che hanno chiesto di unirsi,
e apre **Connessioni > Runner** quando sono in attesa solo dei runner. Se sono in attesa entrambi, apre un menu, **Job in attesa di approvazione** e
**Runner in attesa di approvazione**, ognuno con il suo contatore.

---

## Chi vede quali job

I job che un utente vede dipendono dai suoi ruoli:

| Utente | Vede |
|---|---|
| Admin (ruolo `admin`) | Tutti i job |
| Opzione di ruolo `showAllJobLogs` | Tutti i job |
| Opzione di ruolo `manageAllJobs` (dalla 7.3.0) | Tutti i job, e può interromperli, eliminarli e rilanciarli |
| Qualsiasi altro utente | I propri job, e i job in attesa di un'approvazione che nomina uno dei suoi ruoli |

Fino alla 7.2, ogni utente poteva aprire qualsiasi job in attesa di approvazione, extravars e output compresi; dalla 7.3.0 possono farlo solo il suo proprietario e i suoi
approvatori. Vedere un job non concede tutte le azioni su di esso: interrompere, eliminare e rilanciare il job di un altro utente richiede un amministratore o
`manageAllJobs`, e `showAllJobLogs` mostra soltanto i job. Per eliminare serve anche `allowJobDeletion` e per rilanciare `allowJobRelaunch`.

---

## In questa sezione

Ogni argomento ha una pagina dedicata:

| Pagina | Cosa tratta |
|---|---|
| [Stati e tipi](statuses.html) | Tutti gli stati che un job può avere, e i tipi di job |
| [Seguire un job](following.html) | Output in diretta, extravars, filtri e download |
| [Azioni sui job](actions.html) | Avviare, interrompere, rilanciare, approvare o rifiutare, ed eliminare un job |
| [Pianificazioni](schedules.html) | Eseguire un modulo più tardi o secondo una pianificazione cron, e gestire tutte le pianificazioni |
| [Job salvati](stored-jobs.html) | Conservare i dati di un modulo per ricaricarli più tardi |
| [Pulizia](cleanup.html) | I job interrotti da un riavvio, e per quanto tempo vengono conservati i job terminati |
