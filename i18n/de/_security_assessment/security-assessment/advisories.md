---
layout: default
title: Security Advisories
nav_order: 5
translated_from: 6c1cec5253792365347a7303bf545cdb375681fb
---

# Security Advisories
{: .no_toc }

Jede veröffentlichte Schwachstelle, ihr Schweregrad und ihre Behebung
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Veröffentlichte Advisories

Bei jedem Build dieser Website aus dem [Security-Tab des Repositorys](https://github.com/ansibleforms/ansibleforms/security/advisories) gelesen:

{% assign af_advisories = site.data.advisories | sort: "published_at" | reverse %}
{% if af_advisories.size > 0 %}
<table>
  <thead>
    <tr>
      <th>Advisory</th>
      <th>Schweregrad</th>
      <th>Schwäche</th>
      <th>Betroffen</th>
      <th>Behoben in</th>
      <th>Veröffentlicht</th>
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
Es wurde kein Advisory veröffentlicht.
{% endif %}

Jedes Advisory auf GitHub nennt die Details: die Auswirkung, die Bedingungen, den CVSS-Vektor und die Behebung.

---

## Was das für Ihre Version bedeutet

Ein Advisory nennt die betroffenen Versionen und die erste behobene Version. Die Behebung erscheint in den unterstützten Releases,
[7.x und 6.5.x](development.html#supported-versions), ältere Releases werden nicht gepatcht: Die Lösung ist ein Upgrade.

Vergleichen Sie die Version einer Instanz (**Info** im Hilfemenü oder `GET /api/v2/version`) mit **Betroffen**.

---

## Über neue Advisories informiert werden

GitHub benachrichtigt die Beobachter des Repositorys, wenn ein Advisory veröffentlicht wird:

* Auf [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms), wählen Sie **Watch > Custom > Security alerts**.
* Das [Changelog](../changelog.html) listet jede Sicherheitskorrektur unter dem Release auf, das sie enthält.
