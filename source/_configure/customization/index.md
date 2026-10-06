---
layout: default
title: Environment Variables
nav_order: 1
has_children: true
has_toc: false
---

# Environment Variables
{: .no_toc }

Configure AnsibleForms with environment variables
{: .fs-6 .fw-300 }

---

For administrators who deploy AnsibleForms: every environment variable the server reads, grouped by topic.

AnsibleForms is tuned with environment variables, whether it runs with Docker Compose, on Kubernetes or from source.

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
