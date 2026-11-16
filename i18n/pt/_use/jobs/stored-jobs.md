---
layout: default
title: Tarefas guardadas
parent: Tarefas
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: c3ccb3044f19e33eaa03668524bd617b0af6c033
---

# Tarefas guardadas
{: .no_toc }

Guardar os dados de um formulário para os carregar de novo mais tarde
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Tarefas guardadas

As tarefas guardadas mantêm os valores de um formulário para que os possa carregar de novo, em vez de preencher sempre os mesmos campos.

Para guardar, preencha o formulário, abra a lista pendente ao lado de **Submeter** e escolha **Guardar**. Em **Guardar dados do formulário**, introduza um
**Nome**, uma **Descrição** opcional e quando é removida em **Removido** (ver [Quando é removida](#when-it-is-removed)), e guarde. Os campos de
palavra-passe e de constantes nunca são guardados. Um subformulário tem a mesma ação **Guardar** ao lado do seu botão **Guardar**, e mantém valores
inacabados sem os validar.

Para carregar, selecione **Carregar dos guardados** no topo do formulário. **Carregar formulário guardado** lista as suas tarefas guardadas para esse formulário, com
as suas datas de criação e de expiração; selecione uma para preencher o formulário com os seus valores. Nada corre até submeter.

As tarefas guardadas ficam na base de dados do AnsibleForms (tabela `stored_jobs`), com o nome do formulário, o seu utilizador como
`<type>/<username>` (por exemplo `local/admin`) e os valores em JSON. Um nome tem de ser único por utilizador e formulário; guardar
uma segunda com o mesmo nome falha com "Já existe um formulário guardado com este nome".

---

## Gerir as tarefas guardadas

A página **Tarefas guardadas** lista as tarefas guardadas com o seu formulário, utilizador e datas de criação e de expiração, e precisa de `allowStoredJobs`.

A partir da 7.6.0, `allowStoredJobs` sozinho abre **Tarefas > Guardados** e **Adicionar tarefa guardada**, que antes também exigiam
`showSettings` ou `allowScheduledJobs`. A sua lista **Formulário** oferece os formulários que as suas funções abrem; os utilizadores com
`showSettings` ou `allowScheduledJobs` veem todos os formulários.

A partir da 7.7.0 a lista tem uma coluna ordenável **Última utilização**, que separa as tarefas guardadas em uso das abandonadas.

- **Editar** abre a página própria da tarefa guardada: os seus **Detalhes** (nome, descrição, formulário, utilizador, quando foi criada e usada pela
  última vez, e quando é removida), os seus **Valores**, os valores dos campos guardados em YAML, que aí podem ser alterados e guardados, e as suas **Execuções**.
- **Abrir no formulário** abre o seu formulário com os valores guardados preenchidos; nada corre até submeter.
- **Eliminar** remove-a. Pode eliminar as suas próprias tarefas guardadas; os utilizadores com `showSettings` podem eliminar qualquer uma.

---

## Última utilização e execuções

A partir da 7.7.0 uma tarefa guardada regista a última utilização e as tarefas lançadas a partir dela, para saber quais ainda se usam.

Estes lançamentos contam como uma utilização de uma tarefa guardada:

| Lançamento | Quando conta |
|---|---|
| O formulário aberto a partir dela (**Abrir no formulário**), ou preenchido com **Carregar dos guardados** | Quando a tarefa é lançada |
| **Executar mais tarde** a partir desse formulário | Quando a execução planeada dispara, não quando é planeada |
| Um **relançamento** de uma tarefa lançada a partir dela | Quando o relançamento começa, com os mesmos valores ou com valores alterados |
| O `launch_job` ou `plan_job` do MCP com ela | Como acima |

As execuções de um agendamento nunca contam, nem mesmo as de um criado a partir de uma tarefa guardada: um agendamento mantém a sua própria cópia dos
valores. Um lançamento só conta se o utilizador puder ver a tarefa guardada; uma eliminada ou ocultada entretanto é ignorada e a tarefa corre na
mesma.

A página da tarefa indica a tarefa guardada a partir da qual foi lançada, com uma ligação, quando a pode ver. O separador **Execuções** da página da
tarefa guardada lista as tarefas lançadas a partir dela que pode ver, com o seu estado, início, fim e duração.

---

## Quando é removida

Cada tarefa guardada indica quando é removida: nunca, numa data ou quando fica alguns dias sem uso.

| Opção | O que faz |
|---|---|
| **Nunca** | Mantém-na até alguém a eliminar. Não é oferecida enquanto `STORED_JOB_UNUSED_DAYS` estiver definida |
| **Numa data** | Remove-a nessa data |
| **Se não for usado em N dias** | Remove-a quando nenhuma tarefa foi lançada a partir dela durante esses dias |

Um administrador pode definir [`STORED_JOB_UNUSED_DAYS`](../customization/retention.html#env_STORED_JOB_UNUSED_DAYS)
(Definições > Geral > Retenção). Então remove todas as tarefas guardadas sem uso durante esses dias, os dias próprios de uma tarefa guardada só
podem ser menos, a caixa de diálogo Guardar começa com eles, e uma removida numa data também é removida quando fica esse tempo sem uso. Os dias
contam desde a última utilização ou, para uma tarefa guardada nunca usada, desde que foi guardada. O seu valor predefinido, 0, nunca remove uma por
não ser usada.

As tarefas guardadas são removidas todos os dias às 04:00 (em `LOG_TZ`), no que chegar primeiro: a sua data ou os seus dias.
