---
layout: default
title: Avisos de seguretat
nav_order: 5
translated_from: 6c1cec5253792365347a7303bf545cdb375681fb
---

# Avisos de seguretat
{: .no_toc }

Totes les vulnerabilitats publicades, la seva gravetat i la seva correcció
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Avisos publicats

Llegits de la [pestanya Security del repositori](https://github.com/ansibleforms/ansibleforms/security/advisories) a cada compilació d'aquest lloc:

{% assign af_advisories = site.data.advisories | sort: "published_at" | reverse %}
{% if af_advisories.size > 0 %}
<table>
  <thead>
    <tr>
      <th>Avís</th>
      <th>Gravetat</th>
      <th>Debilitat</th>
      <th>Afectades</th>
      <th>Corregit a</th>
      <th>Publicat</th>
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
No s'ha publicat cap avís.
{% endif %}

Cada avís a GitHub en dona els detalls: l'impacte, les condicions, el vector CVSS i la correcció.

---

## Què vol dir això per a la teva versió

Un avís indica les versions que afecta i la primera versió corregida. La correcció arriba a les versions amb suport,
[7.x i 6.5.x](development.html#supported-versions), i les versions més antigues no es corregeixen: la solució és actualitzar.

Compara la versió d'una instància (**Quant a** al menú d'ajuda, o `GET /api/v2/version`) amb **Afectades**.

---

## Rebre avís dels nous avisos

GitHub avisa els seguidors del repositori quan es publica un avís:

* A [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms), tria **Watch > Custom > Security alerts**.
* El [registre de canvis](../changelog.html) recull cada correcció de seguretat a la versió que la porta.
