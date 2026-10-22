---
layout: default
title: Servidor MCP
nav_order: 2
has_children: true
has_toc: false
permalink: /mcp/
translated_from: a5acf44b528914d81ce5c387c685d4fd41a0fdd6
---

# Servidor MCP
{: .no_toc }

Deixe os agentes de IA usar os seus formulários através do Model Context Protocol
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores e integradores: deixe os clientes MCP listar, preencher e lançar formulários como o utilizador cujo token possuem.

O AnsibleForms pode servir um
servidor [Model Context Protocol](https://modelcontextprotocol.io), para que um cliente MCP, como
um backend de chat ou um assistente de IDE, possa listar os formulários que um utilizador pode usar, determinar os seus campos,
lançar tarefas e acompanhar o seu progresso.

---

## O que é, e o que não é

O servidor MCP é uma interface técnica para o mesmo fluxo de formulários que o navegador usa. É executado
**como o utilizador cujo token recebe**: as mesmas funções nos formulários, a mesma visibilidade das tarefas, as
mesmas verificações das extravars reservadas que numa submissão a partir do navegador.

Não acrescenta nenhuma política de IA própria. Se um agente tem de pedir confirmação antes de um lançamento,
que formulários pode usar ou quantos pedidos pode fazer, cabe ao cliente MCP decidir. A
ferramenta de lançamento está marcada como destrutiva, por isso um cliente bem comportado pede confirmação primeiro,
mas o servidor não o impõe.

---

## Nesta secção

Cada tema tem uma página própria:

| Página | O que abrange |
|---|---|
| [Configuração](setup.html) | Ativar o servidor e autenticar o cliente |
| [Ferramentas](tools.html) | As ferramentas que um agente usa para preencher, aprovar e relançar formulários |
| [Limitações](limitations.html) | As expressões executadas no servidor, e o que o servidor MCP não faz |
