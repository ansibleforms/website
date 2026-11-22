---
layout: default
title: Processos do sistema
parent: Tarefas
nav_order: 7
translated_from: 3c7c5f9702fa19b6daa323c22d92feefd289dc54
---

# Processos do sistema
{: .no_toc }

Os processos de manutenção que o AnsibleForms executa sozinho, e quando correm
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: as limpezas, a cópia noturna e o restante trabalho de fundo do servidor, listados em **Tarefas** desde a 7.8.0.

---

## Os processos

O servidor executa estes processos sozinho, cada um num cron no fuso horário do servidor, definido com [`LOG_TZ`](../customization/logging.html#env_LOG_TZ):

| Processo | Corre por predefinição | O que faz |
|---|---|---|
| **Tarefas abandonadas** | A cada hora | Termina as tarefas que correram um dia sem resultado e que nenhum runner assumiu (ver [Tarefas abandonadas](cleanup.html#abandoned-jobs)) |
| **Nós parados** | A cada minuto | Liberta as tarefas, as reservas e os runners detidos por nós do AnsibleForms e RTEs que deixaram de responder |
| **Fim dos agendamentos** | A cada minuto | Desativa ou remove os [agendamentos](schedules.html) que chegaram ao seu fim |
| **Ressincronizar agendamentos** | A cada 5 minutos | Volta a ler da base de dados os agendamentos e as atualizações de repositórios, caso se tenha perdido um aviso de alteração |
| **Tokens expirados** | Todos os dias às 03:00 | Remove os tokens de início de sessão expirados, as revogações de tokens e os tokens de API |
| **Limpeza da auditoria** | Todos os dias às 03:30 | Remove as entradas de auditoria mais antigas do que `AUDIT_RETENTION_DAYS` |
| **Limpeza de tarefas** | Todos os dias às 02:30 | Remove as tarefas terminadas mais antigas do que `JOB_RETENTION_DAYS`, com o seu resultado |
| **Cópia noturna** | Todos os dias à meia-noite | Faz a cópia de segurança da base de dados e remove as cópias noturnas mais antigas além de `NIGHTLY_BACKUP_RETENTION` |
| **Limpeza de tarefas guardadas** | Todos os dias às 04:00 | Remove as tarefas guardadas expiradas ou sem uso há `STORED_JOB_UNUSED_DAYS`, e esquece os nós ausentes há um dia |
| **Recarga do config seed** | A cada minuto | Volta a aplicar o [config seed](../seed/reloading.html) quando o seu ficheiro mudou |

As definições de retenção estão descritas em [Cópias de segurança e retenção](../customization/retention.html), e as cópias de segurança em
[Cópias de segurança](../production/backups.html). A **Recarga do config seed** fica desativada sem [`CONFIG_SEED_PATH`](../customization/configuration.html#env_CONFIG_SEED_PATH).

Estes processos correm no nó que faz o trabalho de fundo: o processo sem `AF_ROLE`, ou o `worker` que detém o bloqueio de worker
quando a app está dividida por vários nós (ver [Escalabilidade](../production/scaling.html#roles)).

---

## Os ciclos do hub de runners

O hub de runners entrega as tarefas aos RTEs, e três ciclos próprios correm a cada poucos segundos em vez de num cron:

| Ciclo | Corre por predefinição | O que faz |
|---|---|---|
| **Envio aos runners** | A cada 2 segundos | Entrega as tarefas em espera e os cancelamentos aos seus runners; um lançado noutro nó chega ao runner na passagem seguinte |
| **Ligação a runners de entrada** | A cada 10 segundos | Liga aos runners [de entrada](../rte/modes.html#inbound) que este nó pode deter, de novo para um que perdeu o socket |
| **Limpeza de jobs terminados** | A cada 60 segundos | Liberta o que este nó guardava de tarefas que terminaram noutro nó |

Os ciclos correm em cada nó que executa a aplicação web, pelo que, com vários nós de app, cada um tem os seus. Um minuto, o passo
mais pequeno de um cron, é demasiado grosseiro para eles: cada um corre a cada tantos segundos.

---

## A lista Sistema

A página [Tarefas](./) lista os processos em **Futuro**, como **Sistema**, com o número de processos, para os administradores (opção de função `showSettings`).

A lista tem uma linha por processo e por ciclo, e é lida de novo a cada minuto:

| Coluna | Mostra |
|---|---|
| **Nome** | O nome do processo |
| **Agendamento** | Quando corre, por palavras (*A cada hora*, *A cada 2 segundos*), o seu cron ao passar o rato, ou **Desativado** para um processo que não corre |
| **Última execução** | Quando começou a última execução, ou um traço quando nunca correu |
| **Próxima execução** | Quando corre a seguir |
| **Estado** | Como correu a última execução: `success` ou `failed` |

**Colunas** também oferece **Descrição**, o que cada processo faz. Um clique numa linha abre a página do processo. Os processos são da
própria app: não se podem adicionar nem eliminar.

---

## A página de um processo

A página de um processo tem três separadores, com **Executar agora** e **Guardar** por cima, e uma caixa de pesquisa que filtra todos os separadores de uma vez.

| Separador | O que mostra |
|---|---|
| **Detalhes** | O seu **Nome** e a sua **Descrição**, o seu **Último lançamento** (o erro ao passar o rato quando falhou), o **Resultado** da última execução, **Última execução**, **Próxima execução**, o **Nó** que respondeu para um ciclo, e a **Definição aplicada** |
| **Agendamento** | Quando corre: um cron para um processo, um **Intervalo** em segundos para um ciclo |
| **Execuções** | Cada execução registada, a mais recente primeiro |

**Definição aplicada** indica a variável e o seu valor, como `JOB_RETENTION_DAYS` 90, com **Alterar nas Definições** para abrir
o separador de definições que a altera. Um processo sem essa definição mostra um traço.

### O separador Agendamento
{: .no_toc }

O cron de um processo edita-se no mesmo editor que o de um agendamento: predefinições, a expressão por palavras e as três próximas
execuções, no fuso horário do servidor. Aceita 5 campos (minuto, hora, dia, mês e dia da semana) e tem de voltar a correr. Um ciclo
aceita um número inteiro de segundos, dentro dos seus limites, que a linha por baixo do campo indica.

**Guardar** escreve o valor no ficheiro de definições gerido, como fazem as páginas de definições, e aplica-o de imediato em todos os
nós, sem reiniciar. Um valor definido no ambiente do processo, ou qualquer valor com [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0`,
aparece só de leitura, com a linha *Definido pela variável de ambiente* e o seu nome.

### O separador Execuções
{: .no_toc }

Cada execução de um processo é uma linha, com estas colunas:

| Coluna | Mostra |
|---|---|
| **Iniciado por** | O utilizador que selecionou **Executar agora**, como `admin (local)`, ou **Agendamento** para uma execução no seu cron |
| **Hora de início**, **Hora de fim** e **Duração** | Quando a execução começou e terminou, e quanto tempo demorou |
| **Estado** | `success` ou `failed` |
| **Resultado** | O que a execução fez, como *Removed 120 jobs*, ou o seu erro |
| **Nó** | O nó que a executou |

Guardam-se as execuções dos últimos 30 dias, até 1000 por processo: para um processo que corre a cada minuto, cerca das suas últimas 16 horas.

Um ciclo corre demasiadas vezes para uma linha por passagem. O seu separador **Execuções** mostra antes, por nó:

* um resumo de cada hora, como *1,800 passes, 0 failed*, `failed` quando uma passagem dessa hora falhou;
* uma linha por cada **Executar agora**, com *Run now: done* ou o erro;
* uma linha `failed` quando falha uma passagem do seu temporizador, no máximo uma vez por minuto para o mesmo erro.

### Executar agora
{: .no_toc }

**Executar agora** executa o processo de imediato, no nó que executa os processos, e regista a execução com o seu nome. Fica desativado
enquanto decorre uma execução do processo, e para um processo **Desativado**. Uma execução longa, como a cópia noturna, continua depois de a página responder.

O **Executar agora** de um ciclo executa uma passagem no nó que serve a página, e é recusado onde o hub de runners não corre. Cada
**Executar agora** fica escrito no registo de auditoria como `system.task.run`.

---

## Alterar quando um processo corre

Cada processo e cada ciclo tem uma variável de ambiente para o seu horário, que o seu separador **Agendamento** escreve. Todas se aplicam sem reiniciar.

| Variável | Predefinição | Processo |
|---|---|---|
| [`ABANDONED_JOBS_CRON`](../customization/system-tasks.html#env_ABANDONED_JOBS_CRON) | `0 * * * *` | Tarefas abandonadas |
| [`DEAD_NODES_CRON`](../customization/system-tasks.html#env_DEAD_NODES_CRON) | `* * * * *` | Nós parados |
| [`SCHEDULE_ENDS_CRON`](../customization/system-tasks.html#env_SCHEDULE_ENDS_CRON) | `* * * * *` | Fim dos agendamentos |
| [`SCHEDULE_RESYNC_CRON`](../customization/system-tasks.html#env_SCHEDULE_RESYNC_CRON) | `*/5 * * * *` | Ressincronizar agendamentos |
| [`TOKEN_CLEANUP_CRON`](../customization/system-tasks.html#env_TOKEN_CLEANUP_CRON) | `0 3 * * *` | Tokens expirados |
| [`AUDIT_CLEANUP_CRON`](../customization/system-tasks.html#env_AUDIT_CLEANUP_CRON) | `30 3 * * *` | Limpeza da auditoria |
| [`JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_JOB_CLEANUP_CRON) | `30 2 * * *` | Limpeza de tarefas |
| [`NIGHTLY_BACKUP_CRON`](../customization/system-tasks.html#env_NIGHTLY_BACKUP_CRON) | `0 0 * * *` | Cópia noturna |
| [`STORED_JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_STORED_JOB_CLEANUP_CRON) | `0 4 * * *` | Limpeza de tarefas guardadas |
| [`CONFIG_SEED_RELOAD_CRON`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_CRON) | `* * * * *` | Recarga do config seed |
| [`RUNNER_DISPATCH_SECONDS`](../customization/system-tasks.html#env_RUNNER_DISPATCH_SECONDS) | `2` (1 a 60) | Envio aos runners |
| [`RUNNER_DIAL_SECONDS`](../customization/system-tasks.html#env_RUNNER_DIAL_SECONDS) | `10` (2 a 300) | Ligação a runners de entrada |
| [`RUNNER_PRUNE_SECONDS`](../customization/system-tasks.html#env_RUNNER_PRUNE_SECONDS) | `60` (10 a 3600) | Limpeza de jobs terminados |

Um valor que não seja um cron válido, ou segundos fora dos limites, definido à mão no ambiente, é ignorado em favor da predefinição.

### CONFIG_SEED_RELOAD_SECONDS
{: .no_toc }

Antes da 7.8.0 o config seed era verificado a cada [`CONFIG_SEED_RELOAD_SECONDS`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_SECONDS).
Essa variável está obsoleta desde a 7.8.0, em favor de `CONFIG_SEED_RELOAD_CRON`, e será removida na 8.0. Enquanto
`CONFIG_SEED_RELOAD_CRON` não estiver definida, continua a ser lida como um cron, com um aviso no registo no arranque:

| `CONFIG_SEED_RELOAD_SECONDS` | Lê-se como |
|---|---|
| `60` | `* * * * *`, a cada minuto |
| Um múltiplo de 60 até `3600` | A cada tantos minutos, como `*/5 * * * *` para `300` (`3600` lê-se como `0 * * * *`) |
| Um número abaixo de 60 que divide 60 | A cada tantos segundos |
| `0` | A recarga fica desativada |
| Qualquer outro número | O mais próximo destes, que o registo indica |

O separador **Agendamento** do processo mostra esse cron com a linha *Da variável obsoleta CONFIG_SEED_RELOAD_SECONDS; um cron guardado
aqui substitui-a.* **Guardar** escreve `CONFIG_SEED_RELOAD_CRON`, que prevalece sobre a variável antiga a partir daí.
