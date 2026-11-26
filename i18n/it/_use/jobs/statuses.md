---
layout: default
title: Stati e tipi
parent: Job
nav_order: 1
translated_from: de3ae8ab9d1bd42e3d78336c40b963276b936ff4
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
| `warning` | Il playbook è terminato ma [richiede attenzione](#a-job-that-needs-attention): qualcuno deve darvi seguito. Oppure un multistep è terminato, ma un passo con `continue` impostato è fallito | Leggere il motivo nella pagina del job, darvi seguito, rilanciarlo, eliminarlo |
| `aborted` | Il job è stato interrotto da AnsibleForms, oppure il job AWX / AAP è stato annullato | Vedere l'output, rilanciarlo, eliminarlo |
| `rejected` | Un approvatore ha rifiutato il job; non è mai stato eseguito | Vedere l'output, rilanciarlo, eliminarlo |
| `abandoned` | AnsibleForms ha smesso di seguire il job (vedi [Job abbandonati](cleanup.html#abandoned-jobs)) | Controllare gli host gestiti, rilanciarlo, eliminarlo |

`running` è blu, `success` verde e si legge **Riuscito**, e `failed` rosso. `approve` è arancione e si legge **In attesa di approvazione**,
così un job che attende una persona si distingue da quelli fermi; `warning` si legge **Richiede attenzione**, e come `aborted` e `rejected` è ambra. `abandoned` è
grigio: nessuno l'ha fermato, ciò che lo eseguiva non c'è più.

---

## Un job che richiede attenzione

Dalla 7.8.0 un playbook terminato come previsto, ma che lascia lavoro a un operatore (un'approvazione altrove, un passo manuale,
un'applicazione parziale), può chiudere il suo job come **Richiede attenzione** (`warning`) con un messaggio, invece di un `failed` che
sembra un'automazione guasta o di un `success` che nasconde ciò che resta da fare. Il playbook lo segnala in uno di due modi:

* un **file di stato** accanto al playbook, `<playbook_dir>/.joblogs/job_status_<jobid>.yml` (o `.yaml`), su un RTE. L'RTE lo
  legge quando il playbook termina, poi lo rimuove
* **`set_stats`** con la chiave `af_job_status`, su un RTE e su AWX, AAP o Ascender

{% raw %}
```yaml
# .joblogs/job_status_{{ __jobid__ }}.yml
status: attention        # or warning ; success leaves the job a success
message: >               # required : one line
  Follow-up required: 3 items are waiting for operator approval.
detail:                  # optional : anything
  - id: 1
    action: create
    object: group-a
```

```yaml
- name: Ask for attention
  ansible.builtin.set_stats:
    data:
      af_job_status:
        status: attention
        message: "3 items wait for operator approval"
```
{% endraw %}

AnsibleForms passa `__jobid__` nelle extravars, così il playbook può costruire il percorso del file. Il file prevale quando un
playbook fa entrambe le cose.

* Solo un playbook **riuscito** può terminare come Richiede attenzione: un job fallito resta `failed` e uno interrotto `aborted`,
  qualunque cosa dica il file
* Un file non valido (nessun messaggio, un altro stato, YAML non corretto) viene ignorato: il job resta riuscito, e il suo output
  ne spiega il motivo in una riga `[WARNING]`
* Il messaggio compare nella pagina del job in un riquadro ambra, con il dettaglio ripiegato sotto come YAML, come tooltip dello
  stato nell'elenco, e nell'ultima riga di output del job. **Richiede attenzione** sotto **Passato** nel menu dei job elenca questi job
* Le [notifiche](../forms/notifications.html) con `onStatus: [warning]` vengono inviate per questi job; la mail e i canali riportano
  il messaggio, un webhook come [{% raw %}`{{statusMessage}}`{% endraw %}](../notification-channels/webhook.html)
* In un multistep, un passo che richiede attenzione viene superato e il passo successivo gira; il multistep allora richiede anch'esso
  attenzione. In un [workflow](../workflows/), il job conta come riuscito per il nodo successivo

I job Semaphore, Rundeck e Jenkins non possono terminare come Richiede attenzione.

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
