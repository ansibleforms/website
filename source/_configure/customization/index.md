---
layout: default
title: Environment Variables
nav_order: 8
has_children: true
has_toc: false
permalink: /customization/
---

# Environment Variables
{: .no_toc }

Configure AnsibleForms with environment variables
{: .fs-6 .fw-300 }

---

For administrators who deploy AnsibleForms: the environment variables the server reads, grouped by topic.

AnsibleForms is tuned with environment variables, whether it runs with Docker Compose, on Kubernetes or from source.

---

## Where the values come from

The server reads each variable from the first of these sources that sets it, so a value higher in the list always wins:

1. **The process environment**: `environment:` and `env_file:` in docker-compose (the project's `.env` is passed this way),
   `env` and `envFrom` on Kubernetes, or the shell that starts `node`.
2. **`persistent/.env`**, the file the settings pages write (`data/.env` in the docker-compose project, another path with
   `MANAGED_ENV_PATH`). It is read at every start, in production too, and never overrides a variable that is already set.
3. **`server/.env.<NODE_ENV>`**, for example `.env.development`. Only read when `NODE_ENV` is not `production` (or with
   `FORCE_DOTENV=1`), in practice when running [from source](../installation/from-source.html) in development mode.
4. **The built-in default**, shown in the tables of each group.

The settings pages, under **Settings > General**, show the value in force and save changes to `persistent/.env`. Many variables
apply as soon as they are saved; the others are saved but need a restart, and the page lists them after the save. A variable set in
the process environment cannot be changed there: the page shows it as *Set in the environment, so it cannot be changed here.*
A few variables, such as `ENCRYPTION_SECRET` and `ACCESS_TOKEN_SECRET`, can never be changed from the page.

The variables an RTE reads, such as `AF_ROLE`, `RTE_MODE`, `APP_URL` or `RTE_MAX_JOBS`, are not on the settings pages at all: the
app does not use them, so set them in the environment where the RTE runs. The `RTE_*` variables the app itself reads,
`RTE_QUEUE_MINUTES` and `RTE_FILES_MAX_MB`, are the exception and stay on the pages. Four RTE variables, `RTE_MAX_JOBS`,
`RTE_CACHE_MB`, `RTE_FILES` and `RTE_DRAIN_SECONDS`, can be set per RTE on its runner page instead, where a value wins over the
variable (see [An RTE's settings](../runners/runner-page.html#an-rtes-settings)).

With [`ALLOW_ENV_EDIT`](configuration.html#env_ALLOW_ENV_EDIT)`=0` the pages only show the values and the save is refused. Use it
when the environment is declared in a manifest, as described in [Editing and audit](../seed/environment-and-audit.html).

The [config seed](../seed/) sets no environment variables. It declares objects that are stored in the database, and the
`${ENV_VAR}` references in it are resolved from the environment of the running server.

A few variables are read from the environment only and are not in the tables: `MANAGED_ENV_PATH` and `FORCE_DOTENV`, described
above, and the system proxy variables `HTTPS_PROXY` and `NO_PROXY` (lower case read too). An outbound RTE dials the app through
`HTTPS_PROXY`, and an inbound RTE sends its registration call through it, unless the app's host is in `NO_PROXY` (host names,
`.domain` suffixes, or `*` for every host).

Variables marked <span class="af-badge af-badge-secret">Secret</span> hold a password, token or key: keep them out of version
control, for example in a Kubernetes Secret or a `.env` file that is not committed.

---

## In this section

The variables are grouped by topic, with one page per group:

| Page | What it covers |
|---|---|
{% for g in site.data.env_groups %}| [{{ g.title }}]({{ g.slug }}.html) | {{ g.lead | slice: 0 | upcase }}{{ g.lead | slice: 1, 500 }} |
{% endfor %}
{% capture other %}{% include env_vars_table.html rest=true %}{% endcapture %}
{% if other contains "<tr>" %}
---

## Other variables

The following variables are not yet assigned to a group:

{{ other }}
{% endif %}
