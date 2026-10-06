---
layout: default
title: Chat assistant
nav_order: 3
has_children: true
has_toc: false
permalink: /chat/
---

# Chat assistant
{: .no_toc }

Fill in and launch forms through a conversation
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators who switch it on, and the users who chat with it: fill in and launch forms through a conversation.

A chat button on every page opens an
assistant that finds the right form, asks for missing information, offers the form's own
choices as buttons, and shows a summary with a **Launch** button. A job starts only when the user clicks it.

---

## How it works

The assistant communicates with the AI model through the server, which answers the model's requests using the same form engine as the browser:

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

- **Model calls come from the server**, never the browser, so the API key stays on the server
  (see [Providers](providers.html)).
- **The model cannot launch anything.** It prepares a one-time summary; Launch re-checks it before running.
- **The user chooses the targets.** Choices and required names come from the user, never from the model.
- **Typing "yes" or "launch" does nothing.** Only the button launches a job.

---

## In this section

Each topic has a page of its own:

| Page | What it covers |
|---|---|
| [Switching it on](switching-it-on.html) | Enable the assistant and offer forms in it |
| [Providers](providers.html) | The language model behind the assistant, and proxies |
| [Privacy and limits](privacy-and-limits.html) | What leaves the network, and the limits per user |
| [Relaunching and audit](relaunching-and-audit.html) | Relaunching from the chat, the audit trail and the limitations |
