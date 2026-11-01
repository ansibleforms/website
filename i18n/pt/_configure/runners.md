---
layout: default
title: Runners
nav_order: 12
has_children: true
has_toc: false
permalink: /runners.html
translated_from: e6663cf2e7dc14a1559383c7f49fd968a4cbf635
---

# Runners
{: .no_toc }

Onde as tarefas correm: contentores de ambiente de execução para playbooks, e AWX, AAP, Ascender, Semaphore, Rundeck ou Jenkins para templates
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: adicione os runners onde as suas tarefas correm, escolha o predefinido de cada tipo, aprove os RTE que pedem para aderir, e teste-os.

---

## Nesta secção

| Página | O que abrange |
|---|---|
| [A página de runners](runners/list.html) | A lista de runners, adicionar um, ativar ou desativar um, e o predefinido de cada tipo |
| [Tipos de runner](runners/types.html) | Os produtos que um runner pode ser, o seu endereço e o seu acesso |
| [Registo](runners/registration.html) | Como um RTE pede para aderir e é aprovado, join tokens para instalações sem intervenção, e o modo base de dados |
| [A página de um runner](runners/runner-page.html) | Os separadores de um runner, o modo e a ligação de um RTE, e Testar ligação |
| [Quem gere os runners](runners/permissions.html) | Quem pode adicionar, alterar e testar runners |


---

## Como funciona

Desde a versão 7, a aplicação não corre nada ela própria: cada tarefa corre num **runner**, adicionado em **Ligações > Runners**.
O tipo de um formulário decide de que tipo de runner precisa:

| Tipo de formulário | Corre num runner do tipo | O que corre |
|---|---|---|
| `ansible` | RTE | Um playbook, num contentor de ambiente de execução |
| `awx`, `aap`, `ascender` | AWX (as variantes AWX, AAP e Ascender) | Um job template ou workflow template |
| `semaphore` | Semaphore | Um template do Semaphore UI |
| `rundeck` | Rundeck | Um job do Rundeck |
| `jenkins` | Jenkins | Um job do Jenkins |

Um formulário `workflow` ou `subform` não tem runner próprio: cada nó de um [workflow](workflows/) escolhe o seu. Um nó
com um `runner:` corre nesse runner (um RTE, ou um template ou job no AWX, Semaphore, Rundeck ou Jenkins), qualquer outro no
RTE predefinido, por isso os nós de uma tarefa podem correr em runners diferentes. O formulário `multistep`, obsoleto desde a 7 e
substituído pelos workflows, funciona da mesma forma: cada um dos seus passos corre no runner de que o seu próprio tipo precisa.

Um formulário escolhe o seu runner de uma de duas formas:

- **Pelo nome**: `runner: <name>` no formulário, num nó de workflow, ou num passo de um multistep obsoleto (também nas
  definições do formulário no designer). O runner tem de ser do tipo de que o formulário precisa, ou a tarefa falha. O antigo `awx: <name>`
  continua a funcionar, regista um aviso de obsolescência, e desaparece na 8.
- **Como predefinido**: um formulário que não nomeia nenhum runner corre no runner predefinido do seu tipo. Sem nenhum, a tarefa falha
  com uma mensagem que diz que tipo de runner adicionar.

Um runner desativado em **Ligações > Runners** não recebe nenhuma tarefa, nem pelo nome nem como predefinido: a tarefa falha e diz para o ativar
ou para nomear outro runner (consulte [Predefinido e Ativado](runners/list.html#default-and-enabled)).

