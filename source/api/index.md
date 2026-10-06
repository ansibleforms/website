---
layout: default
title: REST API
nav_order: 5.9
has_children: true
has_toc: false
---

# REST API
{: .no_toc }

Launch forms and manage AnsibleForms from scripts
{: .fs-6 .fw-300 }

---

Everything the web interface does goes through the REST API, so scripts and other tools can do the same.

## Overview

The API is served under `/api/v2` on the AnsibleForms server:

* **Interactive documentation** : every endpoint is described, and can be tried, at `/api/v2/docs` (Swagger).
* **Permissions** : a call runs as the user whose token it carries, with that user's roles, as in the browser.
* **Launch validation** : jobs launched through the API can be checked like browser launches
  (see [Launch validation](../launch-validation/)).

## In this section

Each topic has a page of its own:

* **[Authentication](authentication.html)** : log in, refresh the token, or use a long-lived token
* **[Jobs](jobs.html)** : launch a form, follow the job, abort, relaunch or approve it
* **[Responses and errors](responses.html)** : the shape of a response, and the status codes
