---
layout: default
title: Environment Variables
nav_order: 1
has_children: true
has_toc: false
permalink: /customization/
---

# Environment Variables
{: .no_toc }

Configure AnsibleForms with environment variables
{: .fs-6 .fw-300 }

---

For administrators who deploy AnsibleForms: every environment variable the server reads, grouped by topic.

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

With [`ALLOW_ENV_EDIT`](configuration.html#env_ALLOW_ENV_EDIT)`=0` the pages only show the values and the save is refused. Use it
when the environment is declared in a manifest, as described in [Editing and audit](../seed/environment-and-audit.html).

The [config seed](../seed/) sets no environment variables. It declares objects that are stored in the database, and the
`${ENV_VAR}` references in it are resolved from the environment of the running server.

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
