---
layout: default
title: Passwords
parent: Launch validation
nav_order: 5
---

# Passwords
{: .no_toc }

How password fields are validated, stored and kept out of APIs
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

A password field is validated like any other field. Its value, however, is kept on the server and never handed back to
a client.

---

## Where a password is kept

The server stores the password with the job, in its extravars:

* An **approval** can then continue the job with the password the user entered.
* A **relaunch as it ran** can replay it, when launch validation is not `enforce`.

The stored password is only used on the server.

---

## What the APIs return

No API ever returns a password:

* A job read through the REST API or the MCP server's `get_job` masks every `password` field of its form, also inside
  list rows and YAML subforms.
* `MASK_EXTRAVARS_REGEX` (default `password|secret|token`) also masks every extravar whose name matches, for
  secrets that are not password fields.

---

## What a relaunch receives

To prefill a relaunch, the browser receives the job's raw form data. That data never holds a password, not even inside
list rows or YAML subforms, so the user enters the password again.

A password field that the form's dependencies hide is not needed, and does not have to be entered again.
