---
layout: default
title: Tarefas
nav_order: 3
has_children: true
has_toc: false
redirect_from:
  - /jobs.html
permalink: /jobs/
translated_from: 5ebe08c87f55b79169432884bb849e27dde03cb2
---

# Tarefas
{: .no_toc }

Acompanhar, interromper, relançar, aprovar e eliminar as tarefas que os seus formulários iniciam
{: .fs-6 .fw-300 }

---

Para todos os que lançam formulários: o que é uma tarefa, onde a encontrar e quem a pode ver.

---

## O que é uma tarefa

Uma tarefa é uma execução de um formulário: o AnsibleForms regista-a com o seu estado, extravars e resultado assim que o formulário é submetido.

Cada tarefa guarda:

* o **formulário** que executou e o **utilizador** que a lançou (com o tipo de utilizador, como `local` ou `ldap`);
* o seu **tipo de tarefa** e **estado**, e a sua **hora de início** e **hora de fim**;
* o seu **resultado**, as extravars e as credenciais com que foi executada, e os valores dos campos introduzidos no formulário.

Um formulário multistep cria uma tarefa para o formulário e uma tarefa por passo. Os passos estão ligados à tarefa principal e são listados por baixo dela.

As mesmas tarefas podem ser lançadas, acompanhadas e geridas através da [API REST](../api/jobs.html).

---

## A página Tarefas

A ligação **Tarefas** no cabeçalho abre a lista de todas as tarefas, das mais recentes para as mais antigas (`/jobs/all`). A página e a sua ligação são mostradas aos utilizadores
cuja função define a [opção de função](../config/roles.html#role-options) `showJobs`.

![A lista de tarefas](../assets/screenshots/job-log.jpg)

O menu da esquerda organiza as tarefas no tempo, com o número de tarefas em cada entrada; uma entrada de estado filtra a lista por esse estado:

| Secção | Entrada do menu | Mostra |
|---|---|---|
| **Passado** | **Bem-sucedidas** | Tarefas com o estado `success` |
| | **Falhadas** | Tarefas com o estado `failed` |
| | **Interrompidas** | Tarefas com o estado `aborted` |
| | **Rejeitado** | Tarefas com o estado `rejected` |
| | **Abandonado** | Tarefas com o estado `abandoned` |
| **Presente** | **Em execução** | Tarefas com o estado `running` |
| | **À espera de aprovação** | Tarefas com o estado `approve`; a contagem fica laranja quando há uma à espera |
| **Futuro** | **Agendados** | A página [Agendamentos](schedules.html) (opção de função `allowScheduledJobs`) |
| | **Guardados** | A página [Tarefas guardadas](stored-jobs.html) (opção de função `allowStoredJobs`) |

O menu não tem nenhuma entrada para todas as tarefas: a ligação **Tarefas** do cabeçalho mostra-as todas, incluindo as tarefas `warning`.

Por cima da tabela, na linha do título:

* a **caixa de pesquisa** mantém as tarefas cujas colunas visíveis contêm o texto (sem distinguir maiúsculas de minúsculas), ou que tenham um passo com esse texto como id
  ou destino;
* **Eliminar** (com o número de tarefas marcadas) elimina em conjunto as tarefas marcadas na primeira coluna;
* **Colunas** mostra ou oculta as colunas `id`, `form`, `job type`, `status`, `start time`, `end time`, `duration` e `user`;
  a duração de uma tarefa em execução vai aumentando;
* **Atualizar** recarrega a lista.

A lista carrega as tarefas mais recentes, tantas quantas indica a definição [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE)
(**Definições > Sistema > Geral**, separador **Tarefas**, `1000` por predefinição); as suas páginas, a pesquisa e os filtros abrangem essas tarefas.

Cada coluna pode ser ordenada e tem o seu próprio campo de filtro. Uma tarefa multistep tem uma seta mesmo antes do seu `form` que expande
os seus passos; um clique no resto de uma linha abre a tarefa.

O sino do cabeçalho conta as tarefas que aguardam a sua aprovação e abre a lista em **À espera de aprovação**. Para os utilizadores que podem ver
os runners, conta também os [runners a aguardar aprovação](../runners/registration.html#approving-an-rte), RTE que pediram para se juntar,
e abre **Ligações > Runners** quando só há runners à espera. Com ambos à espera, abre um menu, **Trabalhos a aguardar aprovação** e
**Runners a aguardar aprovação**, cada um com a sua contagem.

---

## Quem vê que tarefas

As tarefas que um utilizador vê dependem das suas funções:

| Utilizador | Vê |
|---|---|
| Administrador (função `admin`) | Todas as tarefas |
| Opção de função `showAllJobLogs` | Todas as tarefas |
| Opção de função `manageAllJobs` (a partir da 7.3.0) | Todas as tarefas, e pode interrompê-las, eliminá-las e relançá-las |
| Qualquer outro utilizador | As suas próprias tarefas, e as tarefas que aguardam uma aprovação que indique uma das suas funções |

Até à 7.2, qualquer utilizador podia abrir qualquer tarefa à espera de aprovação, incluindo as suas extravars e o seu resultado; a partir da 7.3.0 só o seu dono e os seus
aprovadores o podem fazer. Ver uma tarefa não concede todas as ações sobre ela: interromper, eliminar e relançar a tarefa de outro utilizador exige ser administrador ou
ter `manageAllJobs`, e `showAllJobLogs` só mostra as tarefas. Eliminar também precisa de `allowJobDeletion` e relançar de `allowJobRelaunch`.

---

## Nesta secção

Cada tema tem a sua própria página:

| Página | O que abrange |
|---|---|
| [Estados e tipos](statuses.html) | Todos os estados que uma tarefa pode ter, e os tipos de tarefa |
| [Acompanhar uma tarefa](following.html) | Resultado em direto, extravars, filtros e transferências |
| [Ações sobre tarefas](actions.html) | Lançar, interromper, relançar, aprovar ou rejeitar, e eliminar uma tarefa |
| [Agendamentos](schedules.html) | Executar um formulário mais tarde ou segundo um agendamento cron, e gerir todos os agendamentos |
| [Tarefas guardadas](stored-jobs.html) | Guardar os dados de um formulário para os carregar de novo mais tarde |
| [Limpeza](cleanup.html) | Tarefas interrompidas por um reinício, e durante quanto tempo se guardam as tarefas terminadas |
