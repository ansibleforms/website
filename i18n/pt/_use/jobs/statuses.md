---
layout: default
title: Estados e tipos
parent: Tarefas
nav_order: 1
translated_from: de3ae8ab9d1bd42e3d78336c40b963276b936ff4
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
| `warning` | O playbook terminou mas [requer atenção](#a-job-that-needs-attention): alguém tem de lhe dar seguimento. Ou um multistep terminou, mas falhou um passo que tem `continue` definido | Ler o motivo na página da tarefa, dar-lhe seguimento, relançar, eliminar |
| `aborted` | A tarefa foi interrompida a partir do AnsibleForms, ou a tarefa de AWX / AAP foi cancelada | Ver o resultado, relançar, eliminar |
| `rejected` | Um aprovador rejeitou a tarefa; nunca chegou a correr | Ver o resultado, relançar, eliminar |
| `abandoned` | O AnsibleForms deixou de seguir a tarefa (ver [Tarefas abandonadas](cleanup.html#abandoned-jobs)) | Verificar os hosts geridos, relançar, eliminar |

`running` é azul, `success` verde e lê-se **Bem-sucedidas**, e `failed` vermelho. `approve` é laranja e lê-se **À espera de aprovação**,
para que uma tarefa à espera de uma pessoa se distinga das paradas; `warning` lê-se **Requer atenção**, e tal como `aborted` e `rejected` é âmbar. `abandoned` é
cinzento: ninguém a parou, o que a executava desapareceu.

---

## Uma tarefa que requer atenção

A partir da 7.8.0, um playbook que terminou como previsto, mas que deixa trabalho para um operador (uma aprovação noutro sítio,
um passo manual, uma aplicação parcial), pode terminar a sua tarefa como **Requer atenção** (`warning`) com uma mensagem, em vez de um
`failed` que parece automação avariada ou de um `success` que esconde o que falta fazer. O playbook indica-o de uma de duas formas:

* um **ficheiro de estado** junto ao playbook, `<playbook_dir>/.joblogs/job_status_<jobid>.yml` (ou `.yaml`), num RTE. O RTE
  lê-o assim que o playbook termina e depois remove-o
* **`set_stats`** com a chave `af_job_status`, num RTE e no AWX, AAP ou Ascender

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

O AnsibleForms passa `__jobid__` nas extravars, para que o playbook possa construir o caminho do ficheiro. O ficheiro prevalece
quando um playbook faz as duas coisas.

* Só um playbook **bem-sucedido** pode terminar como Requer atenção: uma tarefa falhada fica `failed` e uma interrompida `aborted`,
  diga o ficheiro o que disser
* Um ficheiro inválido (sem mensagem, outro estado, YAML com erros) é ignorado: a tarefa continua bem-sucedida, e o seu resultado
  explica porquê numa linha `[WARNING]`
* A mensagem aparece na página da tarefa numa caixa âmbar, com o detalhe recolhido por baixo como YAML, como tooltip do estado na
  lista, e na última linha do resultado da tarefa. **Requer atenção** em **Passado** no menu de tarefas lista estas tarefas
* As [notificações](../forms/notifications.html) com `onStatus: [warning]` são enviadas para estas tarefas; o mail e os canais levam
  a mensagem, um webhook como [{% raw %}`{{statusMessage}}`{% endraw %}](../notification-channels/webhook.html)
* Num multistep, um passo que requer atenção é dado como concluído e o passo seguinte é executado; o multistep passa então também a
  requerer atenção. Num [workflow](../workflows/), a tarefa conta como bem-sucedida para o nó seguinte

As tarefas de Semaphore, Rundeck e Jenkins não podem terminar como Requer atenção.

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
