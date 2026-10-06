---
layout: default
title: Environment Variables
nav_order: 3
has_children: true
has_toc: false
---

# Environment Variables
{: .no_toc }

Configure AnsibleForms with environment variables
{: .fs-6 .fw-300 }

---

AnsibleForms is tuned with environment variables, whether it runs with Docker Compose, on Kubernetes or from source.

---

## In this section

The variables are grouped by topic, with one page per group:

{% for g in site.data.env_groups %}* **[{{ g.title }}]({{ g.slug }}.html)** : {{ g.lead }}
{% endfor %}
{% capture other %}{% include env_vars_table.html rest=true %}{% endcapture %}
{% if other contains "<tr>" %}
---

## Other variables

The following variables are not yet assigned to a group:

{{ other }}
{% endif %}
