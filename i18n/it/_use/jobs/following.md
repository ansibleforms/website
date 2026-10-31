---
layout: default
title: Seguire un job
parent: Job
nav_order: 2
translated_from: 31962d9845c3241caca78025476d82f772e9d7a5
---

# Seguire un job
{: .no_toc }

Output in diretta, extravars, filtri e download
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Seguire un job

Facendo clic su un job si apre la sua pagina: il modulo del job come titolo, le sue azioni nell'intestazione e il suo output sotto.

![L'output di un job](../assets/screenshots/job-output.jpg)

Dalla 7.3.0 la pagina è fatta di schede, e ognuna si richiude sotto la propria intestazione:

| Scheda | Cosa mostra |
|---|---|
| **Riepilogo** | Il nome, lo stato e il tipo del job come intestazione, e sotto i suoi dati in una griglia di tre colonne (due, poi una, su una pagina stretta) |
| **Workflow** | Per un job di workflow, anche un job di workflow AWX o AAP, il suo grafo e il numero dei suoi nodi (vedi [Il grafo del workflow](#the-workflow-graph)) |
| **Output** | L'output del job e la sua barra degli strumenti |

Un job girato su AWX, AAP, Ascender, Jenkins, Semaphore o Rundeck mostra lì il suo numero come link alla sua pagina in quello strumento, aperta
in una nuova scheda. Il link resta salvato sul job, quindi funziona ancora quando il runner viene rinominato o rimosso in seguito.

La pagina si aggiorna in diretta: il server invia un evento ogni volta che un job viene avviato, cambia stato, scrive output o viene
eliminato, e la pagina rilegge il job, così l'output cresce man mano che il job lo scrive. L'elenco dei job si aggiorna allo stesso modo.
**Aggiorna** ricarica il job a mano.

Mentre sei alla fine dell'output, la pagina lo segue verso il basso man mano che arrivano nuove righe. Scorri verso l'alto per leggere una riga precedente
e la pagina resta dove sei: compare allora **Vai alle ultime** sopra la parte bassa dell'output, che diventa **Nuove righe** quando ne
sono arrivate altre. Fai clic, o scorri di nuovo fino alla fine, per seguire di nuovo le nuove righe. L'output nella pagina del modulo, dopo
**Invia**, e il [log del server](../production/logs.html) seguono le loro nuove righe allo stesso modo.

La barra degli strumenti dell'output contiene:

| Pulsante | Cosa fa |
|---|---|
| **Mostra variabili extra** | Mostra le extravars con cui è girato il job in un pannello sopra l'output, con un selettore **JSON** / **YAML** e **Copia** |
| **Mostra artefatti** | Mostra gli artefatti del job nello stesso pannello (vedi sotto) |
| **Mostra i parametri** | Prende il posto di **Mostra variabili extra** per un job Jenkins: i valori con cui è girato, i suoi parametri di build |
| **Mostra payload** | Prende il posto di **Mostra variabili extra** per un job Rundeck: il payload che gli è stato inviato |
| **Host e task** | Mostra gli host e i task di un playbook sopra il suo output (vedi [Host e task](#hosts-and-tasks)) |
| **Aggiorna** | Ricarica l'output |
| **Applica filtro** | Nasconde i task il cui nome corrisponde al filtro dell'output; **Rimuovi filtro** li mostra di nuovo |
| **Copia l'output** | Copia l'output come testo semplice, con o senza il filtro applicato |
| **Scarica l'output** | Scarica l'output come `ansibleforms-job-<id>.txt` |

**Mostra artefatti** è proposto per ogni job che non sia un job di template, come un playbook sull'RTE o un workflow (vuoto quando
i suoi playbook non hanno raccolto artefatti con `set_stats`), e per un job di template girato su AWX, AAP o Ascender. I job Semaphore, Rundeck
e Jenkins non hanno artefatti, quindi per loro non viene mai proposto.

A sinistra della barra degli strumenti, il pulsante **Comprimi tutto** richiude ogni sezione dell'output (ogni play e task) e diventa
**Espandi tutto**, che le riapre.

**Mostra variabili extra** richiede l'opzione di ruolo `showExtravars` e **Mostra artefatti** l'opzione di ruolo `showArtifacts` (vedi
[opzioni di ruolo](../config/roles.html#role-options)). I valori dei campi password e delle chiavi che corrispondono a
[`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) vengono mascherati.

Il filtro si imposta con [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT), `\[low\]` per
impostazione predefinita. Metti `[low]` nel nome di un task rumoroso, e **Applica filtro** nasconde quel task e le sue righe.

La pagina di un job multistep mostra ogni passo sotto il job principale, uno sotto l'altro, ognuno sotto una barra del titolo come
**Passo 1 · Prepare the server (id job 98)** con il suo stato. Fai clic su un titolo (o premi Invio o Spazio su di esso) per richiudere quell'output,
e di nuovo per riaprirlo. Anche i workflow AWX/AAP mostrano lo stato dei loro nodi.

I job di [workflow](../workflows/running.html#the-job) conservano l'output di ogni nodo nel proprio, sotto un'intestazione `WORKFLOW NODE` per
ogni nodo; disegnano il loro grafo, in diretta, e un clic su un nodo ne apre l'output.

---

## Cercare un testo nell'output

Dalla 7.3.0 la pagina del job ha una casella di ricerca, **Cerca nell'output**, sulla riga del titolo, a sinistra delle azioni del job.

Ogni punto dell'output in cui compare il testo viene evidenziato, a prescindere da maiuscole e minuscole, e la pagina si sposta sul primo. **Invio** va
al successivo, evidenziato più forte, e la barra degli strumenti indica quale su quanti (**2 di 4**), oppure **Non trovato**. La ricerca prima riapre l'output e
le sue sezioni, e mentre il job gira vengono cercate anche le nuove righe, senza spostare la pagina.

---

## Muoversi in un output lungo

Dalla 7.3.0 un output lungo, nella pagina del job e sotto un modulo dopo **Invia**, offre questi modi per percorrerlo:

| Controllo | Cosa fa |
|---|---|
| Intestazioni fisse | L'intestazione di una sezione (un nodo di workflow, il playbook del job, un passo di un job multistep) resta in alto mentre le sue righe scorrono |
| **2 falliti** | Conta i task falliti, escludendo gli errori che ad Ansible è stato detto di ignorare; ogni clic va al successivo, riaperto ed evidenziato. Senza task falliti, **1 errore** conta invece le righe di errore |
| Numeri di riga | Ogni numero di riga è un link alla sua riga, come `#L45` nell'indirizzo: aprire quell'indirizzo scorre fino alla riga e la evidenzia |
| Pulsanti su e giù | Compaiono in basso a destra quando la pagina è stata fatta scorrere, per tornare in cima o andare alla fine |
| **In esecuzione** e **Interrompi** | Mentre il job gira, la barra della pagina del modulo resta fissa in fondo alla finestra, e **Interrompi** lì ferma subito il job |

---

## Risultati dei task

Dalla 7.3.0 la riga del risultato di un host nell'output di un playbook apre quel risultato in una finestra di dialogo **Risultato del task**, come fa AWX.

La riga, il corpo del risultato che la segue (`=> { ... }`) e l'errore stampato prima di un risultato fallito si evidenziano come un unico blocco al passaggio del mouse, e un
clic apre la finestra di dialogo. Funziona nella pagina del job e sotto un modulo dopo **Invia**, per un playbook girato su un RTE 7.3.0 o
successivo, perché il risultato viene dagli stessi eventi di [Host e task](#hosts-and-tasks). La finestra di dialogo ha queste schede:

| Scheda | Cosa mostra |
|---|---|
| **Dettagli** | Lo stato, l'host, il play, il task, il modulo, l'elemento del ciclo, l'ora di avvio, la durata, il codice di uscita e il messaggio |
| **JSON** e **YAML** | L'intero risultato del modulo, colorato e con le righe numerate |
| **Output standard** ed **Errore standard** | Lo `stdout` e lo `stderr` del risultato, quando ci sono |

Dalla 7.5.0 l'intero risultato, e con esso le schede **JSON**, **YAML** e di output, viene salvato qualunque sia la verbosità del job, come su
AWX; un RTE precedente alla 7.5.0 lo salva solo in modalità verbose. Un task con `no_log` ha il risultato censurato da Ansible, gli argomenti
del modulo (`invocation`) e le chiavi proprie di Ansible `_ansible*` vengono esclusi, i valori delle chiavi che sembrano segreti vengono
mascherati, e un risultato viene troncato quando supera i 64 KB di JSON.

---

## Il grafo del workflow

Dalla 7.3.0 il grafo di un workflow in esecuzione scorre per tenere in vista il nodo in esecuzione.

Se sposti il grafo, resta dove l'hai messo, con un pulsante **Segui il nodo in esecuzione** per seguirlo di nuovo. Passando il mouse su un nodo
compare la sua scheda con il nome completo e il nodo e i suoi collegamenti vengono messi in risalto, con il resto del grafo sfumato. Il grafo ha i pulsanti **Adatta allo
schermo** e **Schermo intero**, e sotto un modulo dopo **Invia** un clic su un nodo ne apre l'output come nella pagina del job.

---

## Host e task

Dalla 7.3.0, un job di playbook girato su un RTE 7.3.0 o successivo registra i suoi eventi strutturati accanto all'output testuale: ogni play, task
e risultato per host, e il riepilogo finale. **Host e task**, nella barra degli strumenti dell'output, li mostra in un pannello sopra l'output, nella pagina del job e
sotto un modulo dopo **Invia**. Viene proposto quando il job ha degli eventi, e il pannello viene riletto ogni pochi secondi mentre il job gira:

| Vista | Cosa mostra |
|---|---|
| **Griglia** | Il riepilogo per host (ok, modificati, falliti, irraggiungibili, saltati, recuperati, ignorati), poi una griglia di host per task: ogni cella è colorata in base al risultato dell'host per quel task, con il messaggio e il tempo al passaggio del mouse, oppure *non eseguito* |
| **Cronologia** | Ogni task come una barra, lunga quanto il tempo impiegato dall'host più lento, con il suo tempo in secondi e il totale |

L'output testuale resta così com'è. Gli eventi vengono scritti dal plugin di callback `af_events` dell'RTE stesso, quindi il playbook non richiede modifiche.
