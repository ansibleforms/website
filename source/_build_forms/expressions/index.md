---
layout: default
title: Expressions
nav_order: 1
has_children: true
has_toc: false
permalink: /expressions/
---

# Expressions
{: .no_toc }

Compute field values with JavaScript, in the browser or on the server
{: .fs-6 .fw-300 }

---

For form authors: fill fields dynamically with JavaScript, computed in the browser or fetched on the server.

The `expression` attribute of a form field lets you create dynamic forms with JavaScript expressions.

---

## Introduction

The `expression` attribute is available on multiple field types:
- `enum` field - to populate dropdown options dynamically
- `expression` field - to retrieve or generate any form of data
- `html` field - to build its HTML content
- `yaml` and `list` fields - to fill their data

JavaScript expressions are evaluated either on the **server side** (default) or on the **client side**, as set by the field property `runLocal`.
An `html` field, and the `local`, `local_out` and `credential` field types, always run their expression in the browser, whatever
`runLocal` says.

- **On the server side** (`runLocal: false`, the default) - predefined functions that fetch data from APIs, files and databases.
- **On the client side** (`runLocal: true`) - Code leverages the full JavaScript engine in the browser sandbox for calculations, transformations, and manipulations.

---

## Security Concerns

Because expressions are evaluated with the JavaScript `eval` function, code injection is a potential concern:

- **Server-side expressions** pass a sanitizer first: every call must be a `fn.` or `fnc.` function, and multiple lines,
  `;`, template literals, `process.env` and the ways out of `eval` (`import`, `require`, `constructor`, ...) are refused.
- **Client-side expressions** are evaluated in the browser sandbox and can be considered safe.

How strict the sanitizer is depends on
[`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER):

| Value | Server-side expressions |
|---|---|
| `strict` (default) | `fn.` and `fnc.` calls, and methods on their result, such as `fn.fnTime().format('YYYY')` |
| `paranoid` | only direct `fn.` and `fnc.` calls, no methods on their result |
| `off` | every server-side expression is refused; only `runLocal` expressions work |
| `legacy` | the rules of 6.2.1, which let any authenticated user run code on the server; only for an upgrade, and only in the real environment (not from the settings page) |

An empty or unknown value means `strict`. A change applies to the next expression, without a restart.

---

## In this section

Each topic has a page of its own:

| Page | What it covers |
|---|---|
| [Placeholders](placeholders.html) | Reference another field, a constant or the user with `$(...)` |
| [Local expressions](local.html) | JavaScript that runs in the browser sandbox |
| [Remote expressions](remote.html) | Server-side functions for dates, networks, files, SSH and numbered names |
| [REST APIs](rest-apis.html) | Call REST APIs with basic, token or custom authentication |
| [Credentials](credentials.html) | Read a stored credential |
| [Sorting](sorting.html) | Sort arrays with a sorting object |
| [jq queries](jq.html) | Reshape data with jq |
