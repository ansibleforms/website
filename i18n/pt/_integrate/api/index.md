---
layout: default
title: API REST
nav_order: 3
has_children: true
has_toc: false
permalink: /api/
translated_from: e14092fbd301073c7ed9be6839530efae43d4c6b
---

# API REST
{: .no_toc }

Lance formulários e faça a gestão do AnsibleForms a partir de scripts
{: .fs-6 .fw-300 }

---

Para programadores e engenheiros de automação: lance formulários e faça a gestão do AnsibleForms a partir de scripts.

Tudo o que a interface web faz passa pela API REST, por isso os scripts e outras ferramentas podem fazer o mesmo.

---

## Visão geral

A API é servida em `/api/v2` no servidor do AnsibleForms:

* **Referência completa** : estas páginas tratam do que os scripts mais usam. Todos os endpoints estão descritos, e podem ser experimentados, na
  página Swagger incorporada no servidor, `https://<your server>/api/v2/docs`.
* **Permissões** : uma chamada é executada como o utilizador cujo token transporta, com as funções desse utilizador, tal como no navegador.
* **Validação do lançamento** : as tarefas lançadas através da API podem ser verificadas tal como os lançamentos no navegador
  (consulte [Validação do lançamento](../launch-validation/)).
* **Limites de pedidos** : só os endpoints de início de sessão, de fim de sessão, de renovação do token e de início de sessão único, a alteração da palavra-passe
  (`PUT /api/v2/profile`) e os endpoints de tokens de API (`POST` e `DELETE /api/v2/profile/tokens`) estão limitados (consulte
  [Autenticação](authentication.html)). As outras chamadas não têm limite de pedidos (o [assistente de chat](../chat/) tem limites
  próprios), por isso um script deve controlar o seu próprio ritmo, por exemplo quando acompanha uma tarefa.

---

## Nesta secção

Cada tema tem uma página própria:

| Página | O que abrange |
|---|---|
| [Autenticação](authentication.html) | Iniciar sessão, renovar o token ou usar um token de longa duração |
| [Tarefas](jobs.html) | Lançar um formulário, acompanhar a tarefa, abortá-la, relançá-la ou aprová-la |
| [Respostas e erros](responses.html) | O formato de uma resposta e os códigos de estado |
| [Eventos em direto](events.html) | Saber quando as tarefas e as definições mudam, em vez de fazer polling |
