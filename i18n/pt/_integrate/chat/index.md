---
layout: default
title: Assistente de chat
nav_order: 1
has_children: true
has_toc: false
permalink: /chat/
translated_from: 7c15de43a5f69fd80751b38b0fd379f282ffd84c
---

# Assistente de chat
{: .no_toc }

Preencha e lance formulários através de uma conversa
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para os administradores que o ativam, e para os utilizadores que conversam com ele: preencha e lance formulários através de uma conversa.

Um botão de chat em todas as páginas abre um
assistente que encontra o formulário certo, pede a informação em falta, oferece as próprias
opções do formulário como botões e mostra um resumo com um botão **Iniciar**. Uma tarefa só começa quando o utilizador clica nele.

---

## Como funciona

O assistente comunica com o modelo de IA através do servidor, que responde aos pedidos do modelo usando o mesmo motor de formulários que o navegador:

```text
the user types           -> AnsibleForms server -> the AI model (Anthropic, OpenAI, ...)
                                   |                  asks for a tool
                                   v
                         catalog | resolve | relaunch preview | job status
                                   |   the same form engine as the browser and the MCP server,
                                   |   as the logged-in user, with their roles
                                   v
the page shows the reply, the choices, and a summary card with a Launch button
the user clicks Launch   -> AnsibleForms resolves the form again and launches exactly that payload, once
```

- **As chamadas ao modelo partem do servidor**, nunca do navegador, por isso a chave de API fica no servidor
  (consulte [Fornecedores](providers.html)).
- **O modelo não pode lançar nada.** Prepara um resumo de utilização única; Iniciar volta a verificá-lo antes de o executar.
- **O utilizador escolhe os alvos.** As opções e os nomes obrigatórios vêm do utilizador, nunca do modelo.
- **Escrever "sim" ou "lançar" não faz nada.** Só o botão lança uma tarefa.

---

## Nesta secção

Cada tema tem uma página própria:

| Página | O que abrange |
|---|---|
| [Ativá-lo](switching-it-on.html) | Ativar o assistente e disponibilizar formulários nele |
| [Fornecedores](providers.html) | O modelo de linguagem por trás do assistente, e proxies |
| [Privacidade e limites](privacy-and-limits.html) | O que sai da rede, e os limites por utilizador |
| [Relançamento e auditoria](relaunching-and-audit.html) | Relançar a partir do chat, o registo de auditoria e as limitações |
