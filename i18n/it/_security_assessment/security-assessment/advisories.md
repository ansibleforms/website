---
layout: default
title: Advisory di sicurezza
nav_order: 5
translated_from: 6c1cec5253792365347a7303bf545cdb375681fb
---

# Advisory di sicurezza
{: .no_toc }

Ogni vulnerabilità pubblicata, la sua gravità e la sua correzione
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Advisory pubblicati

Letti dalla [scheda Security del repository](https://github.com/ansibleforms/ansibleforms/security/advisories) a ogni build di questo sito:

{% assign af_advisories = site.data.advisories | sort: "published_at" | reverse %}
{% if af_advisories.size > 0 %}
<table>
  <thead>
    <tr>
      <th>Advisory</th>
      <th>Gravità</th>
      <th>Debolezza</th>
      <th>Interessate</th>
      <th>Corretta in</th>
      <th>Pubblicato</th>
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
Non è stato pubblicato alcun advisory.
{% endif %}

Ogni advisory su GitHub fornisce i dettagli: l'impatto, le condizioni, il vettore CVSS e la correzione.

---

## Cosa significa per la tua versione

Un advisory indica le versioni interessate e la prima versione corretta. La correzione viene distribuita nelle release supportate,
[7.x e 6.5.x](development.html#supported-versions), e le release più vecchie non ricevono patch: la correzione è aggiornare.

Confronta la versione di un'istanza (**Informazioni** nel menu di aiuto, oppure `GET /api/v2/version`) con **Interessate**.

---

## Essere avvisati dei nuovi advisory

GitHub avvisa chi segue il repository quando viene pubblicato un advisory:

* Su [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms), scegli **Watch > Custom > Security alerts**.
* Il [changelog](../changelog.html) elenca ogni correzione di sicurezza sotto la release che la contiene.
