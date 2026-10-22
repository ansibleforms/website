---
layout: default
title: Estados e tipos
parent: Tarefas
nav_order: 1
translated_from: 5974310f0d30079e77ad45698ed2afb70e68ce1e
---

# Estados e tipos
{: .no_toc }

Todos os estados que uma tarefa pode ter, e os tipos de tarefa
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Estados das tarefas

O AnsibleForms define os seguintes estados numa tarefa. A lista mostra cada estado como uma etiqueta colorida:

| Estado | Significado | O que pode fazer |
|---|---|---|
| `running` | A tarefa está em execução, ou uma tarefa aprovada foi retomada | Acompanhar o seu resultado, interrompê-la |
| `approve` | A tarefa espera num [ponto de aprovação](../forms/approval.html) antes de correr (ou antes de correr um passo de um multistep) | Aprová-la ou rejeitá-la, se uma das suas funções for aprovadora |
| `success` | O playbook, o template ou todos os passos terminaram sem erros | Ver o resultado, relançar, eliminar |
| `failed` | A tarefa terminou com um erro, ou o próprio lançamento falhou | Ver o resultado para saber porquê, relançar, eliminar |
| `warning` | Um multistep terminou, mas falhou um passo que tem `continue` definido | Ver o resultado, relançar, eliminar |
| `aborted` | A tarefa foi interrompida a partir do AnsibleForms, ou a tarefa de AWX / AAP foi cancelada | Ver o resultado, relançar, eliminar |
| `rejected` | Um aprovador rejeitou a tarefa; nunca chegou a correr | Ver o resultado, relançar, eliminar |
| `abandoned` | O AnsibleForms deixou de seguir a tarefa (ver [Tarefas abandonadas](cleanup.html#abandoned-jobs)) | Verificar os hosts geridos, relançar, eliminar |

`running` é azul, `success` verde e lê-se **Bem-sucedidas**, e `failed` vermelho. `approve` é laranja e lê-se **À espera de aprovação**,
para que uma tarefa à espera de uma pessoa se distinga das paradas; `warning`, `aborted` e `rejected` são âmbar. `abandoned` é
cinzento: ninguém a parou, o que a executava desapareceu.

---

## Tipos de tarefa

O tipo de tarefa segue o `type` do formulário que iniciou a tarefa, tal como a lista e a página da tarefa o mostram:

| Tipo mostrado | O que corre |
|---|---|
| `ansible` | Um playbook de Ansible, executado num RTE |
| `awx`, `aap`, `ascender` | Um job template ou workflow template em AWX, AAP ou Ascender |
| `semaphore` | Um template no Semaphore UI |
| `rundeck`, `jenkins` | Um job em Rundeck ou Jenkins |
| `workflow` | Um [workflow](../workflows/), cujos nós de playbook correm como tarefas próprias por baixo dele |
| `multistep` | Obsoleto, use `workflow`: uma sequência de passos, cada um registado como uma tarefa própria por baixo da tarefa principal |

Uma tarefa de template é guardada como tarefa `awx` (também na API REST) e mostrada com o tipo de runner em que correu, independentemente
de como o formulário lhe chamou: um formulário do tipo `awx` que corre num runner AAP mostra `aap`.

Ver [Formulários de Ansible](../forms/ansible.html), [Formulários de AWX](../forms/awx.html), [Formulários de workflow](../forms/workflow.html) e
[Formulários de vários passos](../forms/multistep.html) para o lado do formulário.
