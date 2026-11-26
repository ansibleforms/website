---
layout: default
title: Limpeza
parent: Tarefas
nav_order: 6
translated_from: 3ccd056f3993f5aea914db2765e62d0d8f89d366
---

# Limpeza
{: .no_toc }

Tarefas interrompidas por um reinício, e durante quanto tempo se guardam as tarefas terminadas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Tarefas abandonadas

Uma tarefa em execução é seguida pelo processo do AnsibleForms que a iniciou. Quando esse seguimento para, a tarefa é marcada como
`abandoned`:

* **No arranque**, as tarefas que este processo seguia antes de reiniciar, e as tarefas de antes da 7 que nenhum processo
  segue, são marcadas como abandonadas se ainda estiverem `running` ou a ser interrompidas; o registo mostra `Abandoned <n> jobs`. Uma tarefa que
  corre num RTE não é tocada: continua sem o processo que a iniciou.
* **A cada minuto**, o [processo do sistema](system-tasks.html) **Nós parados** marca como abandonadas as tarefas seguidas por outro
  processo do AnsibleForms (ou RTE) que deixou de responder durante 2 minutos; o registo mostra `Abandoned <n> jobs followed by a node that stopped answering`.
* **A cada hora**, o processo do sistema **Tarefas abandonadas** marca como abandonadas as tarefas que começaram há mais de um dia,
  ainda estão `running` e não escreveram resultado durante um dia. Uma tarefa que corre num RTE também é deixada em paz aqui: o RTE limpa as suas próprias tarefas quando reinicia.

A partir da 7.3.0, uma tarefa de template em AWX, AAP ou Ascender que um reinício ou um nó parado abandonou é retomada, se tiver começado
nas últimas 24 horas: um processo do AnsibleForms assume-a, volta a segui-la no runner, e a tarefa termina com o que
realmente aconteceu lá. As tarefas nos outros runners, os playbooks, os workflows e as tarefas multistep continuam abandonados.

Um playbook abandonado pode ter sido executado em parte. Verifique os hosts geridos antes de o relançar; ver
[Uma tarefa mostra o estado abandoned](../troubleshooting.html#a-job-shows-the-status-abandoned).

---

## Retenção de tarefas

As tarefas terminadas são guardadas durante os dias que o administrador define em [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS).

O processo do sistema noturno **Limpeza de tarefas** (às 2:30) elimina as tarefas terminadas, com o seu resultado e os seus passos, que
terminaram há mais desse número de dias. Só remove tarefas com o estado `success`, `failed`, `warning`, `aborted`, `rejected` ou
`abandoned`, pelo que as tarefas em execução e as tarefas à espera de aprovação são mantidas, por mais antigas que sejam. A
predefinição é `90` desde a 7.6.0 (`0` antes), e `0` guarda todas as tarefas.

Estas horas são as predefinidas: a partir da 7.8.0 um administrador altera-as na página do processo, em **Tarefas > Sistema**, e vê lá
cada uma das suas execuções (ver [Processos do sistema](system-tasks.html)).
