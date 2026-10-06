---
layout: default
title: Relaunching and audit
parent: Chat assistant
nav_order: 4
---

# Relaunching and audit
{: .no_toc }

Relaunching from the chat, the audit trail and the limitations
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Relaunching

A request such as "Run job 1234 again" (the user must type the job ID) previews a relaunch
under the same rules as the MCP server's `relaunch_job`, including the password rule of
[launch validation](../launch-validation), and shows a **Relaunch** summary; the button
launches it once. "Run job 1234 again with server web02" changes only that field.

## Audit

Every launch from the chat is recorded as **chat.launch** with the user, the job, the form,
the provider, and the payload hash of the summary that was approved. Changes to the chat settings are
recorded like any other settings change.

## Limitations

The chat assistant does not do everything a browser does yet:

- **Wizard forms** cannot take part (`enableForChat` is refused on them), and neither can
  the fields the assistant does not fill in: passwords, file uploads and `table` fields.
- Replies arrive in one piece; streaming is not supported yet.
- The model can misunderstand a request. The summary card shows exactly what will be sent;
  review it before you click **Launch**.
