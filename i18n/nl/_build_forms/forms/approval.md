---
layout: default
title: Goedkeuringspunten
parent: Formulieren
nav_order: 8
translated_from: c2784dd4ac7ac41ef7f18fafdc4a6c468575c405
---

# Goedkeuringspunten
{: .no_toc }

Zet een job stil tot iemand hem goedkeurt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Hoe het werkt

Een goedkeuringspunt zet de job stil op zijn plek in het formulier, tot een goedkeurder antwoordt:

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign approval_object = form_object.help | where: "name", "Approval point" | first %}

{{ approval_object.description | markdownify }}

---

## Je eigen job goedkeuren

Vanaf 7.3.0 kan de gebruiker die een job startte hem niet goedkeuren, ook niet met een van de rollen van de goedkeuring, dus er is een tweede persoon voor nodig; een admin kan altijd goedkeuren, ook zijn eigen jobs.
Degene die de job startte, kan zijn eigen job nog wel afwijzen (intrekken). Stel `allowSelf: true` in wanneer hij hem ook mag goedkeuren, bijvoorbeeld in een testformulier:

```yaml
approval:
  title: Approve the change
  message: Please approve this change
  roles:
    - approvers
  allowSelf: true
```

---

## Attributen

De attributen van een goedkeuringspunt:

<table>
  <thead>
    <tr>
      <th>Attribuut</th>
      <th>Opmerkingen</th>
    </tr>
  </thead>
  <tbody>
    {% for var in approval_object.items %}
    <tr>
      <td>
        <span id="approval_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / verplicht</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / uniek</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">toegevoegd in versie {{var.version}}</span>{% endif %}
      </td>
      <td>
        <p>
          <strong>{{var.short}}</strong><br>
          {% if var.allowed != nil %}
          <span class="af-type">{{ var.allowed }}</span>
          {% endif %}
        </p>
        <p>
          {{ var.description | markdownify }}
        </p>
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>

---

## Voorbeelden

Voorbeelden van goedkeuringspunten, in YAML:

{% for example in approval_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}De definitie, in YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}
