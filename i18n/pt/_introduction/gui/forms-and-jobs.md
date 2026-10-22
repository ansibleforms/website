---
layout: default
title: Formulários e tarefas
parent: Visita à interface
nav_order: 1
redirect_from:
  - /gui/login.html
  - /gui/the-dashboard.html
  - /gui/a-form.html
  - /gui/form-json-preview.html
  - /gui/running-job.html
  - /gui/job-output.html
  - /gui/job-logs.html
  - /gui/multi-step.html
  - /gui/schedules.html
translated_from: 951f0d014ee94f1c1c52883277a003d7eb67a6ec
---

# Formulários e tarefas
{: .no_toc }

Iniciar sessão, o painel, preencher um formulário e acompanhar as suas tarefas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Início de sessão

A página de autenticação do utilizador, com suporte para autenticação local, LDAP, Entra ID e OIDC.

![Início de sessão](../assets/screenshots/login.jpg)

---

## O painel

O painel principal mostra todos os formulários disponíveis organizados por categoria.

![Painel](../assets/screenshots/dashboard.jpg)

---

## Um formulário

Um exemplo de um formulário com fontes de dados externas e campos dinâmicos.

![Exemplo de formulário](../assets/screenshots/form.jpg)

---

## Pré-visualização JSON do formulário

Pré-visualize o payload JSON e as variáveis extra passadas ao Ansible antes de executar a tarefa.

![Pré-visualização JSON do formulário](../assets/screenshots/form-json.jpg)

---

## Tarefa em execução

Execução em tempo real de um playbook Ansible com a saída em direto.

![Tarefa em execução](../assets/screenshots/run.jpg)

---

## Saída da tarefa

A saída completa de um playbook Ansible executado.

![Saída da tarefa](../assets/screenshots/job-output.jpg)

---

## Registos de tarefas

Todas as tarefas com o seu estado e as suas horas, filtradas por estado a partir do menu da esquerda.

![Registos de tarefas](../assets/screenshots/job-log.jpg)

---

## Multistep

Uma tarefa multistep, com a saída de cada passo por baixo da tarefa principal. Os formulários multistep estão descontinuados desde a 7: um
[workflow](../workflows/) encadeia playbooks, templates e aprovações em vez disso.

![Formulário multistep](../assets/screenshots/multistep.jpg)

---

## Agendamentos

Agende formulários para serem executados a horas ou intervalos específicos. Os [exemplos de cron](../faq.html#which-cron-expressions-can-i-use) listam expressões
comuns, e explicam em que fuso horário um agendamento é executado.

![Agendamentos](../assets/screenshots/schedules.jpg)
