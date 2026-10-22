---
layout: default
title: Aktionen bei Jobstatus
parent: Formulare
nav_order: 10
translated_from: c374578652c98b4c2c68f068809f16c22e304147
---

# Aktionen bei Jobstatus
{: .no_toc }

Auf dem Formular reagieren, wenn sein Job abgesendet wird, erfolgreich ist, fehlschlägt oder endet
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign jobstatus_object = form_object.help | where: "name", "Job Status Action" | first %}

{{ jobstatus_object.description | markdownify }}

Folgende Hooks stehen zur Verfügung:

- `onSubmit`: wird ausgelöst, wenn das Formular abgesendet wird
- `onSuccess`: wird ausgelöst, wenn der Job erfolgreich abgeschlossen wird
- `onFailure`: wird ausgelöst, wenn der Job fehlschlägt
- `onFinish`: wird ausgelöst, wenn der Job endet, unabhängig von seinem Status
- `onAbort`: wird ausgelöst, wenn der Job abgebrochen wird

---

## Attribute

Die Attribute einer Aktion bei Jobstatus:

<table>
  <thead>
    <tr>
      <th>Attribut</th>
      <th>Kommentare</th>
    </tr>
  </thead>
  <tbody>
    {% for var in jobstatus_object.items %}
    <tr>
      <td>
        <span id="jobstatus_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / erforderlich</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / eindeutig</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">hinzugefügt in Version {{var.version}}</span>{% endif %}
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

## Beispiele

Beispiele für Aktionen bei Jobstatus, in YAML:

{% for example in jobstatus_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}Die Definition, in YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}
