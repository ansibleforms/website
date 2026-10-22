---
layout: default
title: Il file di workflow
parent: Workflow
nav_order: 1
translated_from: bb4d3027e33a5bfd11443369b621eb34c4af2f68
---

# Il file di workflow
{: .no_toc }

La sintassi dei workflow, i tipi di nodo e le impostazioni di esecuzione di ogni nodo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Dove si trovano i file di workflow

I file di workflow sono file YAML nella cartella locale dei workflow e in ogni repository usato per i workflow.

- **La cartella locale** è [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), per impostazione predefinita `workflows` sotto la
  cartella persistente.
- **Un repository** con **Usare per i workflow?** attivo viene letto per intero, quindi i suoi file di workflow possono stare in qualsiasi cartella. Il
  designer li salva di nuovo nel repository, e **Push** li invia al remoto.

Viene letto ogni file YAML che contiene `workflow_job_templates`, fino a sei livelli di cartelle, e un file può contenere più
workflow. Un modulo indica un workflow con il suo `name`, quindi mantieni i nomi univoci: quando due workflow hanno lo stesso nome, un job che
lo esegue fallisce e chiede di rinominarne uno.

---

## La sintassi

Un file di workflow si scrive con la sintassi di un'esportazione di AWX, con i nodi sotto `related.workflow_nodes`:

```yaml
workflow_job_templates:
  - name: deploy-app
    description: Builds, approves and deploys the application
    extra_vars:
      app_name: orders-api
    related:
      workflow_nodes:
        - identifier: build
          unified_job_template:
            name: build.yaml
            type: job_template
          inventory:
            name: staging
          related:
            credentials:
              - name: deploy-ssh
            success_nodes:
              - identifier: approve
            failure_nodes:
              - identifier: notify
        - identifier: approve
          unified_job_template:
            name: Approve the deploy
            type: workflow_approval_template
            timeout: 3600
          related:
            success_nodes:
              - identifier: deploy
        - identifier: deploy
          unified_job_template:
            name: deploy.yaml
            type: job_template
          inventory:
            name: production
          limit: web
          job_tags: deploy
        - identifier: notify
          unified_job_template:
            name: notify.yaml
            type: job_template
```

Viene letta anche la struttura della collection `awx.awx`: `workflow_nodes` direttamente sotto il workflow, e nomi scritti come
semplici stringhe (`inventory: staging`) invece che come mappe (`inventory: {name: staging}`).

### Il workflow

Una voce di workflow ha alcune chiavi proprie, accanto ai suoi nodi:

| Chiave | Cos'è |
|---|---|
| `name` | Il nome del workflow, quello indicato da `workflow:` in un modulo |
| `description` | A cosa serve, mostrato nel designer |
| `extra_vars` | Variabili che ogni nodo riceve; i valori del modulo prevalgono su di esse |
| `related.workflow_nodes` | I nodi |

### Un nodo

Ogni nodo ha un identificatore, ciò che esegue e i suoi collegamenti:

| Chiave | Cos'è |
|---|---|
| `identifier` | L'id del nodo: lettere, cifre, punti, trattini, due punti e trattini bassi, univoco nel workflow |
| `unified_job_template.type` | Cosa esegue il nodo: vedi [tipi di nodo](#node-types) |
| `unified_job_template.name` | Il playbook, workflow, approvazione o repository che esegue |
| `related.success_nodes` | I nodi che girano quando questo riesce |
| `related.failure_nodes` | I nodi che girano quando questo fallisce |
| `related.always_nodes` | I nodi che girano quando questo è terminato, in ogni caso |
| `all_parents_must_converge` | `true`: il nodo attende che scattino tutti i collegamenti verso di esso, non uno solo |

I collegamenti devono andare in avanti: un workflow i cui collegamenti formano un ciclo non gira.

---

## Tipi di nodo

Un nodo esegue una di quattro cose, con i nomi che usa AWX:

| Tipo | Cosa esegue il nodo |
|---|---|
| `job_template` | Uno dei playbook del designer, come job a sé sull'RTE; oppure, con `runner:`, il template o job di quel runner |
| `workflow_job_template` | Un altro workflow, come job di workflow figlio; i workflow si annidano fino a cinque livelli |
| `workflow_approval_template` | Un'approvazione: il job di workflow attende finché qualcuno la approva o la rifiuta |
| `project` | Un pull del repository indicato (l'aggiornamento di progetto di AWX) |

Il `unified_job_template.timeout` di un nodo di approvazione è in secondi. Quando scade senza risposta, il nodo fallisce; `0` o nessun
timeout attende una risposta per tutto il tempo necessario. Un'approvazione rifiutata fa fallire il nodo, e il workflow prosegue lungo i suoi
collegamenti.

---

## Impostazioni di esecuzione

Un nodo `job_template` accetta le impostazioni di un nodo AWX, sul nodo stesso:

| Chiave | Cosa fa |
|---|---|
| `inventory` | L'inventario su cui gira il playbook, per nome, come `inventory:` in un modulo |
| `related.credentials` | Le credenziali: ognuna arriva al playbook con il proprio nome, e la prima di tipo *SSH* è anche il login con cui si connette ansible. Una di tipo vault apre solo i vault |
| `limit` | Gira solo su questi host (`--limit`) |
| `job_tags` | Esegue solo i task con questi tag (`--tags`) |
| `skip_tags` | Salta i task con questi tag (`--skip-tags`) |
| `verbosity` | Da `0` a `5`: il numero di `-v` |
| `diff_mode` | `true`: mostra le modifiche (`--diff`) |
| `job_type` | `check`: una prova a vuoto (`--check`); `run` o niente: un'esecuzione reale |
| `extra_data` | Variabili che riceve questo nodo, sotto le `extra_vars` del workflow e i valori del modulo |

Il job del nodo riceve i valori del modulo come extra vars. I valori del modulo prevalgono sulle `extra_vars` del workflow, che prevalgono
sull'`extra_data` del nodo, come fanno in AWX le risposte di un survey.

---

## Le chiavi proprie di AnsibleForms

Tre chiavi di un nodo sono proprie di AnsibleForms, e AWX le ignora, così un workflow può fare ciò che fa un modulo multistep:

| Chiave | Cosa fa |
|---|---|
| `runner` | Su un nodo `job_template`, esegue il template o job di quel runner invece di un playbook del designer: AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins. Un runner RTE esegue lì il playbook del nodo. Un workflow può mescolarli. |
| `if_extra_var` | Il nodo gira solo quando questa extra var è `true`, come l'`ifExtraVar` di un passo multistep. Se non è soddisfatta, il nodo viene saltato, e ciò che lo segue gira come dopo un successo. Non su un nodo di approvazione, che gira sempre. |
| `extra_vars_key` | Il nodo riceve solo questa chiave delle extra vars, con l'utente copiato dentro, come la `key` di un passo multistep |

Su un runner di template, `unified_job_template.name` è il template o job da eseguire, e `limit`, `job_tags`, modalità check
e modalità diff del nodo vengono passati come li passerebbe un modulo del tipo di quel runner. Una `verbosity` sopra `0` attiva il
`verbose` del modulo, e `skip_tags` non viene passato. Solo un runner AWX (AWX, AAP o Ascender) riceve l'inventario del nodo, e le
credenziali come sue credenziali AWX; Semaphore, Rundeck e Jenkins ricevono le credenziali come le `credentials` di un modulo.
