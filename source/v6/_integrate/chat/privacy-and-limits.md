---
layout: default
title: Privacy and limits
parent: Chat assistant
nav_order: 3
---

# Privacy and limits
{: .no_toc }

What leaves the network, and the limits per user
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## What leaves the network

For the forms that take part, the following is sent to the provider:

- the form names and descriptions, the field labels, help texts, choices and the values being
  filled in;
- the conversation.

The following is never sent to the provider, the page or the log:

- passwords (the user enters those in the browser), stored credentials and the API key;
- a job's output, and its stored extravars (the assistant reads a job's status only, and only
  when **Job status** is on in the settings).

Anything under a key that looks like a secret (`password`, `secret`, `token`, `api_key`, ...)
is masked before the model or the page sees it.

To keep form data in-house, use your own tenant (Azure OpenAI) or a local model (Ollama), not a public API.

---

## Limits

The following limits are set on the settings page:

- **Messages per conversation** (20) - after which the user must start a new conversation.
- **Tool rounds per message** (6) - how many times the model may call a tool before it answers.
- **Timeout** (60 s) - per call to the provider.

The following limits are fixed: one message at a time per conversation, 60 messages per user
per hour, and 5 conversations per user. A conversation is discarded after 2 hours without a
message. Conversations and summaries are kept in memory, so after a restart the user must
start a new conversation.
