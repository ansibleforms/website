---
layout: default
title: Modifica nel designer
parent: Workflow
nav_order: 2
translated_from: dd4e281ec223f5c4995d804e774ac49e4d5934da
---

# Modifica nel designer
{: .no_toc }

Disegnare un workflow, e provarlo senza eseguire nulla
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La sezione Workflow

**Designer > Workflow** elenca i file di workflow in un esploratore dei file, con le schede YAML, Visuale e Anteprima di ogni
sezione del [designer](../designer/).

- **Il pulsante `+`** nella barra degli strumenti crea un file di workflow, con un workflow vuoto da cui partire.
- **YAML** mostra il file così com'è scritto. I commenti e l'ordine delle chiavi vengono mantenuti anche dalle altre schede.
- **Visuale** disegna ogni workflow del file come un grafo, con il nome e la descrizione sopra. Un file con due workflow
  li mostra entrambi, uno sotto l'altro.
- **Anteprima** è una prova a vuoto del workflow: vedi [Provarlo](#trying-it-out).

I problemi sono elencati sopra il grafo, ognuno con un link che apre lo YAML alla sua riga: un collegamento a un nodo che non
esiste, un ciclo, un playbook, inventario, credenziale, runner o repository che il designer non conosce.

---

## Il grafo

Il grafo si legge da sinistra a destra, da **START** agli ultimi nodi. Ogni nodo mostra il suo identificatore e, sotto, cosa
esegue; i collegamenti sono colorati in base a ciò che li fa scattare, come dice la legenda dentro il grafo: in caso di successo, in caso di errore,
sempre.

- **Fai clic su START** per aggiungere un primo nodo: un nodo senza genitore, che gira appena parte il workflow.
- **Fai clic su un nodo** per modificarlo.
- **Fai clic su un collegamento** per cambiare ciò che lo fa scattare, o per rimuoverlo.

---

## Aggiungere un nodo

Un nuovo nodo si aggiunge con un wizard: **Nuovo nodo in caso di successo**, **Nuovo nodo in caso di errore** o **Nuovo nodo sempre** su un nodo
esistente, oppure START per il primo.

1. **Cosa esegue**: l'identificatore del nodo, **Esegue** (che tipo di nodo è e, per un nodo playbook, dove gira)
   e cosa esegue: un playbook o un template o job, un workflow, il nome e il timeout di un'approvazione, o un repository. Vedi
   [Dove gira un nodo](#where-a-node-runs).
2. **Come viene eseguito**: le impostazioni di esecuzione: l'inventario, le credenziali, il limite, i tag, la verbosità,
   la modalità check e diff, la condizione (**Gira quando**) e **Valori da** (vedi [il file di workflow](file.html#run-settings)).
3. **Dove va**: il nodo dopo il quale gira, e in quale caso.

**Crea** aggiunge il nodo allo YAML.

---

## Dove gira un nodo

**Esegue** dice cosa esegue un nodo e dove, in un unico elenco: **Playbook sull'RTE**, **Template su AWX**, **Template su
Semaphore**, **Job su Rundeck**, **Job su Jenkins**, poi **Workflow**, **Approvazione** e **Pull di repository**.

| Esegue | Il campo sotto | Runner |
|---|---|---|
| **Playbook sull'RTE** | **Playbook**: un playbook del designer | **L'RTE predefinito**, oppure un runner RTE per nome |
| **Template su AWX** (AAP e Ascender compresi) | **Template**: il nome del template, digitato | i runner AWX, ognuno con la sua variante |
| **Template su Semaphore** | **Template**: il nome del template, digitato | i runner Semaphore |
| **Job su Rundeck** o **Job su Jenkins** | **Job**: il nome del job, digitato | i runner Rundeck o Jenkins |

- **Playbook sull'RTE** è sempre proposto; gli altri solo quando l'istanza ha un [runner](../runners.html) di quel tipo.
- **Runner** elenca solo i runner di quel tipo, con quello predefinito contrassegnato e preselezionato (o il primo per nome).
- Scegliere un altro posto azzera ciò che il nodo esegue, che va quindi scelto di nuovo.
- Un nodo il cui runner non è noto al designer mostra **Template o job su** quel runner.

Il file di workflow non cambia: un nodo del genere è un nodo `job_template` con un `runner:` (vedi
[il file di workflow](file.html#run-settings)).

---

## Modificare un nodo

Facendo clic su un nodo si apre la sua finestra di dialogo, con quattro schede:

| Scheda | Cosa contiene |
|---|---|
| **Cosa esegue** | L'identificatore, **Esegue**, cosa esegue e, per un nodo playbook, il runner |
| **Come viene eseguito** | Le impostazioni di esecuzione; le credenziali si scelgono da un elenco, ognuna aggiunta con `+` |
| **Esegue dopo** | I collegamenti verso il nodo, e **Tutti i genitori devono convergere** |
| **Esegue dopo di sé** | I collegamenti in uscita, con **Collega a un nodo esistente:** e **Collega a un nuovo nodo:** |

**Mostra in YAML** apre lo YAML sul nodo, e **Rimuovi nodo** lo rimuove insieme ai suoi collegamenti. Ogni modifica viene scritta subito
nello YAML; **Salva** salva il file.

---

## Provarlo

La scheda **Anteprima** fa scorrere il workflow senza avviare nulla, secondo le regole di AWX.

Ogni nodo parte come riuscito. Fai clic su un nodo per farlo fallire, e fai di nuovo clic per farlo riuscire; il grafo mostra allora
quali nodi verrebbero eseguiti, quali no, e se il workflow fallirebbe. **Ripristina** fa riuscire di nuovo tutti i nodi.
