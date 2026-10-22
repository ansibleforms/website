---
layout: default
title: O que é o AnsibleForms
nav_order: 1
translated_from: a331f74d2fa27a41cd4321b636ac9640550cac26
---

# O que é o AnsibleForms
{: .no_toc }

Formulários self-service à frente do Ansible e do AWX, e quando precisa deles
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## O que faz

O AnsibleForms coloca um formulário web à frente de um playbook, de um workflow, ou de um template ou job no AWX, AAP, Ascender, Semaphore, Rundeck
ou Jenkins, para que as pessoas possam executar automação sem a linha de comandos.

Um formulário recolhe os dados, verifica-os, transforma-os em extravars e lança a tarefa. Os dados de um formulário podem vir de bases de dados,
APIs REST, ficheiros e outros campos, e cada lançamento fica registado no histórico de tarefas com a sua saída.

---

## Utilizações típicas

As equipas usam o AnsibleForms para entregar a automação de rotina às pessoas que a pedem:

* **Pedidos self-service** : uma máquina virtual, um volume de armazenamento, uma partilha ou uma conta de utilizador, preenchidos por quem os pede
* **Operações protegidas** : ações com pontos de aprovação, para que uma segunda pessoa dê o aval antes de a tarefa ser executada
* **Escolhas orientadas por dados** : listas pendentes preenchidas a partir de uma CMDB, de uma base de dados ou de uma API REST, encadeadas de um campo para o seguinte
* **Tarefas recorrentes** : formulários executados mais tarde ou num agendamento cron, sempre com os mesmos dados validados
* **Automação para ferramentas e agentes** : a API REST, o servidor MCP e o assistente de chat lançam os mesmos formulários

---

## AnsibleForms ou surveys do AWX?

O AWX, o AAP e o Ascender têm surveys próprios. Qual se adequa depende do que as pessoas que lançam as tarefas precisam.

Um **survey** é suficiente quando:

* as perguntas são fixas: texto, números, palavras-passe e opções de uma lista estática
* os utilizadores já trabalham no AWX, AAP ou Ascender, e as suas permissões servem-lhes
* não quer executar e manter outra aplicação e outra base de dados

O **AnsibleForms** ajuda quando:

* as opções vêm de outro sítio: uma base de dados, uma API REST, um ficheiro ou outro campo (listas pendentes encadeadas)
* os dados precisam de validação, de estrutura (listas, objetos aninhados) ou de valores calculados antes de chegarem ao playbook
* as tarefas precisam de pontos de aprovação, de agendamento ou de um workflow que encadeie playbooks, templates e aprovações a partir de um formulário
* os utilizadores não devem ver o AWX de todo, ou também executa playbooks sem o AWX

O AnsibleForms lança templates do AWX, AAP e Ascender, por isso os dois funcionam em conjunto: os formulários recolhem e moldam os dados, e
o AWX continua a executar as tarefas.

---

## Por onde continuar

O resto desta secção explica as peças antes de instalar:

| Página | O que abrange |
|---|---|
| [Como funciona](how-it-works.html) | A arquitetura, os passos de um lançamento e onde os dados são guardados |
| [Visita à interface](gui/) | Capturas de ecrã de todos os ecrãs, desde o início de sessão até às páginas de administração |
| [Conceitos](concepts.html) | Os termos usados ao longo desta documentação |
| [Pré-requisitos](prerequisites.html) | O que precisa antes de instalar |
