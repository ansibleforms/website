---
layout: default
title: Setup
parent: MCP server
nav_order: 1
---

# Setup
{: .no_toc }

Switch the server on and authenticate the client
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Enabling it

Set [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) to `1`, or switch it on under **Settings > Connections > MCP**
(see [The MCP page](#the-mcp-page)). Changed on the settings page, the switch applies at once, without a restart. While it is
off, the endpoint answers `404`. The endpoint is:

```
POST <your url>/api/v2/mcp
```

It uses stateless Streamable HTTP with plain JSON responses, so `GET` and `DELETE` return 405.

---

## Limiting what agents can do

Two more switches narrow the MCP server for every client. Like `ENABLE_MCP`, they apply without a restart:

| Variable | With `1` |
|---|---|
| [`MCP_READ_ONLY`](../customization/features.html#env_MCP_READ_ONLY) | The server offers none of the tools that launch, plan or change (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job`, `delete_stored_job`), and refuses them. Agents can list, read and fill in forms, read schedules and stored jobs, and follow jobs, but launch or change nothing: a safe way to try an agent. |
| [`MCP_CHAT_FORMS_ONLY`](../customization/features.html#env_MCP_CHAT_FORMS_ONLY) | Agents only see the forms that set `enableForChat: true`, the same list as the [chat assistant](../chat/). Any other form, and any job of one, answers as not found. |

Both are off by default: agents see every form the user's roles allow, and may launch them.

---

## The MCP page

**Settings > Connections > MCP** holds the MCP server's settings in two tabs.

- **General** has the three switches, `ENABLE_MCP`, `MCP_READ_ONLY` and `MCP_CHAT_FORMS_ONLY`, saved with **Save**. The two
  others can only be changed while the MCP server is on.
- **Client configuration** shows the **Endpoint**, with a button to copy it, and a ready configuration for **Claude Code**
  (`.mcp.json`, or a `claude mcp add` command), **Cursor** (`~/.cursor/mcp.json`), **VS Code** (`.vscode/mcp.json`, which asks
  for the token when the server first starts) and **Codex** (`~/.codex/config.toml`, with the token in the
  `ANSIBLEFORMS_TOKEN` environment variable). Each has its copy button; replace `<your-token>` with a token of your own, made
  with the **Create a token** link.

The endpoint is built from the app's URL (**Settings > URL**) when it is set, else from the address of the browser.

---

## Authentication

Every request needs an AnsibleForms access token:

```
Authorization: Bearer <token>
```

Obtain one in the usual way (`POST /api/v2/auth/login`, or the OIDC / Entra ID flows) and
refresh it with `POST /api/v2/token`. There is deliberately **no login tool**: a password passed as a
tool argument would end up in the language model's context and its chat history.

The user's roles must also allow the MCP server, through the `allowMcp` [role option](../config/roles.html). When no role
of the user sets it, it follows `allowChat`, which is on by default. A user it is denied to gets `403` on every request.

- **A chat backend** logs the user in itself, keeps the refresh token and passes the access
  token on every MCP call.
- **An IDE client** needs a token that lasts long enough to be configured once. With a role
  that has the `allowApiTokens` option, create one under
  [Profile > API tokens](../profile/api-token.html), or log in with `?expiryDays=<n>` on the
  login URL for a token valid that many days.

To connect a coding agent with such a token:

<div class="af-tabs" data-tab-group="mcpclient">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="claude" aria-selected="true">Claude Code</button>
<button type="button" role="tab" class="af-tab" data-tab="codex" aria-selected="false">Codex</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="claude" markdown="1">

Add the server with the token as a header:

```bash
claude mcp add --transport http ansibleforms https://af.example.com/api/v2/mcp \
  --header "Authorization: Bearer <token>"
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="codex" markdown="1" hidden>

Add the server to `~/.codex/config.toml`, with the token read from an environment variable:

```toml
[mcp_servers.ansibleforms]
url = "https://af.example.com/api/v2/mcp"
bearer_token_env_var = "ANSIBLEFORMS_TOKEN"
```

Then set the variable before you start Codex:

```bash
export ANSIBLEFORMS_TOKEN=<token>
```

</div>
</div>
