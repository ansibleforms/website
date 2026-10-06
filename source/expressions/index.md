---
layout: default
title: Expressions
nav_order: 2.95
has_children: true
has_toc: false
---

# Expressions
{: .no_toc }

Compute field values with JavaScript, in the browser or on the server
{: .fs-6 .fw-300 }

---

The `expression` attribute of a form field lets you create dynamic forms with JavaScript expressions.

## Introduction

The `expression` attribute is available on multiple field types:
- `enum` field - to populate dropdown options dynamically
- `expression` field - to retrieve or generate any form of data

JavaScript expressions are evaluated either on the **server side** (default) or on the **client side**, as set by the field property `runLocal`.

- **On the server side** (`runLocal: false`, the default) - predefined functions that fetch data from APIs, files and databases.
- **On the client side** (`runLocal: true`) - Code leverages the full JavaScript engine in the browser sandbox for calculations, transformations, and manipulations.

## Security Concerns

Because expressions are evaluated with the JavaScript `eval` function, code injection is a potential concern:

- **Server-side expressions** are limited to predefined functions - arbitrary code cannot be injected
- **Client-side expressions** are evaluated in the browser sandbox and can be considered safe

---

## In this section

Each topic has a page of its own:

* **[Local expressions](local.html)** : JavaScript that runs in the browser sandbox
* **[Remote expressions](remote.html)** : server-side functions for dates, networks, files, SSH and numbered names
* **[REST APIs](rest-apis.html)** : call REST APIs with basic, token or custom authentication
* **[Credentials](credentials.html)** : read a stored credential
* **[Sorting](sorting.html)** : sort arrays with a sorting object
* **[jq queries](jq.html)** : reshape data with jq
