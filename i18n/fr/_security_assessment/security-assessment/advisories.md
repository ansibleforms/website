---
layout: default
title: Avis de sécurité
nav_order: 5
translated_from: 6c1cec5253792365347a7303bf545cdb375681fb
---

# Avis de sécurité
{: .no_toc }

Chaque vulnérabilité publiée, sa gravité et son correctif
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Avis publiés

Lus depuis l'[onglet Security du dépôt](https://github.com/ansibleforms/ansibleforms/security/advisories) à chaque build de ce site :

{% assign af_advisories = site.data.advisories | sort: "published_at" | reverse %}
{% if af_advisories.size > 0 %}
<table>
  <thead>
    <tr>
      <th>Avis</th>
      <th>Gravité</th>
      <th>Faiblesse</th>
      <th>Concernées</th>
      <th>Corrigé dans</th>
      <th>Publié</th>
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
Aucun avis n'a été publié.
{% endif %}

Chaque avis sur GitHub donne les détails : l'impact, les conditions, le vecteur CVSS et le correctif.

---

## Ce que cela signifie pour votre version

Un avis nomme les versions qu'il concerne et la première version corrigée. Le correctif est livré dans les versions prises en charge,
[7.x et 6.5.x](development.html#supported-versions), et les versions plus anciennes ne sont pas corrigées : la mise à niveau est le correctif.

Comparez la version d'une instance (**A propos** dans le menu d'aide, ou `GET /api/v2/version`) avec **Concernées**.

---

## Être informé des nouveaux avis

GitHub prévient les observateurs du dépôt quand un avis est publié :

* Sur [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms), choisissez **Watch > Custom > Security alerts**.
* Le [journal des modifications](../changelog.html) liste chaque correctif de sécurité sous la version qui le livre.
