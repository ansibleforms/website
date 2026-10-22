---
layout: default
title: Pulizia
parent: Job
nav_order: 6
translated_from: 48c1ec6d3d2ac80c86dd71d6799fbb1b59c5cb2f
---

# Pulizia
{: .no_toc }

I job interrotti da un riavvio, e per quanto tempo vengono conservati i job terminati
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Job abbandonati

Un job in esecuzione viene seguito dal processo AnsibleForms che l'ha avviato. Quando questo monitoraggio si interrompe, il job viene contrassegnato
come `abandoned`:

* **All'avvio**, i job che questo processo seguiva prima di riavviarsi, e i job precedenti alla 7 che nessun processo
  segue, vengono contrassegnati come abbandonati se sono ancora `running` o in interruzione; il log mostra `Abandoned <n> jobs`. Un job che
  gira su un RTE non viene toccato: prosegue senza il processo che l'ha avviato.
* **Ogni minuto**, i job seguiti da un altro processo AnsibleForms (o RTE) che ha smesso di rispondere da 2 minuti vengono
  contrassegnati come abbandonati; il log mostra `Abandoned <n> jobs followed by a node that stopped answering`.
* **Ogni ora**, i job partiti più di un giorno fa, ancora `running` e che non hanno scritto output per un giorno vengono contrassegnati come abbandonati.
  Anche qui un job che gira su un RTE viene lasciato stare: l'RTE ripulisce i propri job quando si riavvia.

Dalla 7.3.0 un job di template su AWX, AAP o Ascender abbandonato a causa di un riavvio o di un nodo fermo viene ripreso, se è partito
nelle ultime 24 ore: un processo AnsibleForms lo prende in carico, lo segue di nuovo sul runner, e il job termina con ciò che
è davvero successo lì. I job sugli altri runner, i playbook, i workflow e i job multistep restano abbandonati.

Un playbook abbandonato potrebbe essere girato in parte. Controlla gli host gestiti prima di rilanciarlo; vedi
[Un job mostra lo stato abandoned](../troubleshooting.html#a-job-shows-the-status-abandoned).

---

## Conservazione dei job

I job vengono conservati finché non vengono eliminati, a meno che l'amministratore non imposti un periodo di conservazione.

Con [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) impostato, un'attività notturna (alle 2:30) elimina
i job terminati, con il loro output e i loro passi, che sono finiti da più di quel numero di giorni. Rimuove solo i job con
stato `success`, `failed`, `warning`, `aborted`, `rejected` o `abandoned`, quindi i job in esecuzione e quelli in attesa di
approvazione vengono conservati per quanto vecchi siano. Il valore predefinito, `0`, conserva ogni job.
