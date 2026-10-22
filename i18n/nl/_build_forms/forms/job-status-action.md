---
layout: default
title: Acties bij jobstatus
parent: Formulieren
nav_order: 10
translated_from: c374578652c98b4c2c68f068809f16c22e304147
---

# Acties bij jobstatus
{: .no_toc }

Iets doen op het formulier wanneer zijn job wordt verzonden, slaagt, mislukt of eindigt
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign jobstatus_object = form_object.help | where: "name", "Job Status Action" | first %}

{{ jobstatus_object.description | markdownify }}

De volgende hooks zijn beschikbaar:

- `onSubmit` - gaat af wanneer het formulier wordt verzonden
- `onSuccess` - gaat af wanneer de job met succes is voltooid
- `onFailure` - gaat af wanneer de job mislukt
- `onFinish` - gaat af wanneer de job eindigt, ongeacht zijn status
- `onAbort` - gaat af wanneer de job wordt afgebroken

---

## Attributen

De attributen van een actie bij jobstatus:

<table>
  <thead>
    <tr>
      <th>Attribuut</th>
      <th>Opmerkingen</th>
    </tr>
  </thead>
  <tbody>
    {% for var in jobstatus_object.items %}
    <tr>
      <td>
        <span id="jobstatus_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
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

Voorbeelden van acties bij jobstatus, in YAML:

{% for example in jobstatus_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}De definitie, in YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}
