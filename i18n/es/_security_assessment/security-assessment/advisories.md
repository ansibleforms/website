---
layout: default
title: Avisos de seguridad
nav_order: 5
translated_from: 6c1cec5253792365347a7303bf545cdb375681fb
---

# Avisos de seguridad
{: .no_toc }

Cada vulnerabilidad publicada, su gravedad y su corrección
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Avisos publicados

Leídos de la [pestaña Security del repositorio](https://github.com/ansibleforms/ansibleforms/security/advisories) en cada build de este sitio:

{% assign af_advisories = site.data.advisories | sort: "published_at" | reverse %}
{% if af_advisories.size > 0 %}
<table>
  <thead>
    <tr>
      <th>Aviso</th>
      <th>Gravedad</th>
      <th>Debilidad</th>
      <th>Afectadas</th>
      <th>Corregido en</th>
      <th>Publicado</th>
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
No se ha publicado ningún aviso.
{% endif %}

Cada aviso en GitHub da los detalles: el impacto, las condiciones, el vector CVSS y la corrección.

---

## Qué significa para tu versión

Un aviso indica las versiones afectadas y la primera versión corregida. La corrección llega a las versiones con soporte,
[7.x y 6.5.x](development.html#supported-versions), y las versiones anteriores no se parchean: la corrección es actualizar.

Compara la versión de una instancia (**Acerca de** en el menú de ayuda, o `GET /api/v2/version`) con **Afectadas**.

---

## Enterarte de los avisos nuevos

GitHub notifica a quienes siguen el repositorio cuando se publica un aviso:

* En [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms), elige **Watch > Custom > Security alerts**.
* El [registro de cambios](../changelog.html) lista cada corrección de seguridad bajo la versión que la incluye.
