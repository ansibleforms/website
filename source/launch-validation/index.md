---
layout: default
title: Launch validation
nav_order: 2.97
has_children: true
has_toc: false
---

# Launch validation
{: .no_toc }

Check every launch of a form on the server
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Check every launch of a form on the server, both its validation rules and the extravars the
job runs with, regardless of who or what launches it: the browser, a script calling the REST
API, or an AI agent through the MCP server.

## Why it exists

A form's rules (`required`, `regex`, `minValue`, `sameAs`, ...) have always been checked
in the browser. The browser then sends two things to `POST /api/v2/job`:

- `rawFormData`: the field values as the user filled them in;
- `extravars`: what the playbook receives, built from those values in the browser.

Without launch validation, the server trusts both. Anyone with a valid token can call that
endpoint directly and send any extravars, with no regex, required field or list rule
applied. For a form that is only ever used in the browser, that may be acceptable; for a
form that other systems launch over REST, it means the form's rules are not enforced at all.

The server also has no way to distinguish a request from the browser from one sent by a
script: both use the same endpoint, the same token and the same body, and users can modify
any request their own browser sends. A check can only be trusted on the server, and launch
validation is that check.

## The three ways in

How a launch is validated depends on how it arrives and on the launch validation mode:

| Launched by | Validated | Extravars the job runs with |
|---|---|---|
| **MCP server** (AI agent) | always, on the server | always built by the server |
| **Browser** or **REST API**, launch validation `off` | only in the browser | the ones the browser (or caller) sent |
| **Browser** or **REST API**, launch validation `log` | on the server, refusals only logged | the ones sent; differences logged |
| **Browser** or **REST API**, launch validation `enforce` | on the server, refused when invalid | **built by the server** |

The browser, the MCP server and launch validation use the same code for the rules (the
shared form engine): the same rules, in the same order, with the same messages. An error the
browser shows is refused by the server with the same text.

---

## In this section

Each topic has a page of its own:

* **[Switching it on](switching-it-on.html)** : for the whole instance, or for one form
* **[Log and enforce](log-and-enforce.html)** : what each mode does with a launch that breaks the rules
* **[List rows](list-rows-and-subforms.html)** : how rows of list fields are validated
* **[File uploads](file-uploads.html)** : how file fields are validated
* **[Passwords](passwords.html)** : how password fields are validated and kept out of APIs
* **[Relaunching](relaunching.html)** : how a relaunched job is validated
* **[Rolling it out](rolling-it-out.html)** : move an instance to enforce, and the known limitations
