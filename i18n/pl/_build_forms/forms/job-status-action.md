---
layout: default
title: Akcje stanu zadania
parent: Formularze
nav_order: 10
translated_from: c374578652c98b4c2c68f068809f16c22e304147
---

# Akcje stanu zadania
{: .no_toc }

Działania na formularzu, gdy jego zadanie zostaje wysłane, kończy się sukcesem, błędem lub po prostu się kończy
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign jobstatus_object = form_object.help | where: "name", "Job Status Action" | first %}

{{ jobstatus_object.description | markdownify }}

Dostępne są następujące hooki:

- `onSubmit` - wywoływany, gdy formularz zostaje wysłany
- `onSuccess` - wywoływany, gdy zadanie kończy się powodzeniem
- `onFailure` - wywoływany, gdy zadanie kończy się błędem
- `onFinish` - wywoływany, gdy zadanie się kończy, niezależnie od jego stanu
- `onAbort` - wywoływany, gdy zadanie zostaje przerwane

---

## Atrybuty

Atrybuty akcji stanu zadania:

<table>
  <thead>
    <tr>
      <th>Atrybut</th>
      <th>Komentarze</th>
    </tr>
  </thead>
  <tbody>
    {% for var in jobstatus_object.items %}
    <tr>
      <td>
        <span id="jobstatus_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / wymagane</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / unikalne</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">dodano w wersji {{var.version}}</span>{% endif %}
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

## Przykłady

Przykładowe akcje stanu zadania w YAML:

{% for example in jobstatus_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}Definicja w YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}
