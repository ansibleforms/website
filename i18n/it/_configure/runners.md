---
layout: default
title: Runner
nav_order: 12
has_children: true
has_toc: false
permalink: /runners.html
translated_from: e6663cf2e7dc14a1559383c7f49fd968a4cbf635
---

# Runner
{: .no_toc }

Dove girano i job: container di ambienti di esecuzione per i playbook, e AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins per i template
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per gli amministratori: aggiungi i runner su cui girano i tuoi job, scegli il predefinito di ogni tipo, approva gli RTE che chiedono di unirsi, provali.

---

## In questa sezione

| Pagina | Cosa tratta |
|---|---|
| [La pagina dei runner](runners/list.html) | La lista dei runner, come aggiungerne uno, attivarlo o disattivarlo, e il predefinito di ogni tipo |
| [Tipi di runner](runners/types.html) | I prodotti che un runner può essere, il loro indirizzo e il loro accesso |
| [Registrazione](runners/registration.html) | Come un RTE chiede di unirsi e viene approvato, i join token per le installazioni non presidiate, e la modalità database |
| [La pagina di un runner](runners/runner-page.html) | Le schede di un runner, la modalità e la connessione di un RTE, e Testa connessione |
| [Chi gestisce i runner](runners/permissions.html) | Chi può aggiungere, modificare e provare i runner |


---

## Come funziona

Dalla versione 7 l'app non esegue nulla da sola: ogni job gira su un **runner**, aggiunto in **Connessioni > Runner**.
Il tipo di un modulo decide di quale tipo di runner ha bisogno:

| Tipo di modulo | Gira su un runner di tipo | Cosa gira |
|---|---|---|
| `ansible` | RTE | Un playbook, in un container di ambiente di esecuzione |
| `awx`, `aap`, `ascender` | AWX (le varianti AWX, AAP e Ascender) | Un job template o un workflow template |
| `semaphore` | Semaphore | Un template di Semaphore UI |
| `rundeck` | Rundeck | Un job di Rundeck |
| `jenkins` | Jenkins | Un job di Jenkins |

Un modulo `workflow` o `subform` non ha un runner proprio: ogni nodo di un [workflow](workflows/) sceglie il suo. Un nodo
con un `runner:` gira su quel runner (un RTE, o un template o un job su AWX, Semaphore, Rundeck o Jenkins), ogni altro
sull'RTE predefinito, quindi i nodi di uno stesso job possono girare su runner diversi. Il modulo `multistep`, deprecato dalla 7 e
sostituito dai workflow, funziona allo stesso modo: ognuno dei suoi passaggi gira sul runner richiesto dal proprio tipo.

Un modulo sceglie il suo runner in uno di due modi:

- **Per nome**: `runner: <name>` sul modulo, su un nodo di workflow, o su un passaggio di un multistep deprecato (anche nelle
  impostazioni del modulo nel designer). Il runner deve essere del tipo richiesto dal modulo, altrimenti il job fallisce. Il vecchio `awx: <name>`
  funziona ancora, registra un avviso di deprecazione, e sparirà nella 8.
- **Come predefinito**: un modulo che non indica nessun runner gira sul runner predefinito del suo tipo. Senza, il job fallisce
  con un messaggio che dice quale tipo di runner aggiungere.

Un runner disattivato in **Connessioni > Runner** non riceve nessun job, né per nome né come predefinito: il job fallisce e dice di attivarlo
o di indicare un altro runner (vedi [Predefinito e Abilitato](runners/list.html#default-and-enabled)).
