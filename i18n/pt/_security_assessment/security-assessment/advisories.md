---
layout: default
title: Avisos de segurança
nav_order: 5
translated_from: 6c1cec5253792365347a7303bf545cdb375681fb
---

# Avisos de segurança
{: .no_toc }

Todas as vulnerabilidades publicadas, a sua gravidade e a sua correção
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Avisos publicados

Lidos do [separador Security do repositório](https://github.com/ansibleforms/ansibleforms/security/advisories) em cada build deste site:

{% assign af_advisories = site.data.advisories | sort: "published_at" | reverse %}
{% if af_advisories.size > 0 %}
<table>
  <thead>
    <tr>
      <th>Aviso</th>
      <th>Gravidade</th>
      <th>Fragilidade</th>
      <th>Afetadas</th>
      <th>Corrigido em</th>
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
Ainda não foi publicado nenhum aviso.
{% endif %}

Cada aviso no GitHub dá os detalhes: o impacto, as condições, o vetor CVSS e a correção.

---

## O que isto significa para a sua versão

Um aviso indica as versões que afeta e a primeira versão corrigida. A correção chega às versões suportadas,
[7.x e 6.5.x](development.html#supported-versions), e as versões mais antigas não são corrigidas: a correção é atualizar.

Compare a versão de uma instância (**Acerca de** no menu de ajuda, ou `GET /api/v2/version`) com **Afetadas**.

---

## Ser avisado dos novos avisos

O GitHub notifica quem segue o repositório quando um aviso é publicado:

* Em [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms), escolha **Watch > Custom > Security alerts**.
* O [registo de alterações](../changelog.html) enumera cada correção de segurança na versão que a inclui.
