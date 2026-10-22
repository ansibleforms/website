---
layout: default
title: Tarefas guardadas
parent: Tarefas
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: c4e55de429d31936d8735965a2f487c070b9140d
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
**Nome**, uma **Descrição** opcional e uma data em **Expira em (opcional)**, e guarde. Os campos de palavra-passe e de constantes
nunca são guardados. Um subformulário tem a mesma ação **Guardar** ao lado do seu botão **Guardar**, e mantém valores inacabados sem
os validar.

Para carregar, selecione **Carregar dos guardados** no topo do formulário. **Carregar formulário guardado** lista as suas tarefas guardadas para esse formulário, com
as suas datas de criação e de expiração; selecione uma para preencher o formulário com os seus valores. Nada corre até submeter.

As tarefas guardadas ficam na base de dados do AnsibleForms (tabela `stored_jobs`), com o nome do formulário, o seu utilizador como
`<type>/<username>` (por exemplo `local/admin`) e os valores em JSON. Um nome tem de ser único por utilizador e formulário; guardar
uma segunda com o mesmo nome falha com "Já existe um formulário guardado com este nome".

---

## Gerir as tarefas guardadas

A página **Tarefas guardadas** lista as tarefas guardadas com o seu formulário, utilizador e datas de criação e de expiração, e precisa de `allowStoredJobs`.

- **Editar** abre a página própria da tarefa guardada: os seus **Detalhes** (nome, formulário, expiração) e os seus **Valores**, os
  valores dos campos guardados em YAML, que aí podem ser alterados e guardados.
- **Abrir no formulário** abre o seu formulário com os valores guardados preenchidos; nada corre até submeter.
- **Eliminar** remove-a. Pode eliminar as suas próprias tarefas guardadas; os utilizadores com `showSettings` podem eliminar qualquer uma.
- As tarefas guardadas com uma data em **Expira em** no passado são eliminadas automaticamente todos os dias às 04:00 (em `LOG_TZ`).
