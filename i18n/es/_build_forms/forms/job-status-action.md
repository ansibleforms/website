---
layout: default
title: Acciones según el estado del trabajo
parent: Formularios
nav_order: 10
translated_from: c374578652c98b4c2c68f068809f16c22e304147
---

# Acciones según el estado del trabajo
{: .no_toc }

Actúa sobre el formulario cuando su trabajo se envía, termina con éxito, falla o finaliza
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign jobstatus_object = form_object.help | where: "name", "Job Status Action" | first %}

{{ jobstatus_object.description | markdownify }}

Están disponibles los siguientes hooks:

- `onSubmit` - se activa al enviar el formulario
- `onSuccess` - se activa cuando el trabajo termina con éxito
- `onFailure` - se activa cuando el trabajo falla
- `onFinish` - se activa cuando el trabajo finaliza, sea cual sea su estado
- `onAbort` - se activa cuando el trabajo se aborta

---

## Atributos

Los atributos de una acción según el estado del trabajo:

<table>
  <thead>
    <tr>
      <th>Atributo</th>
      <th>Comentarios</th>
    </tr>
  </thead>
  <tbody>
    {% for var in jobstatus_object.items %}
    <tr>
      <td>
        <span id="jobstatus_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type}}</span>
        {% if var.required==true %}<span class="af-required"> / obligatorio</span>{% endif %}
        {% if var.unique==true %}<span class="af-unique"> / único</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">añadido en la versión {{var.version}}</span>{% endif %}
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

## Ejemplos

Ejemplos de acciones según el estado del trabajo, en YAML:

{% for example in jobstatus_object.examples %}
### {{ forloop.index }}) {{ example.name }}

{% if example.description %}{{ example.description | markdownify }}{% elsif example.short %}{{ example.short }}{% else %}La definición, en YAML:{% endif %}

```yaml
{{ example.code }}
```
{% endfor %}
