---
layout: default
title: Security advisories
nav_order: 5
---

# Security advisories
{: .no_toc }

Every published vulnerability, its severity and its fix
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Published advisories

Read from the [Security tab of the repository](https://github.com/ansibleforms/ansibleforms/security/advisories) at every build of this site:

{% assign af_advisories = site.data.advisories | sort: "published_at" | reverse %}
{% if af_advisories.size > 0 %}
<table>
  <thead>
    <tr>
      <th>Advisory</th>
      <th>Severity</th>
      <th>Weakness</th>
      <th>Affected</th>
      <th>Fixed in</th>
      <th>Published</th>
    </tr>
  </thead>
  <tbody>
    {% for a in af_advisories %}
    <tr>
      <td>
        <strong>{{ a.summary | escape }}</strong><br>
        <a href="{{ a.html_url }}">{{ a.ghsa_id }}</a>{% if a.cve_id %}<br>{{ a.cve_id }}{% endif %}
      </td>
      <td>
        {{ a.severity | capitalize }}
        {%- assign af_cvss = a.cvss_severities.cvss_v3 | default: a.cvss -%}
        {%- if af_cvss.score %}<br>CVSS {{ af_cvss.score }}{% endif %}
      </td>
      <td>
        {%- for w in a.cwes %}<span title="{{ w.name | escape }}">{{ w.cwe_id }}</span>{% unless forloop.last %}<br>{% endunless %}{% endfor -%}
      </td>
      <td>{% for v in a.vulnerabilities %}<code>{{ v.vulnerable_version_range }}</code>{% unless forloop.last %}<br>{% endunless %}{% endfor %}</td>
      <td>{% for v in a.vulnerabilities %}{{ v.patched_versions | default: "-" }}{% unless forloop.last %}<br>{% endunless %}{% endfor %}</td>
      <td>{{ a.published_at | date: "%Y-%m-%d" }}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>
{% else %}
No advisory has been published.
{% endif %}

Each advisory on GitHub gives the details: the impact, the conditions, the CVSS vector and the fix.

---

## What this means for your version

An advisory names the versions it affects and the first version that is fixed. The fix ships in the supported releases,
[7.x and 6.5.x](development.html#supported-versions), and older releases are not patched: upgrading is the fix.

Compare the version of an instance (**About** in the help menu, or `GET /api/v2/version`) with **Affected**.

---

## Being told of new advisories

GitHub notifies the watchers of the repository when an advisory is published:

* On [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms), choose **Watch > Custom > Security alerts**.
* The [changelog](../changelog.html) lists every security fix under the release that ships it.
