---
layout: default
title: Azioni sui job
parent: Job
nav_order: 3
translated_from: 6014f8e14db84fca0d144f1d64232e50aa6cbec9
---

# Azioni sui job
{: .no_toc }

Avviare, interrompere, rilanciare, approvare o rifiutare, ed eliminare un job
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Avviare un job

Ogni job parte da un modulo. Aprilo dalla pagina **Moduli**, compila i campi e premi **Invia**:

1. Il modulo viene validato nel browser, e i valori dei campi vengono inviati al server.
2. Il server crea il job e ne restituisce il numero; vengono eseguite le azioni [`onSubmit`](../forms/job-status-action.html) del modulo.
3. L'output del job compare sotto il modulo e si aggiorna ogni due secondi finché il job non termina.

Il job compare anche nella pagina **Job**, dove puoi seguirlo in seguito.

### Chi può avviare un modulo

Un modulo è elencato, e si può avviare, per gli utenti che hanno uno dei [ruoli](../config/roles.html) della sua lista `roles`.
Il ruolo `default`, che ogni utente ha, rende un modulo disponibile a chiunque possa accedere.

### Prima di inviare

La barra sopra i campi offre alcuni strumenti, ognuno visibile solo quando il tuo ruolo lo consente:

| Pulsante | Cosa fa | Opzione di ruolo |
|---|---|---|
| **Mostra variabili extra** | Mostra in anteprima le extravars che il job riceverà, mentre compili i campi | `showExtraVars` |
| **verbose** | Esegue il job in modalità verbose | `allowVerboseMode` |
| **Carica da archivio** | Compila i campi da un [job salvato](stored-jobs.html) | `allowStoredJobs` |
| **Ricarica questo modulo** | Carica di nuovo il modulo, con i suoi valori predefiniti | nessuna |

### Scelte al momento dell'avvio

Un modulo può permettere ai suoi utenti di scegliere alcune opzioni di Ansible quando lo avviano, dichiarando un campo con un nome riservato. Il
valore del campo prevale allora sull'impostazione del modulo stesso:

| Nome del campo | Prevale su | Tipo di campo tipico |
|---|---|---|
| `__check__` | La modalità check, una prova a vuoto che non modifica nulla | `checkbox` |
| `__diff__` | La modalità diff, che mostra cosa cambierebbe | `checkbox` |
| `__limit__` | Gli host su cui gira il playbook | `text` o `enum` |
| `__tags__` | I tag da eseguire | `text` o `enum` |
| `__inventory__` | L'inventario | `enum` |
| `__playbook__`, `__template__` | Il playbook, o il template AWX / AAP | `enum` |

Per esempio, un modulo che offre una prova a vuoto e un limite sugli host:

```yaml
fields:
  - name: __check__
    type: checkbox
    label: Dry run (check mode)
  - name: __limit__
    type: text
    label: Limit to these hosts
```

Il server accetta questi nomi solo da un modulo che li dichiara come campi, quindi un avvio dall'API non può aggiungerli
da solo. Le proprietà su cui prevalgono sono descritte in [Moduli Ansible](../forms/ansible.html) e [Moduli AWX](../forms/awx.html).

### Cosa può bloccare un avvio

Un avvio non diventa sempre subito un job in esecuzione:

* **Campi non validi** : il modulo non viene inviato, e ogni campo che non supera la validazione mostra il motivo.
* **Validazione all'avvio** : con la [validazione all'avvio](../launch-validation/) impostata su `enforce`, il server controlla di nuovo i valori
  e rifiuta un avvio che viola le regole del modulo.
