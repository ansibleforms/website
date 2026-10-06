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

Set [`ENABLE_MCP`](../customization) to `1` and restart. The endpoint is:

```
POST <your url>/api/v2/mcp
```

It uses stateless Streamable HTTP with plain JSON responses, so `GET` and `DELETE` return 405.

---

## Authentication

Every request needs an AnsibleForms access token:

```
Authorization: Bearer <token>
```

Obtain one in the usual way (`POST /api/v2/auth/login`, or the OIDC / Entra ID flows) and
refresh it with `POST /api/v2/token`. There is deliberately **no login tool**: a password passed as a
tool argument would end up in the language model's context and its chat history.

- **A chat backend** logs the user in itself, keeps the refresh token and passes the access
  token on every MCP call.
- **An IDE client** needs a token that lasts long enough to be configured once. With a role
  that has the `extendedTokenExpiration` option, create one under
  [Profile > API token](../profile/api-token.html), or log in with `?expiryDays=<n>` on the
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
