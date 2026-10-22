---
layout: default
title: Beveiligingsadvisories
nav_order: 5
translated_from: 6c1cec5253792365347a7303bf545cdb375681fb
---

# Beveiligingsadvisories
{: .no_toc }

Elke gepubliceerde kwetsbaarheid, de ernst ervan en de oplossing
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Gepubliceerde advisories

Bij elke build van deze site gelezen uit het [tabblad Security van de repository](https://github.com/ansibleforms/ansibleforms/security/advisories):

{% assign af_advisories = site.data.advisories | sort: "published_at" | reverse %}
{% if af_advisories.size > 0 %}
<table>
  <thead>
    <tr>
      <th>Advisory</th>
      <th>Ernst</th>
      <th>Zwakte</th>
      <th>Getroffen</th>
      <th>Opgelost in</th>
      <th>Gepubliceerd</th>
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
Er is nog geen advisory gepubliceerd.
{% endif %}

Elke advisory op GitHub geeft de details: de impact, de voorwaarden, de CVSS-vector en de oplossing.

---

## Wat dit betekent voor je versie

Een advisory noemt de versies die getroffen zijn en de eerste versie waarin het is opgelost. De oplossing komt in de ondersteunde releases,
[7.x en 6.5.x](development.html#supported-versions), en oudere releases krijgen geen patch: upgraden is de oplossing.

Vergelijk de versie van een instantie (**Over** in het helpmenu, of `GET /api/v2/version`) met **Getroffen**.

---

## Op de hoogte blijven van nieuwe advisories

GitHub waarschuwt wie de repository volgt wanneer er een advisory wordt gepubliceerd:

* Kies op [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms) **Watch > Custom > Security alerts**.
* De [changelog](../changelog.html) noemt elke beveiligingsoplossing onder de release waarin die zit.
