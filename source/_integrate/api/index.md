---
layout: default
title: REST API
nav_order: 1
has_children: true
has_toc: false
permalink: /api/
---

# REST API
{: .no_toc }

Launch forms and manage AnsibleForms from scripts
{: .fs-6 .fw-300 }

---

For developers and automation engineers: launch forms and manage AnsibleForms from scripts.

Everything the web interface does goes through the REST API, so scripts and other tools can do the same.

---

## Overview

The API is served under `/api/v2` on the AnsibleForms server:

* **Full reference** : these pages cover what scripts use most. Every endpoint is described, and can be tried, on the
  server's built-in Swagger page, `https://<your server>/api/v2/docs`.
* **Permissions** : a call runs as the user whose token it carries, with that user's roles, as in the browser.
* **Launch validation** : jobs launched through the API can be checked like browser launches
  (see [Launch validation](../launch-validation/)).
* **Rate limits** : only the login, logout, token refresh and single sign-on endpoints are limited (see
  [Authentication](authentication.html)). Other calls have no rate limit (the [chat assistant](../chat/) has limits of
  its own), so a script should pace itself, for example when it follows a job.

---

## In this section

Each topic has a page of its own:

| Page | What it covers |
|---|---|
| [Authentication](authentication.html) | Log in, refresh the token, or use a long-lived token |
| [Jobs](jobs.html) | Launch a form, follow the job, abort, relaunch or approve it |
| [Responses and errors](responses.html) | The shape of a response, and the status codes |
| [Live events](events.html) | Hear when jobs and settings change, instead of polling |
