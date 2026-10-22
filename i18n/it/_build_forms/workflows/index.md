---
layout: default
title: Workflow
nav_order: 5
has_children: true
has_toc: false
permalink: /workflows/
translated_from: e6133a683d5bc1d0ba822dd52b4fed99028ea63c
---

# Workflow
{: .no_toc }

Concatenare playbook, approvazioni e altri workflow, come fa AWX
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per chi scrive i moduli: che cos'è un workflow, come girano i suoi nodi, e dove approfondire.

Un workflow è un grafo di nodi. Ogni nodo esegue qualcosa: uno dei playbook del designer, un altro workflow, un'approvazione,
o un pull di repository. I collegamenti tra i nodi dicono cosa viene eseguito dopo, in caso di successo, in caso di errore o sempre. Un modulo di
[tipo `workflow`](../forms/workflow.html) lo avvia, e la pagina dei job lo disegna in diretta mentre gira.

I workflow seguono la sintassi e le regole di AWX, quindi un workflow esportato da AWX si legge allo stesso modo in AnsibleForms. Girano
sull'RTE, senza AWX: un nodo playbook è un job a sé, con l'inventario, le credenziali, il limite e i tag del nodo.

---

## Come gira un workflow

I nodi girano secondo le regole di AWX, e i rami che non dipendono l'uno dall'altro girano in parallelo.

- **Un nodo senza genitore parte subito**, quando parte il workflow.
- **Un collegamento scatta quando il suo nodo è terminato**: un collegamento *in caso di successo* dopo un successo, uno *in caso di errore* dopo un errore,
  uno *sempre* dopo l'uno o l'altro. Un nodo annullato non fa scattare nessuno dei suoi collegamenti.
- **Un nodo parte appena scatta uno dei collegamenti verso di esso.** Con **Tutti i genitori devono convergere** attivo, attende finché ogni collegamento
  verso di esso è scattato.
- **Un nodo che non può più partire viene contrassegnato come *non viene eseguito***, e lo stesso vale per i nodi che solo lui poteva far partire.
- **Il workflow fallisce quando un nodo è fallito e nulla gestisce l'errore**: quel nodo non ha né un collegamento *in caso di errore* né uno *sempre*.
  Un errore gestito da un collegamento non fa fallire il workflow.

Un nodo con una condizione (`if_extra_var`) non soddisfatta viene saltato. Ciò che lo segue gira come dopo un successo. Un nodo
di approvazione non accetta condizioni: attende sempre una risposta.

---

## Passare dati tra i nodi

Ciò che il playbook di un nodo raccoglie con `set_stats` arriva ai nodi successivi come extra vars, nello stesso modo in cui AWX passa gli
artifact di un job. Un nodo riceve i dati da ogni genitore il cui collegamento verso di esso è scattato, uniti nell'ordine in cui i genitori sono
scritti, e passa avanti ciò che ha ricevuto più i dati del proprio job, con i propri che prevalgono su una chiave impostata da entrambi.

```yaml
# build.yaml, the first node : its version and build id go to the nodes after it
- name: Build
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Pass the build on
      ansible.builtin.set_stats:
        data:
          version: "2.4.1"
          build_id: 42
```

Un nodo successivo legge poi {% raw %}`{{ version }}` e `{{ build_id }}`{% endraw %} come qualsiasi altra extra var.

Le extra vars di un nodo provengono da quattro fonti. Una di queste, `extra_data`, sono le variabili proprie del nodo: il nome che usa AWX,
impostate sul nodo nel [file di workflow](file.html#run-settings). Quando due fonti impostano la stessa chiave, l'ordine di precedenza è
quello di AWX, dalla più bassa:

| Fonte | Prevale su |
|---|---|
| le variabili proprie del nodo (`extra_data`) | niente |
| i dati passati con `set_stats` | l'`extra_data` del nodo |
| le `extra_vars` del workflow | i dati passati |
| i valori del modulo | tutto |

- Vengono passati solo i dati a livello di playbook: `set_stats` con `per_host: false`, il suo valore predefinito.
- Un nodo di approvazione, un nodo saltato e un nodo di progetto passano avanti ciò che hanno ricevuto.
- L'output di un nodo termina con le chiavi che ha passato, solo per nome, perché i loro valori possono essere segreti.
- Il job del nodo conserva i suoi dati come artefatti (**Mostra artefatti** nella sua pagina), e il job di workflow conserva i dati di tutti i suoi
  nodi, così anche un workflow annidato li passa ai nodi successivi.
- Un nodo che gira su un runner AWX passa avanti allo stesso modo gli artifact del suo job AWX.
---

## In questa sezione

Le pagine seguenti descrivono i workflow in dettaglio:

| Pagina | Cosa tratta |
|---|---|
| [Il file di workflow](file.html) | La sintassi del file, i tipi di nodo e le impostazioni di esecuzione di ogni nodo |
| [Modifica nel designer](designer.html) | La sezione Workflow del designer: il grafo, le finestre di dialogo di nodi e collegamenti e la prova a vuoto |
| [Eseguire un workflow](running.html) | Il modulo che lo avvia, la pagina del job, gli output dei nodi, le approvazioni e l'interruzione |
