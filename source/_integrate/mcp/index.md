---
layout: default
title: MCP server
nav_order: 2
has_children: true
has_toc: false
---

# MCP server
{: .no_toc }

Let AI agents use your forms through the Model Context Protocol
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

For administrators and integrators: let MCP clients list, fill in and launch forms as the user whose token they hold.

AnsibleForms can serve a
[Model Context Protocol](https://modelcontextprotocol.io) server, so that an MCP client, such as
a chat backend or an IDE assistant, can list the forms a user may use, determine their fields,
launch jobs and follow their progress.

## What it is, and what it is not

The MCP server is a technical interface to the same form flow the browser uses. It runs
**as the user whose token it receives**: the same form roles, the same job visibility, the
same checks on reserved extravars as a browser submission.

It adds no AI policy of its own. Whether an agent must ask for confirmation before a launch,
which forms it may use, or how many requests it may make is up to the MCP client. The
launch tool is marked as destructive, so a well-behaved client asks for confirmation first,
but the server does not enforce this.

---

## In this section

Each topic has a page of its own:

| Page | What it covers |
|---|---|
| [Setup](setup.html) | Switch the server on and authenticate the client |
| [Tools](tools.html) | The tools an agent uses to fill in, approve and relaunch forms |
| [Limitations](limitations.html) | Expressions run on the server, and what the MCP server does not do |
