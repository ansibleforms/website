---
layout: default
title: Eseguire un workflow
parent: Workflow
nav_order: 3
translated_from: 536c898264f954c5239764f9d4f7a2f61ea40f9d
---

# Eseguire un workflow
{: .no_toc }

Avviare un workflow da un modulo, e seguirlo nella pagina dei job
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Il modulo

Un modulo di [tipo `workflow`](../forms/workflow.html) avvia un workflow, indicato con `workflow:` come si fa con un playbook: con
il suo **file** nella cartella dei workflow, con le sottocartelle (`team/deploy-app.yml`), oppure con il **nome** del workflow dentro
il file (`deploy-app`):

```yaml
- name: Deploy the app
  type: workflow
  workflow: team/deploy-app.yml
  roles:
    - admin
  fields:
    - name: app_name
      type: text
      default: orders-api
```

I campi del modulo arrivano a ogni nodo come extra vars, e lo stesso vale per le sue [`credentials`](../forms/workflow.html#workflow_credentials), con i nomi
che il modulo dà loro, come quelle di un modulo multistep arrivano ai suoi passi:

```yaml
- name: Provision NAS storage
  type: workflow
  workflow: nas.yml
  credentials:
    ontap: ontap_automation   # every node's playbook gets `ontap`
```

Le credenziali proprie di un nodo, impostate nel file di workflow, arrivano al suo playbook con il proprio nome e prevalgono su un nome usato da entrambi. Nella scheda Visuale di un modulo nel designer, **Workflow** è un elenco dei
file di workflow del designer.

Un nome di file da solo viene trovato anche in una sottocartella, quando un solo file ha quel nome. Due workflow con lo stesso nome bloccano un modulo che
lo indica per nome, e il designer avvisa quando salvi il secondo: rinominane uno, oppure indica il suo file. Un workflow che non si riesce a
trovare termina il job come fallito, con il motivo nel suo output.

---

## Il job

Un job di workflow gira sul server AnsibleForms, e ogni nodo playbook gira come job a sé, figlio del job di
workflow come i passi di un modulo multistep: un playbook del designer sull'RTE, oppure, per un nodo con un `runner:`, il
template o job di quel runner su AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins (vedi [Dove gira un nodo](designer.html#where-a-node-runs)).

La pagina del job disegna il workflow, in diretta: ogni nodo colorato in base al suo stato, i collegamenti scattati, e i nodi che non
verranno eseguiti. I dati in alto indicano il workflow al posto di un playbook.

- **Fai clic su un nodo** terminato per aprirne l'output in una finestra di dialogo.
- **L'output** contiene l'output di ogni nodo sotto un'intestazione `WORKFLOW NODE [identifier] (status)`, nell'ordine in cui i nodi
  sono terminati.
- **Mostra variabili extra** e **Mostra artefatti**, sull'intestazione di ogni nodo nell'output e nella finestra di dialogo aperta dal grafo,
  mostrano le extravars e gli artefatti propri di quel nodo (`{}` quando non ne ha), come JSON o YAML, con un pulsante Copia.

Le extravars di un nodo contengono ciò che i nodi precedenti gli hanno passato, e i suoi artefatti ciò che il suo playbook ha raccolto con
`set_stats`. I due pulsanti seguono le [opzioni di ruolo](../config/roles.html#role-options) `showExtravars` e
`showArtifacts`. Gli stessi dati si ottengono da `GET /api/v2/job/{id}/node/{nodeId}`, per chiunque possa vedere il job.

Il job fallisce quando un nodo è fallito e nulla ha gestito l'errore, secondo la regola di AWX; altrimenti riesce.

---

## Approvazioni

Un nodo di approvazione trattiene il job di workflow finché qualcuno non risponde.

Quando il workflow raggiunge un nodo di approvazione, lo stato del job diventa **In attesa di approvazione**: compare nella campanella e nella
pagina del job, come un [punto di approvazione](../forms/approval.html) di un modulo. Il nome del nodo è il titolo dell'approvazione e la sua descrizione
il messaggio; il resto viene dall'`approval` del modulo:

- i suoi `roles` decidono chi può approvarla o rifiutarla, e `allowSelf` se chi l'ha avviato può anche approvarla;
- le sue `notifications` e i suoi `channels` ricevono la richiesta.

Un modulo workflow senza `approval` trattiene comunque il job su un nodo di approvazione, ma in quel caso solo un amministratore può approvarlo.

- **Approvata**: il nodo riesce e il workflow prosegue lungo i suoi collegamenti *in caso di successo*.
- **Rifiutata**: il nodo fallisce e il workflow prosegue lungo i suoi collegamenti *in caso di errore*.
- **Scaduta**: dopo il timeout del nodo senza risposta, anche in questo caso il nodo fallisce.

---

## Interruzione

**Interrompi** su un job di workflow in esecuzione lo ferma: i job dei nodi in esecuzione vengono interrotti, non parte più nulla, e un'approvazione
in attesa viene annullata. Si può interrompere anche un job di workflow in attesa di un'approvazione.

---

## Rilanciare dal nodo fallito

Dalla 7.8.0 un job di workflow fallito può essere rilanciato dal suo nodo fallito, con i nodi riusciti ripresi.

**Rilancia job** nella pagina del job ha allora un caret con **Dal primo nodo**, il rilancio completo, e **Dal nodo fallito**. Il nuovo
job passa per la stessa approvazione, la stessa validazione al lancio e gli stessi permessi di qualsiasi [rilancio](../jobs/actions.html#relaunch-a-job):

- **I nodi riusciti** non eseguono nulla. Il grafo li mostra in grigio, *dall'esecuzione precedente*, e l'output ha un banner
  `WORKFLOW NODE [identifier] (successful) #n carried over` per ciascuno, senza output del nodo da aprire.
- **Ciò che hanno passato** raggiunge ancora i nodi successivi: i loro artefatti `set_stats` sono conservati con il job e passati avanti.
- **L'esecuzione parte** dal nodo o dai nodi falliti, e prosegue lungo i collegamenti del workflow come farebbe una prima esecuzione.
- **La pagina del job** mostra **rilancio di #N**, con *nodo fallito* accanto, e il suo output inizia con
  `ok: [Relaunch of job N from its failed node: 2 node(s) carried over]`.

Un job di workflow di AnsibleForms offre **Dal nodo fallito** solo quando vale ciascuna di queste condizioni; altrimenti **Rilancia job** è il pulsante semplice:

| Condizione | Perché |
|---|---|
| Il job è fallito, con un nodo fallito e uno riuscito | Senza un nodo da riprendere, è il rilancio completo |
| Il job è stato eseguito sulla 7.8.0 o successiva | Dalla 7.8.0 un job di workflow conserva ogni nodo come è terminato, con ciò che ha passato |
| Il workflow è lo stesso di quando il job è stato eseguito | Il job ne conserva un hash: un nodo, un collegamento, una extra var o un nome modificato offre solo il rilancio completo |

Un job di workflow eseguito su Ascender usa il rilancio dei nodi falliti di Ascender stesso, che riprende i nodi riusciti allo stesso modo.
AWX e AAP non hanno un rilancio simile, quindi i loro job di workflow offrono solo il rilancio completo, come i job multistep.
