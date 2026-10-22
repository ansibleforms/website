---
layout: default
title: Biuletyny bezpieczeństwa
nav_order: 5
translated_from: 6c1cec5253792365347a7303bf545cdb375681fb
---

# Biuletyny bezpieczeństwa
{: .no_toc }

Każda opublikowana podatność, jej istotność i poprawka
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Opublikowane biuletyny

Pobierane z [karty Security repozytorium](https://github.com/ansibleforms/ansibleforms/security/advisories) przy każdym budowaniu tej strony:

{% assign af_advisories = site.data.advisories | sort: "published_at" | reverse %}
{% if af_advisories.size > 0 %}
<table>
  <thead>
    <tr>
      <th>Biuletyn</th>
      <th>Istotność</th>
      <th>Słabość</th>
      <th>Podatne wersje</th>
      <th>Poprawione w</th>
      <th>Opublikowano</th>
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
Nie opublikowano żadnego biuletynu.
{% endif %}

Każdy biuletyn na GitHubie podaje szczegóły: wpływ, warunki, wektor CVSS i poprawkę.

---

## Co to oznacza dla twojej wersji

Biuletyn wymienia wersje, których dotyczy, i pierwszą wersję z poprawką. Poprawka trafia do wspieranych wydań,
[7.x i 6.5.x](development.html#supported-versions), a starsze wydania nie są łatane: poprawką jest aktualizacja.

Porównaj wersję instancji (**O programie** w menu pomocy lub `GET /api/v2/version`) z kolumną **Podatne wersje**.

---

## Powiadomienia o nowych biuletynach

GitHub powiadamia obserwujących repozytorium, gdy biuletyn zostaje opublikowany:

* Na [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms) wybierz **Watch > Custom > Security alerts**.
* [Dziennik zmian](../changelog.html) wymienia każdą poprawkę bezpieczeństwa pod wydaniem, które ją zawiera.
