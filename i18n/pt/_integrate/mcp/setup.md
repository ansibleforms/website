---
layout: default
title: Configuração
parent: Servidor MCP
nav_order: 1
translated_from: 700a4267f3326788b8c7e4dcd9ce0b2544b0b17f
---

# Configuração
{: .no_toc }

Ative o servidor e autentique o cliente
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Ativá-lo

Defina [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) como `1`, ou ative-o em **Definições > Ligações > MCP**
(consulte [A página MCP](#the-mcp-page)). Alterado na página de definições, o interruptor aplica-se de imediato, sem reinício. Enquanto estiver
desligado, o endpoint responde `404`. O endpoint é:

```
POST <your url>/api/v2/mcp
```

Usa Streamable HTTP sem estado com respostas JSON simples, por isso `GET` e `DELETE` devolvem 405.

---

## Limitar o que os agentes podem fazer

Mais dois interruptores restringem o servidor MCP para todos os clientes. Tal como `ENABLE_MCP`, aplicam-se sem reinício:

| Variável | Com `1` |
|---|---|
| [`MCP_READ_ONLY`](../customization/features.html#env_MCP_READ_ONLY) | O servidor não oferece nenhuma das ferramentas que lançam, planeiam ou alteram (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job`, `delete_stored_job`), e recusa-as. Os agentes podem listar, ler e preencher formulários, ler agendamentos e tarefas guardadas, e acompanhar tarefas, mas não lançam nem alteram nada: uma forma segura de experimentar um agente. |
| [`MCP_CHAT_FORMS_ONLY`](../customization/features.html#env_MCP_CHAT_FORMS_ONLY) | Os agentes só veem os formulários que definem `enableForChat: true`, a mesma lista que o [assistente de chat](../chat/). Qualquer outro formulário, e qualquer tarefa de um deles, responde como não encontrado. |

Ambos estão desligados por predefinição: os agentes veem todos os formulários que as funções do utilizador permitem, e podem lançá-los.

---

## A página MCP

**Definições > Ligações > MCP** contém as definições do servidor MCP em dois separadores.

- **Geral** tem os três interruptores, `ENABLE_MCP`, `MCP_READ_ONLY` e `MCP_CHAT_FORMS_ONLY`, guardados com **Guardar**. Os outros
  dois só podem ser alterados enquanto o servidor MCP estiver ligado.
- **Configuração do cliente** mostra o **Endpoint**, com um botão para o copiar, e uma configuração pronta para **Claude Code**
  (`.mcp.json`, ou um comando `claude mcp add`), **Cursor** (`~/.cursor/mcp.json`), **VS Code** (`.vscode/mcp.json`, que pede
  o token quando o servidor arranca pela primeira vez) e **Codex** (`~/.codex/config.toml`, com o token na
  variável de ambiente `ANSIBLEFORMS_TOKEN`). Cada um tem o seu botão de cópia; substitua `<your-token>` por um token seu, criado
  com a ligação **Criar um token**.

O endpoint é construído a partir do URL da aplicação (**Definições > URL**) quando está definido, caso contrário a partir do endereço do navegador.

---

## Autenticação

Todos os pedidos precisam de um token de acesso do AnsibleForms:

```
Authorization: Bearer <token>
```

Obtenha um da forma habitual (`POST /api/v2/auth/login`, ou os fluxos OIDC / Entra ID) e
renove-o com `POST /api/v2/token`. Propositadamente, **não há nenhuma ferramenta de início de sessão**: uma palavra-passe passada como
argumento de uma ferramenta acabaria no contexto do modelo de linguagem e no seu histórico de chat.

As funções do utilizador também têm de permitir o servidor MCP, através da [opção de função](../config/roles.html) `allowMcp`. Quando nenhuma função
do utilizador a define, segue `allowChat`, que está ativada por predefinição. Um utilizador a quem é negado recebe `403` em todos os pedidos.

- **Um backend de chat** inicia ele próprio a sessão do utilizador, guarda o refresh token e passa o token de acesso
  em cada chamada MCP.
- **Um cliente de IDE** precisa de um token que dure o suficiente para ser configurado uma vez. Com uma função
  que tenha a opção `allowApiTokens`, crie um em
  [Perfil > Tokens de API](../profile/api-token.html), ou inicie sessão com `?expiryDays=<n>` no
  URL de início de sessão para um token válido durante esse número de dias.

Para ligar um agente de programação com um token desses:

<div class="af-tabs" data-tab-group="mcpclient">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="claude" aria-selected="true">Claude Code</button>
<button type="button" role="tab" class="af-tab" data-tab="codex" aria-selected="false">Codex</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="claude" markdown="1">

Adicione o servidor com o token como cabeçalho:

```bash
claude mcp add --transport http ansibleforms https://af.example.com/api/v2/mcp \
  --header "Authorization: Bearer <token>"
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="codex" markdown="1" hidden>

Adicione o servidor a `~/.codex/config.toml`, com o token lido de uma variável de ambiente:

```toml
[mcp_servers.ansibleforms]
url = "https://af.example.com/api/v2/mcp"
bearer_token_env_var = "ANSIBLEFORMS_TOKEN"
```

Depois defina a variável antes de iniciar o Codex:

```bash
export ANSIBLEFORMS_TOKEN=<token>
```

</div>
</div>
