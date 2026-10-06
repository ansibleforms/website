---
layout: default
title: Providers
parent: Chat assistant
nav_order: 2
---

# Providers
{: .no_toc }

The language model behind the assistant, and proxies
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Select the provider on the settings page. This fills in the base URL, the authentication and
the API version, all of which remain editable. Empty fields fall back to the provider's defaults.

| Provider | Protocol | Base URL (default) | Key sent as |
|---|---|---|---|
| **Anthropic** | Anthropic | `https://api.anthropic.com` | `x-api-key` |
| **OpenAI** | OpenAI | `https://api.openai.com/v1` | `Authorization: Bearer` |
| **Azure OpenAI** | OpenAI | required: `https://<resource>.openai.azure.com/openai/deployments/<deployment>` | `api-key`, API version `2024-10-21` |
| **Google Gemini** | OpenAI | `https://generativelanguage.googleapis.com/v1beta/openai` | Bearer |
| **xAI Grok** | OpenAI | `https://api.x.ai/v1` | Bearer |
| **Mistral** | OpenAI | `https://api.mistral.ai/v1` | Bearer |
| **DeepSeek** | OpenAI | `https://api.deepseek.com/v1` | Bearer |
| **Groq** | OpenAI | `https://api.groq.com/openai/v1` | Bearer |
| **OpenRouter** | OpenAI | `https://openrouter.ai/api/v1` | Bearer |
| **Ollama** | OpenAI | `http://localhost:11434/v1` | none |
| **Other OpenAI-compatible** (LiteLLM, a gateway, vLLM, LM Studio, ...) | OpenAI | required, usually ending in `/v1` | Bearer |

The model ID is the one the provider or proxy uses (`claude-opus-5-5`, `gpt-5`, `llama3.3`,
...). The assistant requires a model that supports **tool calling**; support varies among
small local models.

For local servers and proxies that need no key, a base URL alone is enough; no authorization header is sent.

## For a proxy

A proxy or gateway in front of the model may need these settings:

- **Authentication** - how the key is sent: `Authorization: Bearer`, `api-key`, `x-api-key`,
  or none. Empty uses the provider's default.
- **API version** - the `anthropic-version` header, or `?api-version=` in the URL for OpenAI-compatible (Azure).
- **User** - sent with every call as `user` (OpenAI-compatible) or `metadata.user_id`
  (Anthropic). Some proxies require it. Empty sends nothing.
- **Ignore certificate errors** - insecure; trust the proxy's CA with `NODE_EXTRA_CA_CERTS` instead.
- **Extra headers** - a JSON object, e.g. `{"X-Org": "ops"}`. One-line text values, at most 20;
  the key and content headers cannot be replaced.

## In a container, behind a proxy

The chat uses plain outbound HTTPS from the AnsibleForms server container. Behind a
corporate egress proxy, set `HTTPS_PROXY` **and** `NODE_USE_ENV_PROXY=1`; without the second,
Node's built-in HTTP client ignores `HTTPS_PROXY`. A provider with a certificate from an
internal CA requires Node to trust that CA (`NODE_EXTRA_CA_CERTS=/path/to/ca.pem`).
With `NODE_USE_ENV_PROXY=1`, a model or proxy inside the network must be listed in
`NO_PROXY`, or the call goes to the egress proxy, which cannot reach it.

A failed connection test names the host and the reason (DNS, refused connection or untrusted certificate).
