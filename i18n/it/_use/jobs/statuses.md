---
layout: default
title: Stati e tipi
parent: Job
nav_order: 1
translated_from: 5974310f0d30079e77ad45698ed2afb70e68ce1e
---

# Stati e tipi
{: .no_toc }

Tutti gli stati che un job può avere, e i tipi di job
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Stati dei job

AnsibleForms imposta su un job gli stati seguenti. L'elenco mostra ogni stato come un'etichetta colorata:

| Stato | Significato | Cosa puoi fare |
|---|---|---|
| `running` | Il job è in esecuzione, oppure un job approvato è ripartito | Seguirne l'output, interromperlo |
| `approve` | Il job attende a un [punto di approvazione](../forms/approval.html) prima di girare (o prima che giri un passo di un multistep) | Approvarlo o rifiutarlo, se uno dei tuoi ruoli è approvatore |
| `success` | Il playbook, il template o ogni passo è terminato senza errori | Vedere l'output, rilanciarlo, eliminarlo |
| `failed` | Il job è terminato con un errore, oppure è fallito l'avvio stesso | Vedere l'output per capire perché, rilanciarlo, eliminarlo |
| `warning` | Un multistep è terminato, ma un passo con `continue` impostato è fallito | Vedere l'output, rilanciarlo, eliminarlo |
| `aborted` | Il job è stato interrotto da AnsibleForms, oppure il job AWX / AAP è stato annullato | Vedere l'output, rilanciarlo, eliminarlo |
| `rejected` | Un approvatore ha rifiutato il job; non è mai stato eseguito | Vedere l'output, rilanciarlo, eliminarlo |
| `abandoned` | AnsibleForms ha smesso di seguire il job (vedi [Job abbandonati](cleanup.html#abandoned-jobs)) | Controllare gli host gestiti, rilanciarlo, eliminarlo |

`running` è blu, `success` verde e si legge **Riuscito**, e `failed` rosso. `approve` è arancione e si legge **In attesa di approvazione**,
così un job che attende una persona si distingue da quelli fermi; `warning`, `aborted` e `rejected` sono ambra. `abandoned` è
grigio: nessuno l'ha fermato, ciò che lo eseguiva non c'è più.

---

## Tipi di job

Il tipo di job segue il `type` del modulo che ha avviato il job, come lo mostrano l'elenco e la pagina del job:

| Tipo mostrato | Cosa gira |
|---|---|
| `ansible` | Un playbook Ansible, eseguito su un RTE |
| `awx`, `aap`, `ascender` | Un modello di job o di workflow su AWX, AAP o Ascender |
| `semaphore` | Un template su Semaphore UI |
| `rundeck`, `jenkins` | Un job su Rundeck o Jenkins |
| `workflow` | Un [workflow](../workflows/), i cui nodi playbook girano come job a sé sotto di esso |
| `multistep` | Deprecato, usa `workflow`: una sequenza di passi, ognuno registrato come job a sé sotto il job principale |

Un job di template viene salvato come job `awx` (anche nella REST API) e mostrato con il tipo di runner su cui è girato, qualunque nome gli
desse il modulo: un modulo di tipo `awx` che gira su un runner AAP mostra `aap`.

Vedi [Moduli Ansible](../forms/ansible.html), [Moduli AWX](../forms/awx.html), [Moduli workflow](../forms/workflow.html) e
[Moduli multistep](../forms/multistep.html) per la parte relativa ai moduli.
