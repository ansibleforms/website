---
layout: default
title: Limpeza
parent: Tarefas
nav_order: 6
translated_from: 48c1ec6d3d2ac80c86dd71d6799fbb1b59c5cb2f
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
* **A cada minuto**, as tarefas seguidas por outro processo do AnsibleForms (ou RTE) que deixou de responder durante 2 minutos são
  marcadas como abandonadas; o registo mostra `Abandoned <n> jobs followed by a node that stopped answering`.
* **A cada hora**, as tarefas que começaram há mais de um dia, ainda estão `running` e não escreveram resultado durante um dia são marcadas como abandonadas.
  Uma tarefa que corre num RTE também é deixada em paz aqui: o RTE limpa as suas próprias tarefas quando reinicia.

A partir da 7.3.0, uma tarefa de template em AWX, AAP ou Ascender que um reinício ou um nó parado abandonou é retomada, se tiver começado
nas últimas 24 horas: um processo do AnsibleForms assume-a, volta a segui-la no runner, e a tarefa termina com o que
realmente aconteceu lá. As tarefas nos outros runners, os playbooks, os workflows e as tarefas multistep continuam abandonados.

Um playbook abandonado pode ter sido executado em parte. Verifique os hosts geridos antes de o relançar; ver
[Uma tarefa mostra o estado abandoned](../troubleshooting.html#a-job-shows-the-status-abandoned).

---

## Retenção de tarefas

As tarefas são guardadas até serem eliminadas, a não ser que o administrador defina um período de retenção.

Com [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) definida, uma tarefa noturna (às 2:30) elimina
as tarefas terminadas, com o seu resultado e os seus passos, que terminaram há mais desse número de dias. Só remove tarefas com o
estado `success`, `failed`, `warning`, `aborted`, `rejected` ou `abandoned`, pelo que as tarefas em execução e as tarefas à espera de
aprovação são mantidas, por mais antigas que sejam. A predefinição, `0`, guarda todas as tarefas.