* **Approvazione** : un modulo con un [punto di approvazione](../forms/approval.html) crea il job, che poi resta in attesa con stato
  `approve`; vedi [Approvare o rifiutare un job](#approve-or-reject-a-job).

Quando il job termina, le [notifiche](../forms/notifications.html) del modulo inviano le loro email e i messaggi sui canali, e vengono eseguite le sue azioni
sullo stato del job.

### Altri modi per avviare un job

Un modulo può avviare un job anche senza che una persona prema **Invia**:

| Avviato da | Come | Pagina |
|---|---|---|
| Esecuzione posticipata o pianificazione cron | **Esegui più tardi (una volta)** o **Pianifica (ricorrente)** accanto a **Invia** | [Pianificazioni](schedules.html) |
| Uno script o una pipeline | `POST /api/v2/job` con un token API | [Job nella REST API](../api/jobs.html) |
| Un agente IA | Lo strumento `launch_job` del server MCP | [Strumenti MCP](../mcp/tools.html) |
| Una conversazione | L'assistente chat compila il modulo e lo avvia | [Assistente chat](../chat/) |
| Un job precedente | **Rilancia**, più sotto | [Rilanciare un job](#relaunch-a-job) |

---

## Interrompere un job

**Interrompi** nel menu della riga (⋮) dell'elenco, o **Interrompi job** nella pagina del job, ferma un job con stato `running`. Dopo la conferma,
AnsibleForms contrassegna il job per l'interruzione:

* **`ansible`**: l'RTE ferma il processo del playbook (con tutti i suoi worker), e il job termina come `aborted` con
  `... was aborted by the operator`. Un job ancora in attesa di un RTE libero viene interrotto prima di partire.
* **Un job di template** (AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins): AnsibleForms chiede al runner di annullare o fermare
  il job, e il job termina come `aborted`. Quando il runner rifiuta, l'output mostra `Abort request denied`, seguito da
  `reverting abort request`, e il job continua a girare. Una build Jenkins ancora in coda viene tolta dalla coda.
* **`workflow`**: i job dei nodi in esecuzione vengono interrotti e non parte più nulla (vedi
  [Eseguire un workflow](../workflows/running.html#abort)).
* **`multistep`**: i passi non ancora partiti vengono saltati (`skipping: [Abort is requested]`), e il job principale
  termina come `aborted`. Un passo già in esecuzione è un job a sé: aprilo e interrompilo per fermare anche quello.

Puoi interrompere i tuoi job; un amministratore, o dalla 7.3.0 un utente il cui ruolo imposta `manageAllJobs`, può interrompere qualsiasi job. `showAllJobLogs` permette a un
utente di vedere i job degli altri utenti, non di interromperli.

---

## Rilanciare un job

**Rilancia** nel menu della riga (⋮) dell'elenco, o **Rilancia job** nella pagina del job, avvia un nuovo job a partire da uno terminato. È proposto su qualsiasi
job che non sia né `running` né in attesa di approvazione, agli utenti il cui ruolo imposta l'opzione di ruolo `allowJobRelaunch`.

La finestra di dialogo offre:

* **Rilancia**: esegue di nuovo il job con i valori con cui era girato, come nuovo job a tuo nome.
* **Modalità verbosa**: rilancia in modalità verbose; compare con l'opzione di ruolo `allowVerboseMode`.
* **Modifica i valori prima di rilanciare**, poi **Modifica e rilancia**: apre il modulo precompilato con i valori del job, così puoi
  modificarli prima di inviarlo.

Un rilancio richiede inoltre che il modulo lo consenta (`allowRelaunch`, true per impostazione predefinita) e che il job sia **tuo**, a meno che
tu non sia un amministratore o, dalla 7.3.0, abbia `manageAllJobs`; `showAllJobLogs`, che fino alla 7.2 permetteva di rilanciare qualsiasi job, ora non lo fa più. Come un rilancio viene controllato rispetto alle regole del modulo, e perché un modulo con un
campo password può rifiutarlo, è descritto in [Rilancio](../launch-validation/relaunching.html).

### Rilanciare con dati precompilati

**Modifica e rilancia** apre il modulo con il parametro URL `prefillJobId`, che puoi usare anche in un tuo link:

```text
https://af.example.com/form?form=New%20Virtual%20Machine&prefillJobId=61
```

Il modulo carica i valori dei campi salvati con il job `61` e mostra `Modulo precompilato con i dati del job precedente #61`.
Inviarlo avvia un nuovo job, controllato come qualsiasi altro avvio. La precompilazione segue le stesse regole di un rilancio:

* **I campi password non vengono mai salvati**, quindi non vengono mai precompilati: inseriscili di nuovo. Nemmeno le costanti vengono salvate.
* Serve l'opzione di ruolo `allowJobRelaunch`, e il job deve essere tuo (oppure sei un amministratore o hai `manageAllJobs`).
* Un modulo con `allowRelaunch: false` non può essere rilanciato né precompilato:

```yaml
- name: New Virtual Machine
  type: ansible
  playbook: create-vm.yaml
  allowRelaunch: false
```

Un job precedente al salvataggio dei valori dei campi non può essere precompilato, e il modulo mostra invece un errore:

```text
No saved form data found for job <id>. This job may have been created before the relaunch feature was enabled.
```

---

## Approvare o rifiutare un job

Un job con un [punto di approvazione](../forms/approval.html) si ferma con stato `approve` e resta in attesa. È elencato nella pagina Job dei
suoi approvatori, gli utenti con uno dei ruoli dell'approvazione, così possono trovarlo; dalla 7.3.0 gli altri utenti non lo vedono più.

**Esamina approvazione** è proposto agli amministratori e agli utenti che hanno uno dei ruoli dell'approvazione: un clic sulla riga del job,
**Esamina approvazione** nel menu della riga, o il pulsante **Esamina approvazione** nella pagina del job. La finestra di dialogo mostra il
messaggio dell'approvazione, con i valori del job inseriti (o una riga generica se non ce n'è uno), e il modulo, l'id del job, chi l'ha avviato e
quando, con un link al job; **Rifiuta** e **Approva** rispondono:

* **Approva**: il job prosegue e il suo stato torna a `running`.
* **Rifiuta**: il job termina come `rejected`, e il suo output registra `rejected by <username>`.

Un job in attesa di approvazione non si può rilanciare né eliminare dalla pagina Job; prima approvalo o rifiutalo.

Dalla 7.3.0 l'utente che ha avviato un job non può approvarlo, così lo esamina sempre una seconda persona, anche se può comunque rifiutarlo per
ritirarlo. Un amministratore può sempre approvare, compresi i propri job. Un modulo il cui punto di approvazione imposta
[`allowSelf: true`](../forms/approval.html#approving-your-own-job) permette anche a chi l'ha avviato di approvare il proprio job.

---

## Eliminare un job

**Elimina** nel menu della riga (⋮) dell'elenco, o **Elimina job** nella pagina del job, elimina un job con il suo output dopo la conferma.
Eliminare un job multistep elimina anche i suoi passi. Per eliminare più job insieme, selezionali nella prima colonna dell'elenco e
fai clic su **Elimina (n)** sopra di essa.

Puoi eliminare i tuoi job. Gli amministratori e, dalla 7.3.0, gli utenti con l'opzione di ruolo `manageAllJobs` possono eliminare qualsiasi job; `showAllJobLogs`
non lo permette più. Un ruolo che imposta `allowJobDeletion: false` non elimina alcun job, nemmeno i propri, così lo storico dei job resta completo. Nella pagina del
job il pulsante è nascosto mentre il job è in esecuzione o in interruzione (tranne per gli amministratori e `manageAllJobs`) e mentre attende l'approvazione; nell'elenco, la
voce del menu e la casella di selezione sono in grigio per un job che non puoi eliminare.
